from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import get_connection
import oracledb

router = APIRouter()


class AppointmentIn(BaseModel):
    patient_id: int
    doctor_id: int
    appt_date: str    # YYYY-MM-DD
    time_slot: str    # HH:MM


class AppointmentUpdate(BaseModel):
    status: str       # SCHEDULED / COMPLETED / CANCELLED


@router.post("/", status_code=201)
async def book_appointment(appt: AppointmentIn):
    sql = """
        INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
        VALUES (:patient_id, :doctor_id, TO_DATE(:appt_date, 'YYYY-MM-DD'), :time_slot, 'SCHEDULED')
        RETURNING APPT_ID INTO :out_id
    """
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            out_id = cur.var(oracledb.NUMBER)
            await cur.execute(sql, {
                "patient_id": appt.patient_id,
                "doctor_id": appt.doctor_id,
                "appt_date": appt.appt_date,
                "time_slot": appt.time_slot,
                "out_id": out_id,
            })
            await conn.commit()
            new_id = int(out_id.getvalue()[0])
            return {"appt_id": new_id, "message": "Appointment booked successfully."}
    except oracledb.DatabaseError as e:
        error_obj, = e.args
        if error_obj.code == 20001:   # trg_no_double_booking
            raise HTTPException(status_code=409, detail=error_obj.message)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()


@router.get("/")
async def list_appointments(doctor_id: Optional[int] = None, date: Optional[str] = None):
    where_clauses = []
    params: dict = {}
    if doctor_id:
        where_clauses.append("A.DOCTOR_ID = :doctor_id")
        params["doctor_id"] = doctor_id
    if date:
        where_clauses.append("A.APPT_DATE = TO_DATE(:date, 'YYYY-MM-DD')")
        params["date"] = date

    where = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
    sql = f"""
        SELECT A.APPT_ID,
               P.FULL_NAME  AS PATIENT_NAME,
               D.FULL_NAME  AS DOCTOR_NAME,
               DEP.DEPT_NAME,
               TO_CHAR(A.APPT_DATE, 'YYYY-MM-DD') AS APPT_DATE,
               A.TIME_SLOT,
               A.STATUS,
               B.PAYMENT_STATUS,
               B.AMOUNT
          FROM APPOINTMENT A
          JOIN PATIENT     P   ON P.PATIENT_ID = A.PATIENT_ID
          JOIN DOCTOR      D   ON D.DOCTOR_ID  = A.DOCTOR_ID
          JOIN DEPARTMENT  DEP ON DEP.DEPT_ID  = D.DEPT_ID
          LEFT JOIN BILLING B  ON B.APPT_ID    = A.APPT_ID
         {where}
         ORDER BY A.APPT_DATE DESC, A.TIME_SLOT
    """
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute(sql, params)
            cols = [c[0].lower() for c in cur.description]
            rows = await cur.fetchall()
            return [dict(zip(cols, row)) for row in rows]
    finally:
        await conn.close()


@router.patch("/{appt_id}")
async def update_appointment_status(appt_id: int, body: AppointmentUpdate):
    sql = """
        UPDATE APPOINTMENT SET STATUS = :status
         WHERE APPT_ID = :appt_id
    """
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute(sql, {"status": body.status.upper(), "appt_id": appt_id})
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Appointment not found.")
            await conn.commit()
            return {"message": f"Appointment {appt_id} status updated to {body.status}."}
    finally:
        await conn.close()
