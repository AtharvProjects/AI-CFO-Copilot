import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';

const txSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Must be a positive amount'),
  description: z.string().min(2, 'Description is required'),
  category: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  payment_mode: z.string().optional(),
});

const TransactionForm = ({ onSuccess, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const txType = watch('type');

  const onSubmit = async (data) => {
    try {
      // Amount is sent as paise to backend
      const payload = { ...data, amount: data.amount * 100 };
      await api.post('/transactions', payload);
      toast.success('Transaction added successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add transaction');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Add Transaction</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4 mb-4">
          <label className="flex-1 cursor-pointer">
            <input type="radio" value="expense" {...register('type')} className="sr-only" />
            <div className={`text-center py-2 rounded-lg font-medium transition-colors ${txType === 'expense' ? 'bg-red-100 text-red-700 border-2 border-red-200' : 'bg-gray-100 text-gray-600 border-2 border-transparent'}`}>
              Expense
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input type="radio" value="income" {...register('type')} className="sr-only" />
            <div className={`text-center py-2 rounded-lg font-medium transition-colors ${txType === 'income' ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-gray-100 text-gray-600 border-2 border-transparent'}`}>
              Income
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Amount (₹)</label>
          <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <input type="text" {...register('description')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input type="date" {...register('date')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Payment Mode</label>
            <select {...register('payment_mode')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Category (Optional)</label>
          <input type="text" {...register('category')} placeholder="Leave blank for AI auto-categorization" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <p className="text-xs text-gray-400 mt-1">If left blank, our AI will automatically assign a category based on the description.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
