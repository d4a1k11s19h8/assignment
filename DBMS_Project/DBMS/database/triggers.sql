-- ============================================================
-- CLINIC MANAGEMENT SYSTEM - Oracle Triggers
-- ============================================================

-- ── Trigger 1: Prevent Double-Booking ────────────────────────
-- Business Rule: No two appointments for the same doctor may
-- occupy the same date + time slot.
-- (Backs up the UNIQUE constraint with a richer error message.)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE TRIGGER trg_no_double_booking
BEFORE INSERT OR UPDATE ON APPOINTMENT
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
      INTO v_count
      FROM APPOINTMENT
     WHERE DOCTOR_ID  = :NEW.DOCTOR_ID
       AND APPT_DATE  = :NEW.APPT_DATE
       AND TIME_SLOT  = :NEW.TIME_SLOT
       AND STATUS    != 'CANCELLED'
       AND APPT_ID   != NVL(:NEW.APPT_ID, -1);  -- exclude self on UPDATE

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'Double-booking detected: Doctor ID ' || :NEW.DOCTOR_ID ||
            ' already has an appointment on ' ||
            TO_CHAR(:NEW.APPT_DATE, 'YYYY-MM-DD') ||
            ' at ' || :NEW.TIME_SLOT || '.'
        );
    END IF;
END trg_no_double_booking;
/

-- ── Trigger 2: Auto-Create Billing Row on Appointment Insert ─
-- State Automation: Whenever a new APPOINTMENT is inserted,
-- automatically create a corresponding BILLING record with
-- status = 'PENDING' so billing always exists.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE TRIGGER trg_auto_create_billing
AFTER INSERT ON APPOINTMENT
FOR EACH ROW
BEGIN
    INSERT INTO BILLING (APPT_ID, AMOUNT, PAYMENT_STATUS)
    VALUES (:NEW.APPT_ID, 500.00, 'PENDING');
END trg_auto_create_billing;
/

-- ── Trigger 3: Set PAID_AT timestamp when status → PAID ──────
-- State Automation: Record the exact timestamp when a bill
-- transitions to 'PAID'.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE TRIGGER trg_billing_paid_timestamp
BEFORE UPDATE ON BILLING
FOR EACH ROW
BEGIN
    IF :NEW.PAYMENT_STATUS = 'PAID' AND :OLD.PAYMENT_STATUS != 'PAID' THEN
        :NEW.PAID_AT := SYSTIMESTAMP;
    END IF;

    -- If cancelling an appointment, auto-cancel its bill
    IF :NEW.PAYMENT_STATUS = 'CANCELLED' AND :OLD.PAYMENT_STATUS = 'PENDING' THEN
        :NEW.PAID_AT := NULL;
    END IF;
END trg_billing_paid_timestamp;
/

-- ── Trigger 4: Cascade appointment cancellation to billing ───
-- When an appointment is CANCELLED, mark its bill as CANCELLED.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE TRIGGER trg_appt_cancel_billing
AFTER UPDATE ON APPOINTMENT
FOR EACH ROW
BEGIN
    IF :NEW.STATUS = 'CANCELLED' AND :OLD.STATUS != 'CANCELLED' THEN
        UPDATE BILLING
           SET PAYMENT_STATUS = 'CANCELLED'
         WHERE APPT_ID = :NEW.APPT_ID
           AND PAYMENT_STATUS = 'PENDING';
    END IF;
END trg_appt_cancel_billing;
/
