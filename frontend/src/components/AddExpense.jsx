import React, { useState } from 'react';
import { api } from '../services/api';
import { PlusCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Others'];

export default function AddExpense({ onExpenseAdded }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' }); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!amount || Number(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount greater than 0.' });
      return;
    }
    if (!description.trim()) {
      setStatus({ type: 'error', message: 'Please enter a description.' });
      return;
    }
    if (!date) {
      setStatus({ type: 'error', message: 'Please pick a valid date.' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: null, message: '' });
      
      const newExpense = {
        amount: Number(amount),
        category,
        description: description.trim(),
        date,
      };

      await api.addExpense(newExpense);
      
      setStatus({ type: 'success', message: 'Expense added successfully!' });
      
      // Reset form
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (err) {
      console.error("Error creating expense:", err);
      setStatus({ type: 'error', message: 'Failed to record expense. Please verify server connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
        
        {/* Title */}
        <div className="mb-6">
          <h2 className="heading-font text-2xl font-extrabold text-slate-900 tracking-tight">Record New Expense</h2>
          <p className="text-slate-500 text-xs mt-1">Input your transaction details to deduct from your balance sheet.</p>
        </div>

        {/* Notifications */}
        {status.type && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold border ${
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount input */}
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
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 font-medium px-4 py-3 pl-8 rounded-xl border border-slate-205 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-3 rounded-xl border border-slate-205 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="e.g., Grocery store, Gas station..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-3 rounded-xl border border-slate-205 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="date">
              Transaction Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-3 rounded-xl border border-slate-205 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-750 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording entry...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Add Expense</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
