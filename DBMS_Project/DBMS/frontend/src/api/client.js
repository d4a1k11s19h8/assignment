import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const getPatients      = () => api.get('/patients');
export const getPatient       = (id) => api.get(`/patients/${id}`);
export const createPatient    = (data) => api.post('/patients', data);

export const getDoctors       = () => api.get('/doctors');
export const getDepartments   = () => api.get('/doctors/departments');
export const getAvailableSlots = (doctorId, date) =>
  api.get(`/doctors/${doctorId}/slots`, { params: { date } });

export const getAppointments  = (params) => api.get('/appointments', { params });
export const bookAppointment  = (data) => api.post('/appointments', data);
export const updateApptStatus = (id, status) => api.patch(`/appointments/${id}`, { status });

export const createPrescription = (data) => api.post('/prescriptions', data);
export const getPrescription    = (apptId) => api.get(`/prescriptions/${apptId}`);

export const getBills         = () => api.get('/billing');
export const getBillingReport = () => api.get('/billing/report');
export const payBill          = (id, data) => api.patch(`/billing/${id}/pay`, data);
