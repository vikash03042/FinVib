import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Trash2, Calendar, AlertCircle, Filter, RotateCcw } from 'lucide-react';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Error retrieving expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...expenses];
    if (startDate) {
      result = result.filter(exp => exp.date >= startDate);
    }
    if (endDate) {
      result = result.filter(exp => exp.date <= endDate);
    }
    setFilteredExpenses(result);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Retrieving transaction ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="heading-font text-3xl font-extrabold text-slate-900 tracking-tight">Expense Register</h1>
        <p className="text-slate-500 text-sm mt-1">Review, filter, and purge items from your history log.</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider">Date Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 hover:text-blue-600 text-xs text-slate-500 font-semibold py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expenses List / Table */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No transactions found</h3>
          <p className="text-xs text-slate-455 max-w-sm">
            {expenses.length === 0 
              ? "You haven't recorded any expenses yet. Head to the 'Add Expense' page to log your first one." 
              : "No expenses match the selected date ranges. Adjust or reset filters above."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(exp.date)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        exp.category === 'Food' ? 'bg-blue-50 text-blue-700' :
                        exp.category === 'Travel' ? 'bg-amber-50 text-amber-700' :
                        exp.category === 'Rent' ? 'bg-purple-50 text-purple-700' :
                        exp.category === 'Shopping' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-semibold max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                      ₹{Number(exp.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors duration-250 disabled:opacity-50"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredExpenses.map((exp) => (
              <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-slate-50/30">
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-medium">{formatDate(exp.date)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.category === 'Food' ? 'bg-blue-50 text-blue-700' :
                      exp.category === 'Travel' ? 'bg-amber-50 text-amber-700' :
                      exp.category === 'Rent' ? 'bg-purple-50 text-purple-700' :
                      exp.category === 'Shopping' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {exp.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{exp.description}</h4>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-base font-extrabold text-slate-900">₹{Number(exp.amount).toFixed(2)}</span>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
