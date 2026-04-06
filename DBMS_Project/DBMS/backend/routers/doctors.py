from fastapi import APIRouter
from db import get_connection

router = APIRouter()


@router.get("/")
async def list_doctors():
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT D.DOCTOR_ID, D.FULL_NAME, D.SPECIALIZATION,
                       D.PHONE, D.EMAIL,
                       DEP.DEPT_ID, DEP.DEPT_NAME
                  FROM DOCTOR D
                  JOIN DEPARTMENT DEP ON DEP.DEPT_ID = D.DEPT_ID
                 ORDER BY D.FULL_NAME
            """)
            cols = [c[0].lower() for c in cur.description]
            return [dict(zip(cols, r)) for r in await cur.fetchall()]
    finally:
        await conn.close()


@router.get("/departments")
async def list_departments():
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT D.DEPT_ID, D.DEPT_NAME,
                       DOC.FULL_NAME AS HEAD_DOCTOR_NAME
                  FROM DEPARTMENT D
                  LEFT JOIN DOCTOR DOC ON DOC.DOCTOR_ID = D.HEAD_DOCTOR_ID
                 ORDER BY D.DEPT_NAME
            """)
            cols = [c[0].lower() for c in cur.description]
            return [dict(zip(cols, r)) for r in await cur.fetchall()]
    finally:
        await conn.close()


@router.get("/{doctor_id}/slots")
async def available_slots(doctor_id: int, date: str):
    """Return available time slots for a doctor on a given date (YYYY-MM-DD)."""
    all_slots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    ]
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                """SELECT TIME_SLOT FROM APPOINTMENT
                    WHERE DOCTOR_ID = :doc_id
                      AND APPT_DATE = TO_DATE(:date, 'YYYY-MM-DD')
                      AND STATUS != 'CANCELLED'""",
                {"doc_id": doctor_id, "date": date},
            )
            booked = {r[0] for r in await cur.fetchall()}
            available = [s for s in all_slots if s not in booked]
            return {"doctor_id": doctor_id, "date": date, "available_slots": available}
    finally:
        await conn.close()
