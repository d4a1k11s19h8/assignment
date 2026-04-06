from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import patients, appointments, prescriptions, billing, doctors

app = FastAPI(
    title="Clinic Management System API",
    description="REST API for managing patients, appointments, prescriptions, and billing.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router,      prefix="/patients",      tags=["Patients"])
app.include_router(doctors.router,       prefix="/doctors",       tags=["Doctors"])
app.include_router(appointments.router,  prefix="/appointments",  tags=["Appointments"])
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescriptions"])
app.include_router(billing.router,       prefix="/billing",       tags=["Billing"])


@app.get("/", tags=["Health"])
async def root():
    return {"message": "Clinic Management System API", "status": "running"}
