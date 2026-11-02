import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medibook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      // Only redirect if not already on login or register
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthPage && localStorage.getItem('medibook_token')) {
        localStorage.removeItem('medibook_token');
        localStorage.removeItem('medibook_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const appointmentService = {
  getCategories: () => api.get('/categories'),
  getAvailableSlots: (doctor, date) =>
    api.get('/available-slots', { params: { doctor, date } }),
  getMyAppointments: (status, search) =>
    api.get('/appointments', { params: { status, search } }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  getUserDashboardStats: () => api.get('/user/dashboard-stats'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAppointments: (status, date, search) =>
    api.get('/admin/appointments', { params: { status, date, search } }),
  updateStatus: (id, status) =>
    api.put(`/admin/appointments/${id}/status`, { status }),
  resetTestDatabase: () => api.post('/admin/reset-db'),
};

export default api;
