import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Admin API service
const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Doctors Management
  getAllDoctors: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createDoctor: async (doctorData: {
    email: string;
    password: string;
    name: string;
    specialty?: string;
    hospitalIds?: string[];
  }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/admin/doctors`,
      doctorData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  updateDoctorHospitals: async (doctorId: string, hospitalIds: string[]) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_BASE_URL}/admin/doctors/${doctorId}/hospitals`,
      { hospitalIds },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  deleteDoctor: async (doctorId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `${API_BASE_URL}/admin/doctors/${doctorId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Patients (View Only)
  getAllPatients: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin/patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Medicines (View Only)
  getAllMedicines: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin/medicines`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Hospitals
  getAllHospitals: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin/hospitals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export default adminApi;
