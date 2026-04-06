from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import get_connection
import oracledb

router = APIRouter()


class PaymentIn(BaseModel):
    payment_mode: str   # CASH / CARD / UPI / INSURANCE
    amount: Optional[float] = None


@router.get("/report")
async def billing_report():
    """Aggregated billing report: totals by month and payment mode."""
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            # Monthly revenue
            await cur.execute("""
                SELECT TO_CHAR(BILLED_AT, 'YYYY-MM') AS MONTH,
                       SUM(AMOUNT)                   AS TOTAL_BILLED,
                       SUM(CASE WHEN PAYMENT_STATUS = 'PAID'      THEN AMOUNT ELSE 0 END) AS PAID,
                       SUM(CASE WHEN PAYMENT_STATUS = 'PENDING'   THEN AMOUNT ELSE 0 END) AS PENDING,
                       SUM(CASE WHEN PAYMENT_STATUS = 'CANCELLED' THEN AMOUNT ELSE 0 END) AS CANCELLED,
                       COUNT(*)                      AS TOTAL_BILLS
                  FROM BILLING
                 GROUP BY TO_CHAR(BILLED_AT, 'YYYY-MM')
                 ORDER BY MONTH
            """)
            monthly_cols = [c[0].lower() for c in cur.description]
            monthly = [dict(zip(monthly_cols, r)) for r in await cur.fetchall()]

            # By payment mode
            await cur.execute("""
                SELECT NVL(PAYMENT_MODE, 'UNPAID') AS PAYMENT_MODE,
                       COUNT(*)   AS COUNT,
                       SUM(AMOUNT) AS TOTAL
                  FROM BILLING
                 WHERE PAYMENT_STATUS = 'PAID'
                 GROUP BY PAYMENT_MODE
            """)
            mode_cols = [c[0].lower() for c in cur.description]
            by_mode = [dict(zip(mode_cols, r)) for r in await cur.fetchall()]

            # Summary totals
            await cur.execute("""
                SELECT COUNT(*)                                           AS TOTAL_BILLS,
                       SUM(AMOUNT)                                        AS TOTAL_AMOUNT,
                       SUM(CASE WHEN PAYMENT_STATUS='PAID' THEN AMOUNT ELSE 0 END)      AS PAID_AMOUNT,
                       SUM(CASE WHEN PAYMENT_STATUS='PENDING' THEN AMOUNT ELSE 0 END)   AS PENDING_AMOUNT,
                       SUM(CASE WHEN PAYMENT_STATUS='CANCELLED' THEN AMOUNT ELSE 0 END) AS CANCELLED_AMOUNT
                  FROM BILLING
            """)
            sum_cols = [c[0].lower() for c in cur.description]
            summary = dict(zip(sum_cols, await cur.fetchone()))

            return {"summary": summary, "monthly": monthly, "by_payment_mode": by_mode}
    finally:
        await conn.close()


@router.get("/")
async def list_bills():
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT B.BILL_ID, B.APPT_ID,
                       P.FULL_NAME AS PATIENT_NAME,
                       D.FULL_NAME AS DOCTOR_NAME,
                       TO_CHAR(A.APPT_DATE, 'YYYY-MM-DD') AS APPT_DATE,
                       A.TIME_SLOT,
                       B.AMOUNT, B.PAYMENT_MODE, B.PAYMENT_STATUS,
                       TO_CHAR(B.BILLED_AT, 'YYYY-MM-DD HH24:MI') AS BILLED_AT,
                       TO_CHAR(B.PAID_AT,   'YYYY-MM-DD HH24:MI') AS PAID_AT
                  FROM BILLING B
                  JOIN APPOINTMENT A ON A.APPT_ID    = B.APPT_ID
                  JOIN PATIENT     P ON P.PATIENT_ID = A.PATIENT_ID
                  JOIN DOCTOR      D ON D.DOCTOR_ID  = A.DOCTOR_ID
                 ORDER BY B.BILLED_AT DESC
            """)
            cols = [c[0].lower() for c in cur.description]
            return [dict(zip(cols, r)) for r in await cur.fetchall()]
    finally:
        await conn.close()


@router.patch("/{bill_id}/pay")
async def mark_as_paid(bill_id: int, body: PaymentIn):
    conn = await get_connection()
    try:
        async with conn.cursor() as cur:
            extra = ""
            params = {"bill_id": bill_id, "mode": body.payment_mode.upper()}
            if body.amount is not None:
                extra = ", AMOUNT = :amount"
                params["amount"] = body.amount
            await cur.execute(
                f"UPDATE BILLING SET PAYMENT_STATUS = 'PAID', PAYMENT_MODE = :mode{extra}"
                " WHERE BILL_ID = :bill_id",
                params,
            )
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Bill not found.")
            await conn.commit()
            return {"message": f"Bill {bill_id} marked as PAID."}
    finally:
        await conn.close()
