import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlusCircle, Loader2, Calendar, Trash2, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setListLoading(true);
      const data = await api.getIncomes();
      setIncomes(data);
    } catch (err) {
      console.error("Error retrieving incomes:", err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount greater than 0.' });
      return;
    }
    if (!source.trim()) {
      setStatus({ type: 'error', message: 'Please enter a source name.' });
      return;
    }
    if (!date) {
      setStatus({ type: 'error', message: 'Please pick a valid date.' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: null, message: '' });

      const newIncome = {
        amount: Number(amount),
        source: source.trim(),
        date,
      };

      const saved = await api.addIncome(newIncome);
      setIncomes(prev => [saved, ...prev]);
      
      setStatus({ type: 'success', message: 'Income entry added successfully!' });
      setAmount('');
      setSource('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error("Error recording income:", err);
      setStatus({ type: 'error', message: 'Failed to record income. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income entry?")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.deleteIncome(id);
      setIncomes(prev => prev.filter(inc => inc.id !== id));
    } catch (err) {
      console.error("Error deleting income:", err);
      alert("Failed to delete income. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="heading-font text-3xl font-extrabold text-slate-900 tracking-tight">Income Portfolio</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and record liquid earnings and revenue flows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Add Income Entry</h2>
            <p className="text-slate-400 text-xs mt-0.5">Log custom earnings to credit your ledger balance.</p>
          </div>

          {status.type && (
            <div className={`mb-5 p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold border ${
              status.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="amount">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-2.5 pl-8 rounded-xl border border-slate-205 focus:border-blue-605 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="source">
                Income Source
              </label>
              <input
                id="source"
                type="text"
                placeholder="e.g., Salary, Freelance, Dividend..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-2.5 rounded-xl border border-slate-205 focus:border-blue-605 outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="date">
                Received Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-2.5 rounded-xl border border-slate-205 focus:border-blue-605 outline-none transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording credit...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Log Income</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: List (span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[450px]">
          <div className="mb-5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Income Entries</h2>
              <p className="text-slate-405 text-xs">Scrollable ledger of earnings received.</p>
            </div>
            <span className="text-xs bg-slate-50 border border-slate-100 font-bold px-3 py-1 rounded-full text-slate-600">
              {incomes.length} Total
            </span>
          </div>

          {listLoading ? (
            <div className="flex flex-col items-center justify-center h-72 space-y-4">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs">Retrieving credits ledger...</p>
            </div>
          ) : incomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 space-y-3 border-2 border-dashed border-slate-100 rounded-xl">
              <ArrowUpRight className="w-10 h-10 text-slate-300" />
              <h4 className="text-sm font-semibold text-slate-600">No incomes logged</h4>
              <p className="text-xs text-slate-400 max-w-xs text-center px-4">
                Record an income entry using the form on the left to start building your balance sheet.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {incomes.map((inc) => (
                <div 
                  key={inc.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/20 transition-all duration-150"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{inc.source}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(inc.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className="text-base font-extrabold text-emerald-600">
                      +₹{Number(inc.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(inc.id)}
                      disabled={deletingId === inc.id}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors duration-200"
                      title="Delete income entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
