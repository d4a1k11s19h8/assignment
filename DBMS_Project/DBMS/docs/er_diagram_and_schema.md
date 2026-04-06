# ER Diagram & Schema Documentation
# Clinic Management System

## Mermaid ER Diagram

```mermaid
erDiagram
    PATIENT {
        NUMBER patient_id PK
        VARCHAR2 full_name
        DATE date_of_birth
        CHAR gender
        VARCHAR2 phone UK
        VARCHAR2 email UK
        VARCHAR2 address
        TIMESTAMP registered_at
    }
    DEPARTMENT {
        NUMBER dept_id PK
        VARCHAR2 dept_name UK
        NUMBER head_doctor_id FK
    }
    DOCTOR {
        NUMBER doctor_id PK
        VARCHAR2 full_name
        VARCHAR2 specialization
        VARCHAR2 phone UK
        VARCHAR2 email UK
        NUMBER dept_id FK
    }
    STAFF {
        NUMBER staff_id PK
        VARCHAR2 full_name
        VARCHAR2 role
        VARCHAR2 phone UK
        NUMBER dept_id FK
    }
    APPOINTMENT {
        NUMBER appt_id PK
        NUMBER patient_id FK
        NUMBER doctor_id FK
        DATE appt_date
        VARCHAR2 time_slot
        VARCHAR2 status
        TIMESTAMP created_at
    }
    MEDICAL_RECORD {
        NUMBER record_id PK
        NUMBER appt_id FK UK
        VARCHAR2 symptoms
        VARCHAR2 diagnosis
        VARCHAR2 treatment_notes
        TIMESTAMP recorded_at
    }
    PRESCRIPTION {
        NUMBER prescription_id PK
        NUMBER appt_id FK UK
        VARCHAR2 notes
        TIMESTAMP prescribed_at
    }
    MEDICATION {
        NUMBER med_id PK
        NUMBER prescription_id FK
        VARCHAR2 drug_name
        VARCHAR2 dosage
        VARCHAR2 frequency
        VARCHAR2 duration
    }
    BILLING {
        NUMBER bill_id PK
        NUMBER appt_id FK UK
        NUMBER amount
        VARCHAR2 payment_mode
        VARCHAR2 payment_status
        TIMESTAMP billed_at
        TIMESTAMP paid_at
    }

    PATIENT        ||--o{ APPOINTMENT   : "books"
    DOCTOR         ||--o{ APPOINTMENT   : "attends"
    DEPARTMENT     ||--o{ DOCTOR        : "employs"
    DEPARTMENT     ||--o{ STAFF         : "employs"
    DEPARTMENT     }o--o| DOCTOR        : "headed by"
    APPOINTMENT    ||--o| MEDICAL_RECORD: "produces"
    APPOINTMENT    ||--o| PRESCRIPTION  : "generates"
    PRESCRIPTION   ||--o{ MEDICATION    : "contains"
    APPOINTMENT    ||--|| BILLING       : "billed as"
```

---

## Relational Schema

| Table | Primary Key | Foreign Keys | Notable Constraints |
|---|---|---|---|
| `PATIENT` | `patient_id` | — | `UNIQUE(phone)`, `UNIQUE(email)`, `CHECK(gender IN ('M','F','O'))` |
| `DEPARTMENT` | `dept_id` | `head_doctor_id → DOCTOR` | `UNIQUE(dept_name)` |
| `DOCTOR` | `doctor_id` | `dept_id → DEPARTMENT` | `UNIQUE(phone)`, `UNIQUE(email)` |
| `STAFF` | `staff_id` | `dept_id → DEPARTMENT` | `UNIQUE(phone)` |
| `APPOINTMENT` | `appt_id` | `patient_id → PATIENT`, `doctor_id → DOCTOR` | `UNIQUE(doctor_id, appt_date, time_slot)`, `CHECK(status)` |
| `MEDICAL_RECORD` | `record_id` | `appt_id → APPOINTMENT` | `UNIQUE(appt_id)` (1-to-1) |
| `PRESCRIPTION` | `prescription_id` | `appt_id → APPOINTMENT` | `UNIQUE(appt_id)` (1-to-1) |
| `MEDICATION` | `med_id` | `prescription_id → PRESCRIPTION` | `NOT NULL` on drug_name, dosage, frequency, duration |
| `BILLING` | `bill_id` | `appt_id → APPOINTMENT` | `UNIQUE(appt_id)`, `CHECK(payment_status)`, `CHECK(amount >= 0)` |

---

## Normalization Proof

### First Normal Form (1NF)
- All attributes hold **atomic** values — no multi-valued or composite columns.
- Each table has a **unique primary key**.
- No repeating groups. Medications are broken out into their own `MEDICATION` table keyed by `prescription_id`.

**✅ All tables satisfy 1NF.**

### Second Normal Form (2NF)
Every non-key attribute must be **fully functionally dependent** on the entire primary key.  
All tables use **single-column surrogate PKs** (sequences), so partial dependency is impossible by construction.

**✅ All tables satisfy 2NF.**

### Third Normal Form (3NF)
No transitive dependencies (non-key → non-key → PK):

- `BILLING` stores only `appt_id`. Patient name/doctor name come via joins, not stored redundantly.
- `APPOINTMENT` stores only `patient_id` and `doctor_id` FKs, not names or dept info.
- `MEDICATION` depends solely on `med_id`; all columns describe the medication, not the prescription or patient.
- `DOCTOR.dept_id` determines the department, but department details live only in `DEPARTMENT`.

**✅ All tables satisfy 3NF.**

### BCNF Considerations
A table is in Boyce-Codd Normal Form (BCNF) if, for every functional dependency X → Y, X is a **superkey**.

**Potential case: `APPOINTMENT.UNIQUE(doctor_id, appt_date, time_slot)`**  
- The compound candidate key `(doctor_id, appt_date, time_slot)` functionally determines `appt_id`.
- The sole non-trivial FD is `appt_id → {patient_id, doctor_id, appt_date, time_slot, status}`.
- Since `appt_id` is the PK (a superkey), this satisfies BCNF.

**Potential case: `DEPARTMENT.head_doctor_id → dept_id`**  
- A department head is always a doctor of that department.
- We could argue `head_doctor_id →  dept_id`, but since `head_doctor_id` is nullable and `dept_id` is the PK, this is not a violating FD (nullable FKs are not considered determinants).

**✅ All tables satisfy BCNF.**

---

## Functional Dependencies Summary

```
PATIENT:       patient_id → {full_name, dob, gender, phone, email, address, registered_at}
DEPARTMENT:    dept_id → {dept_name, head_doctor_id}
DOCTOR:        doctor_id → {full_name, specialization, phone, email, dept_id}
STAFF:         staff_id → {full_name, role, phone, dept_id}
APPOINTMENT:   appt_id → {patient_id, doctor_id, appt_date, time_slot, status, created_at}
               (doctor_id, appt_date, time_slot) → appt_id  [candidate key]
MEDICAL_RECORD: record_id → {appt_id, symptoms, diagnosis, treatment_notes, recorded_at}
               appt_id → record_id  [candidate key — 1:1 with APPOINTMENT]
PRESCRIPTION:  prescription_id → {appt_id, notes, prescribed_at}
               appt_id → prescription_id  [candidate key]
MEDICATION:    med_id → {prescription_id, drug_name, dosage, frequency, duration}
BILLING:       bill_id → {appt_id, amount, payment_mode, payment_status, billed_at, paid_at}
               appt_id → bill_id  [candidate key]
```
