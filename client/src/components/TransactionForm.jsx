import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import { IndianRupee, Tag, FileText, Calendar, Wallet, Check, AlertCircle, Percent, Globe, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

const txSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Must be a positive amount'),
  description: z.string().min(2, 'Description is required'),
  category: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  payment_mode: z.string().optional(),
  gst_rate: z.number().min(0).max(1).optional(),
  is_inter_state: z.boolean().optional(),
});

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const isEditing = !!transaction;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      gst_rate: 0.18,
      is_inter_state: false,
      payment_mode: 'UPI'
    }
  });

  useEffect(() => {
    if (transaction) {
      reset({
        ...transaction,
        amount: transaction.amount / 100, // convert paise to rupees
        date: new Date(transaction.date).toISOString().split('T')[0],
        gst_rate: transaction.gst_rate || 0.18,
        is_inter_state: !!transaction.is_inter_state,
        payment_mode: transaction.payment_mode || 'UPI'
      });
    }
  }, [transaction, reset]);

  const txType = watch('type');
  const gstRate = watch('gst_rate');

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, amount: Math.round(data.amount * 100) };
      if (isEditing) {
        await api.put(`/transactions/${transaction.id}`, payload);
        toast.success('Ledger record updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('New entry committed to ledger');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save transaction');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 font-sans">
      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <label className="flex-1 cursor-pointer">
          <input type="radio" value="expense" {...register('type')} className="sr-only" />
          <div className={cn(
            "text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            txType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          )}>
            Outflow
          </div>
        </label>
        <label className="flex-1 cursor-pointer">
          <input type="radio" value="income" {...register('type')} className="sr-only" />
          <div className={cn(
            "text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            txType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          )}>
            Inflow
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Amount Field */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Value (INR)</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
            <input 
              type="number" 
              step="0.01" 
              {...register('amount', { valueAsNumber: true })} 
              className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none text-2xl font-black text-slate-900 focus:ring-4 ring-indigo-500/10 transition-all placeholder:text-slate-200"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.amount.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Counterparty</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              {...register('description')} 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
              placeholder="e.g. AWS Cloud Hosting, Client Retainer..."
            />
          </div>
          {errors.description && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.description.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Tag</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              {...register('category')} 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
              placeholder="AI Auto-Detecting..."
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Instrument</label>
          <div className="relative">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
              {...register('payment_mode')} 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all appearance-none"
            >
              <option value="UPI">Unified Payments (UPI)</option>
              <option value="Bank Transfer">NEFT/IMPS/RTGS</option>
              <option value="Cash">Physical Cash</option>
              <option value="Card">Credit/Debit Card</option>
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="date" 
              {...register('date')} 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
            />
          </div>
        </div>

        {/* GST Settings */}
        <div className="bg-indigo-600/5 p-6 rounded-[2rem] border border-indigo-100/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Percent size={14} className="text-indigo-600" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tax Integration</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_inter_state')} className="rounded border-slate-300 text-indigo-600 focus:ring-0" />
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-tighter flex items-center gap-1">
                <Globe size={10} /> IGST
              </span>
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {[0, 0.05, 0.12, 0.18, 0.28].map(rate => (
              <label key={rate} className="flex-1 min-w-[50px] cursor-pointer">
                <input type="radio" value={rate} {...register('gst_rate', { valueAsNumber: true })} className="sr-only" />
                <div className={cn(
                  "text-center py-2 rounded-xl text-[10px] font-black transition-all",
                  gstRate === rate ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-400 hover:bg-indigo-50'
                )}>
                  {rate * 100}%
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <>
              {isEditing ? 'Commit Update' : 'Initialize Record'} <Check size={18} className="text-emerald-400" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
