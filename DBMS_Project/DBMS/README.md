# Clinic Management System

A full-stack Clinic Management System built with **Oracle DB → Python (FastAPI) → React (Vite)**.

## Project Structure
```
DBMS/
├── database/
│   ├── schema.sql      # All CREATE TABLE + sequences
│   ├── triggers.sql    # 4 Oracle triggers
│   └── seed.sql        # Demo data
├── backend/
│   ├── main.py         # FastAPI app
│   ├── db.py           # Oracle connection pool
│   ├── routers/        # patients, appointments, prescriptions, billing, doctors
│   ├── .env.example    # Copy to .env with your credentials
│   └── requirements.txt
├── frontend/           # Vite + React SPA
└── docs/
    └── er_diagram_and_schema.md   # ER diagram + normalization proof
```

---

## Running the Application 🚀

### Option A: First-Time Setup (New PC)

**1. Database Initialization (WSL Oracle)**
Ensure you have Oracle installed on WSL.
Open your WSL terminal and initialize the listener and database:
```bash
# Start the Oracle Listener
sudo -u oracle /opt/oracle/product/21c/dbhomeXE/bin/lsnrctl start

# Start the Database Instance
sudo su - oracle
sqlplus / as sysdba
SQL> startup;
SQL> exit;
```
*Next, execute the setup scripts to define the schema and seed the initial data:*
```bash
sqlplus c##my_new_user/your_password@localhost:1539/XEPDB1 @/mnt/c/Users/Daksh/Desktop/DBMS/database/schema.sql
sqlplus c##my_new_user/your_password@localhost:1539/XEPDB1 @/mnt/c/Users/Daksh/Desktop/DBMS/database/triggers.sql
sqlplus c##my_new_user/your_password@localhost:1539/XEPDB1 @/mnt/c/Users/Daksh/Desktop/DBMS/database/seed.sql
```

**2. Backend Setup**
```bash
# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements
cd backend
pip install -r requirements.txt

# Create .env config
copy .env.example .env
# Edit .env with your DB credentials (e.g., DB_DSN=localhost:1539/XEPDB1)
```

**3. Frontend Setup**
```bash
cd frontend
npm install
```

---

### Option B: Running If Already Set Up

**1. Start Oracle Database**
Open WSL and start your listener and database instance if they are not running:
```bash
wsl sudo -u oracle /opt/oracle/product/21c/dbhomeXE/bin/lsnrctl start
wsl sudo su - oracle -c "echo 'startup;' | sqlplus -s / as sysdba"
```

**2. Start Backend API**
Open a new terminal window:
```bash
.\.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload --port 8000
```
*Swagger documentation available at: **[http://localhost:8000/docs](http://localhost:8000/docs)***

**3. Start Frontend Client**
Open a new terminal window:
```bash
cd frontend
npm run dev
```
*Frontend running at: **[http://localhost:5173](http://localhost:5173)***

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/patients` | Register patient |
| GET | `/patients` | List patients |
| GET | `/doctors` | List doctors |
| GET | `/doctors/departments` | List departments |
| GET | `/doctors/{id}/slots?date=YYYY-MM-DD` | Available slots |
| POST | `/appointments` | Book appointment |
| GET | `/appointments` | List appointments |
| PATCH | `/appointments/{id}` | Update status |
| POST | `/prescriptions` | Create prescription |
| GET | `/prescriptions/{appt_id}` | Get prescription |
| GET | `/billing` | List all bills |
| GET | `/billing/report` | Aggregated report |
| PATCH | `/billing/{id}/pay` | Mark as PAID |

---

## Triggers Summary

| Trigger | Type | Rule |
|---------|------|------|
| `trg_no_double_booking` | BEFORE INSERT/UPDATE | Prevents same doctor+date+slot booking |
| `trg_auto_create_billing` | AFTER INSERT | Auto-creates BILLING row for every appointment |
| `trg_billing_paid_timestamp` | BEFORE UPDATE | Sets PAID_AT timestamp when status → PAID |
| `trg_appt_cancel_billing` | AFTER UPDATE | Cancels pending bill when appointment cancelled |
