import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Wallet, ArrowDownRight, ArrowUpRight, Calendar, Landmark } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Others'];

export default function Dashboard({ setActiveTab }) {
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    weeklyExpense: 0,
    monthlyExpense: 0,
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumData, expData] = await Promise.all([
        api.getDashboardSummary(),
        api.getExpenses()
      ]);
      setSummary(sumData);
      setExpenses(expData);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process category data for Pie Chart
  const getCategoryData = () => {
    const counts = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    expenses.forEach(exp => {
      const cat = CATEGORIES.includes(exp.category) ? exp.category : 'Others';
      counts[cat] += Number(exp.amount);
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: Number(counts[key].toFixed(2)),
    })).filter(item => item.value > 0);
  };

  // Process weekly data for Bar Chart (Last 7 Days)
  const getWeeklyData = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create last 7 days placeholder
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: weekdays[d.getDay()],
        amount: 0,
      });
    }

    expenses.forEach(exp => {
      const match = days.find(day => day.dateStr === exp.date);
      if (match) {
        match.amount += Number(exp.amount);
      }
    });

    return days.map(day => ({
      name: day.dayName,
      amount: Number(day.amount.toFixed(2)),
    }));
  };

  const categoryData = getCategoryData();
  const weeklyData = getWeeklyData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading finance details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome & Time Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="heading-font text-3xl font-extrabold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor, categorize, and forecast your spending patterns.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-xs font-semibold text-slate-600 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-lg shadow-blue-900/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-blue-100">Total Balance</span>
            <div className="p-2 bg-blue-600/30 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-100" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="heading-font text-3xl font-extrabold tracking-tight">
              ₹{summary.totalBalance.toFixed(2)}
            </h2>
            <p className="text-xs text-blue-200 mt-2 flex items-center">
              Available liquid funds
            </p>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-500">Total Income</span>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="heading-font text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{summary.totalIncome.toFixed(2)}
            </h2>
            <p className="text-xs text-slate-400 mt-2 flex items-center">
              All-time earnings credit
            </p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-500">Total Expense</span>
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="heading-font text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{summary.totalExpense.toFixed(2)}
            </h2>
            <p className="text-xs text-slate-400 mt-2 flex items-center">
              All-time debit expenditure
            </p>
          </div>
        </div>
      </div>

      {/* Sub-summaries: Weekly & Monthly expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-150 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Weekly Expense Summary</span>
            <h3 className="text-xl font-bold text-slate-800">₹{summary.weeklyExpense.toFixed(2)}</h3>
            <span className="text-xs text-slate-500">Last 7 days of rolling debit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-150 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Monthly Expense Summary</span>
            <h3 className="text-xl font-bold text-slate-800">₹{summary.monthlyExpense.toFixed(2)}</h3>
            <span className="text-xs text-slate-500">Current calendar month total</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Spending Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Weekly Expense Trend</h3>
            <p className="text-xs text-slate-455">Expenses incurred over the last 7 days</p>
          </div>
          <div className="h-72 w-full">
            {expenses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expense data recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Category-Wise Spend</h3>
            <p className="text-xs text-slate-455">Expense share by category classification</p>
          </div>
          <div className="h-72 w-full flex flex-col md:flex-row items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expenses registered.
              </div>
            ) : (
              <>
                <div className="h-48 w-48 md:h-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center space-y-3 mt-4 md:mt-0 px-2">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span>{entry.name}</span>
                      </div>
                      <span className="text-slate-500">₹{entry.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Helper Navigation Action Prompt */}
      {expenses.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center text-sm text-blue-800">
          <p className="font-semibold">Ready to get started?</p>
          <p className="text-xs text-blue-600 mt-1 mb-3">Add some financial information to see charts and analytics update in real time.</p>
          <button 
            onClick={() => setActiveTab('add-expense')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
          >
            Add Your First Expense
          </button>
        </div>
      )}
    </div>
  );
}
