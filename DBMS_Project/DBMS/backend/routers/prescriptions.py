from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from db import get_connection
import oracledb

router = APIRouter()


class MedicationIn(BaseModel):
    drug_name: str
    dosage: str
    frequency: str
    duration: str


class PrescriptionIn(BaseModel):
    appt_id: int
    notes: str = ""
    medications: List[MedicationIn]


@router.post("/", status_code=201)
async def create_prescription(rx: PrescriptionIn):
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            # Insert prescription
            out_rx_id = cur.var(oracledb.NUMBER)
            await cur.execute(
                """INSERT INTO PRESCRIPTION (APPT_ID, NOTES)
                   VALUES (:appt_id, :notes)
                   RETURNING PRESCRIPTION_ID INTO :out_id""",
                {"appt_id": rx.appt_id, "notes": rx.notes, "out_id": out_rx_id},
            )
            rx_id = int(out_rx_id.getvalue()[0])

            # Insert medications
            for med in rx.medications:
                await cur.execute(
                    """INSERT INTO MEDICATION (PRESCRIPTION_ID, DRUG_NAME, DOSAGE, FREQUENCY, DURATION)
                       VALUES (:rx_id, :drug_name, :dosage, :frequency, :duration)""",
                    {
                        "rx_id": rx_id,
                        "drug_name": med.drug_name,
                        "dosage": med.dosage,
                        "frequency": med.frequency,
                        "duration": med.duration,
                    },
                )

            # Mark appointment as COMPLETED
            await cur.execute(
                "UPDATE APPOINTMENT SET STATUS = 'COMPLETED' WHERE APPT_ID = :appt_id",
                {"appt_id": rx.appt_id},
            )
            await conn.commit()
            return {"prescription_id": rx_id, "message": "Prescription created successfully."}
    except oracledb.IntegrityError as e:
        raise HTTPException(status_code=409, detail=f"Prescription already exists for this appointment: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()


@router.get("/{appt_id}")
async def get_prescription(appt_id: int):
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                """SELECT P.PRESCRIPTION_ID, P.APPT_ID, P.NOTES,
                          TO_CHAR(P.PRESCRIBED_AT, 'YYYY-MM-DD HH24:MI') AS PRESCRIBED_AT
                     FROM PRESCRIPTION P WHERE P.APPT_ID = :appt_id""",
                {"appt_id": appt_id},
            )
            cols = [c[0].lower() for c in cur.description]
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="No prescription for this appointment.")
            rx = dict(zip(cols, row))

            await cur.execute(
                """SELECT MED_ID, DRUG_NAME, DOSAGE, FREQUENCY, DURATION
                     FROM MEDICATION WHERE PRESCRIPTION_ID = :rx_id""",
                {"rx_id": rx["prescription_id"]},
            )
            med_cols = [c[0].lower() for c in cur.description]
            meds = [dict(zip(med_cols, m)) for m in await cur.fetchall()]
            rx["medications"] = meds
            return rx
    finally:
        await conn.close()
