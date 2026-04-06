-- ============================================================
-- CLINIC MANAGEMENT SYSTEM - Seed / Demo Data
-- ============================================================

-- ── Departments (head set to NULL initially) ─────────────────
INSERT INTO DEPARTMENT (DEPT_NAME) VALUES ('Cardiology');
INSERT INTO DEPARTMENT (DEPT_NAME) VALUES ('Orthopedics');
INSERT INTO DEPARTMENT (DEPT_NAME) VALUES ('Neurology');
INSERT INTO DEPARTMENT (DEPT_NAME) VALUES ('General Medicine');
INSERT INTO DEPARTMENT (DEPT_NAME) VALUES ('Pediatrics');

-- ── Doctors ──────────────────────────────────────────────────
INSERT INTO DOCTOR (FULL_NAME, SPECIALIZATION, PHONE, EMAIL, DEPT_ID)
VALUES ('Dr. Aisha Patel',    'Cardiologist',     '9876000001', 'aisha.patel@clinic.com',    1);
INSERT INTO DOCTOR (FULL_NAME, SPECIALIZATION, PHONE, EMAIL, DEPT_ID)
VALUES ('Dr. Rohan Mehta',    'Orthopedic Surgeon','9876000002','rohan.mehta@clinic.com',    2);
INSERT INTO DOCTOR (FULL_NAME, SPECIALIZATION, PHONE, EMAIL, DEPT_ID)
VALUES ('Dr. Priya Sharma',   'Neurologist',      '9876000003', 'priya.sharma@clinic.com',   3);
INSERT INTO DOCTOR (FULL_NAME, SPECIALIZATION, PHONE, EMAIL, DEPT_ID)
VALUES ('Dr. Vijay Nair',     'General Physician','9876000004', 'vijay.nair@clinic.com',     4);
INSERT INTO DOCTOR (FULL_NAME, SPECIALIZATION, PHONE, EMAIL, DEPT_ID)
VALUES ('Dr. Kavya Rao',      'Pediatrician',     '9876000005', 'kavya.rao@clinic.com',      5);
INSERT INTO DOCTOR (FULL_NAME, SPECIALIZATION, PHONE, EMAIL, DEPT_ID)
VALUES ('Dr. Arjun Singh',    'Cardiologist',     '9876000006', 'arjun.singh@clinic.com',    1);

-- Set department heads
UPDATE DEPARTMENT SET HEAD_DOCTOR_ID = 1 WHERE DEPT_ID = 1;
UPDATE DEPARTMENT SET HEAD_DOCTOR_ID = 2 WHERE DEPT_ID = 2;
UPDATE DEPARTMENT SET HEAD_DOCTOR_ID = 3 WHERE DEPT_ID = 3;
UPDATE DEPARTMENT SET HEAD_DOCTOR_ID = 4 WHERE DEPT_ID = 4;
UPDATE DEPARTMENT SET HEAD_DOCTOR_ID = 5 WHERE DEPT_ID = 5;

-- ── Non-clinical Staff ────────────────────────────────────────
INSERT INTO STAFF (FULL_NAME, ROLE, PHONE, DEPT_ID)
VALUES ('Meena Rajesh',  'Receptionist', '9870000001', 4);
INSERT INTO STAFF (FULL_NAME, ROLE, PHONE, DEPT_ID)
VALUES ('Sanjay Kumar',  'Lab Technician','9870000002', 1);
INSERT INTO STAFF (FULL_NAME, ROLE, PHONE, DEPT_ID)
VALUES ('Lakshmi Devi',  'Pharmacist',   '9870000003', 4);

