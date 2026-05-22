import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
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
