import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401s and auto-refresh the access token silently
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = res.data;
          
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Update the authorization header for the original request and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, clear local storage and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data).then(res => res.data),
  sendOtp: (email) => client.post(`/auth/send-otp?email=${email}`).then(res => res.data),
  login: (credentials) => client.post('/auth/login', credentials).then(res => res.data),
  googleLogin: (idToken) => client.post('/auth/google', { idToken }).then(res => res.data),
  forgotPassword: (email) => client.post(`/auth/forgot-password?email=${email}`).then(res => res.data),
  resetPassword: (data) => client.post('/auth/reset-password', data).then(res => res.data),
  
  // Expenses
  getExpenses: () => client.get('/expenses').then(res => res.data),
  addExpense: (expense) => client.post('/expenses', expense).then(res => res.data),
  deleteExpense: (id) => client.delete(`/expenses/${id}`).then(res => res.data),
  
  // Incomes
  getIncomes: () => client.get('/income').then(res => res.data),
  addIncome: (income) => client.post('/income', income).then(res => res.data),
  deleteIncome: (id) => client.delete(`/income/${id}`).then(res => res.data),
  
  // Dashboard Summary
  getDashboardSummary: () => client.get('/dashboard/summary').then(res => res.data),
  
  // Chatbot
  sendChatMessage: (message) => client.post('/chat', { message }).then(res => res.data),
};

export default api;
