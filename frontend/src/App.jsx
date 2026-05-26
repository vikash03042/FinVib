import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import IncomePage from './components/IncomePage';
import Chatbot from './components/Chatbot';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  TrendingUp, 
  MessageSquareCode, 
  Menu, 
  X, 
  Coins, 
  PiggyBank 
} from 'lucide-react';

export default function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    );
  }

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Add Expense', id: 'add-expense', icon: PlusCircle },
    { name: 'Expense List', id: 'expense-list', icon: List },
    { name: 'Income Manager', id: 'income', icon: TrendingUp },
    { name: 'AI Chat Assistant', id: 'chatbot', icon: MessageSquareCode },
  ];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'add-expense':
        return <AddExpense onExpenseAdded={() => setActiveTab('dashboard')} />;
      case 'expense-list':
        return <ExpenseList />;
      case 'income':
        return <IncomePage />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
        
        {/* Mobile Top Header */}
        <header className="bg-white border-b border-slate-100 px-5 py-4 flex md:hidden items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="heading-font font-extrabold text-slate-900 text-lg tracking-tight">FinVibe</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[60px] bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)}>
            <nav className="bg-white px-5 py-6 space-y-2.5 border-b border-slate-100 shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-455'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-150 h-screen sticky top-0 flex-shrink-0 z-30 select-none">
          {/* Brand / Logo */}
          <div className="px-6 py-6.5 flex items-center space-x-3.5 border-b border-slate-100">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10 flex-shrink-0">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="heading-font font-black text-xl text-slate-900 tracking-tight leading-none">FinVibe</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Smart Tracking</span>
            </div>
          </div>

          {/* Navigation list */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4.5 py-3 rounded-xl text-sm font-bold transition-all duration-250 transform ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 font-extrabold translate-x-1' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-5 border-t border-slate-100 text-center">
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Coins className="w-3.5 h-3.5 text-blue-600" />
              <span>Phase 1 Sandbox</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-4 md:px-10 py-6 md:py-8 max-w-6xl mx-auto w-full overflow-x-hidden">
          {renderActivePage()}
        </main>

      </div>
    </PrivateRoute>
  );
}