-- ── Patients ─────────────────────────────────────────────────
INSERT INTO PATIENT (FULL_NAME, DATE_OF_BIRTH, GENDER, PHONE, EMAIL, ADDRESS)
VALUES ('Rahul Gupta',    DATE '1990-05-14', 'M', '9900000001', 'rahul.g@mail.com',  '12 MG Road, Bengaluru');
INSERT INTO PATIENT (FULL_NAME, DATE_OF_BIRTH, GENDER, PHONE, EMAIL, ADDRESS)
VALUES ('Sunita Sharma',  DATE '1985-11-02', 'F', '9900000002', 'sunita.s@mail.com', '45 Ring Road, Delhi');
INSERT INTO PATIENT (FULL_NAME, DATE_OF_BIRTH, GENDER, PHONE, EMAIL, ADDRESS)
VALUES ('Amit Verma',     DATE '1978-03-22', 'M', '9900000003', 'amit.v@mail.com',   '7 Lake View, Mumbai');
INSERT INTO PATIENT (FULL_NAME, DATE_OF_BIRTH, GENDER, PHONE, EMAIL, ADDRESS)
VALUES ('Divya Nair',     DATE '2005-07-30', 'F', '9900000004', 'divya.n@mail.com',  '88 Park Street, Chennai');
INSERT INTO PATIENT (FULL_NAME, DATE_OF_BIRTH, GENDER, PHONE, EMAIL, ADDRESS)
VALUES ('Karan Singh',    DATE '1995-01-11', 'M', '9900000005', 'karan.s@mail.com',  '3 Civil Lines, Jaipur');

-- ── Appointments (billing auto-created by trigger) ───────────
INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
VALUES (1, 1, DATE '2026-04-05', '09:00', 'SCHEDULED');
INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
VALUES (2, 4, DATE '2026-04-05', '10:00', 'SCHEDULED');
INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
VALUES (3, 2, DATE '2026-04-06', '11:30', 'SCHEDULED');
INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
VALUES (4, 5, DATE '2026-04-06', '09:30', 'COMPLETED');
INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
VALUES (5, 3, DATE '2026-04-07', '14:00', 'SCHEDULED');
INSERT INTO APPOINTMENT (PATIENT_ID, DOCTOR_ID, APPT_DATE, TIME_SLOT, STATUS)
VALUES (1, 4, DATE '2026-04-08', '15:00', 'COMPLETED');

-- ── Medical Records (for completed appointments) ──────────────
INSERT INTO MEDICAL_RECORD (APPT_ID, SYMPTOMS, DIAGNOSIS, TREATMENT_NOTES)
VALUES (4, 'Fever, sore throat', 'Viral Pharyngitis', 'Rest, fluids, paracetamol');
INSERT INTO MEDICAL_RECORD (APPT_ID, SYMPTOMS, DIAGNOSIS, TREATMENT_NOTES)
VALUES (6, 'Chest pain, breathlessness', 'Costochondritis', 'NSAIDs, physiotherapy');

-- ── Prescriptions + Medications ───────────────────────────────
INSERT INTO PRESCRIPTION (APPT_ID, NOTES)
VALUES (4, 'Take medications with food. Follow up in 5 days if no improvement.');

INSERT INTO MEDICATION (PRESCRIPTION_ID, DRUG_NAME, DOSAGE, FREQUENCY, DURATION)
VALUES (1, 'Paracetamol', '500mg', 'Three times daily', '5 days');
INSERT INTO MEDICATION (PRESCRIPTION_ID, DRUG_NAME, DOSAGE, FREQUENCY, DURATION)
VALUES (1, 'Cetirizine',  '10mg',  'Once at night',     '5 days');

INSERT INTO PRESCRIPTION (APPT_ID, NOTES)
VALUES (6, 'Avoid heavy lifting. Apply ice pack for 20 min twice daily.');

INSERT INTO MEDICATION (PRESCRIPTION_ID, DRUG_NAME, DOSAGE, FREQUENCY, DURATION)
VALUES (2, 'Ibuprofen',   '400mg', 'Twice daily after meals', '7 days');
INSERT INTO MEDICATION (PRESCRIPTION_ID, DRUG_NAME, DOSAGE, FREQUENCY, DURATION)
VALUES (2, 'Pantoprazole','40mg',  'Once before breakfast',   '7 days');

-- ── Update billing for completed appointments ─────────────────
UPDATE BILLING SET PAYMENT_STATUS = 'PAID', PAYMENT_MODE = 'UPI',  AMOUNT = 800.00
WHERE APPT_ID = 4;
UPDATE BILLING SET PAYMENT_STATUS = 'PAID', PAYMENT_MODE = 'CARD', AMOUNT = 1200.00
WHERE APPT_ID = 6;

COMMIT;
