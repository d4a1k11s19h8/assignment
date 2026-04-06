from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from db import get_connection
import oracledb

router = APIRouter()


class PatientIn(BaseModel):
    full_name: str
    date_of_birth: str   # YYYY-MM-DD
    gender: str           # M / F / O
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None


@router.post("/", status_code=201)
async def register_patient(patient: PatientIn):
    sql = """
        INSERT INTO PATIENT (FULL_NAME, DATE_OF_BIRTH, GENDER, PHONE, EMAIL, ADDRESS)
        VALUES (:full_name, TO_DATE(:dob, 'YYYY-MM-DD'), :gender, :phone, :email, :address)
        RETURNING PATIENT_ID INTO :out_id
    """
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            out_id = cur.var(oracledb.NUMBER)
            await cur.execute(sql, {
                "full_name": patient.full_name,
                "dob": patient.date_of_birth,
                "gender": patient.gender.upper(),
                "phone": patient.phone,
                "email": patient.email,
                "address": patient.address,
                "out_id": out_id,
            })
            await conn.commit()
            new_id = int(out_id.getvalue()[0])
            return {"patient_id": new_id, "message": "Patient registered successfully."}
    except oracledb.IntegrityError as e:
        raise HTTPException(status_code=409, detail=f"Duplicate entry: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()


@router.get("/")
async def list_patients():
    sql = """
        SELECT PATIENT_ID, FULL_NAME,
               TO_CHAR(DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH,
               GENDER, PHONE, EMAIL, ADDRESS,
               TO_CHAR(REGISTERED_AT, 'YYYY-MM-DD HH24:MI') AS REGISTERED_AT
          FROM PATIENT
         ORDER BY REGISTERED_AT DESC
    """
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute(sql)
            cols = [c[0].lower() for c in cur.description]
            rows = await cur.fetchall()
            return [dict(zip(cols, row)) for row in rows]
    finally:
        await conn.close()


@router.get("/{patient_id}")
async def get_patient(patient_id: int):
    sql = """
        SELECT PATIENT_ID, FULL_NAME,
               TO_CHAR(DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH,
               GENDER, PHONE, EMAIL, ADDRESS,
               TO_CHAR(REGISTERED_AT, 'YYYY-MM-DD HH24:MI') AS REGISTERED_AT
          FROM PATIENT WHERE PATIENT_ID = :id
    """
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute(sql, {"id": patient_id})
            cols = [c[0].lower() for c in cur.description]
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Patient not found.")
            return dict(zip(cols, row))
    finally:
        await conn.close()
