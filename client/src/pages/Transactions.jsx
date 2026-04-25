import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, Upload, Filter, Search, Download, Trash2, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, FileSpreadsheet, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionForm from '../components/TransactionForm';
import { motion, AnimatePresence } from 'framer-motion';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 12, type: '', search: '' });
  const [total, setTotal] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions', { params: filters });
      setTransactions(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('csv', file);

    const loadToast = toast.loading('Intelligence: Processing CSV ledger...');
    try {
      await api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Ledger imported successfully', { id: loadToast });
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Import failed', { id: loadToast });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'text/csv': ['.csv'] } 
  });

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this financial record permanently?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Record purged');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to purge record');
    }
  }

  const exportToCSV = () => {
    if (transactions.length === 0) return toast.error('Empty ledger');
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (INR)'];
    const csvRows = [headers.join(',')];
    transactions.forEach(tx => {
      csvRows.push([
        new Date(tx.date).toLocaleDateString(),
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.category,
        tx.type,
        (tx.amount / 100).toFixed(2)
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CFO_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Ledger exported to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Financial Ledger <FileSpreadsheet className="text-indigo-600" size={28} />
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Audit-grade transaction management with real-time sync.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest shadow-sm">
              <Upload size={16} className="text-indigo-600" />
              {isDragActive ? 'Release' : 'Bulk Import'}
            </button>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest shadow-sm"
          >
            <Download size={16} className="text-indigo-600" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            <Plus size={18} className="text-amber-400" />
            Add Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by vendor, reference or note..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-200 transition-all text-sm font-medium placeholder:text-slate-300"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {['', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilters(prev => ({...prev, type, page: 1}))}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filters.type === type 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                {type === '' ? 'All Flows' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Ledger Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 font-black">Timeline</th>
                <th className="px-8 py-5 font-black">Counterparty & Reference</th>
                <th className="px-8 py-5 font-black">Category Tag</th>
                <th className="px-8 py-5 font-black text-right">Value (INR)</th>
                <th className="px-8 py-5 font-black text-center">Status</th>
                <th className="px-8 py-5 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-24 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <RefreshCw size={32} className="animate-spin text-indigo-600" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Ledger...</p>
                   </div>
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-24 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                         <Filter size={32} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching records</p>
                   </div>
                </td></tr>
              ) : (
                transactions.map((tx, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tx.id} 
                    className="group hover:bg-slate-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                  >
                    <td className="px-8 py-6 text-slate-500 font-bold whitespace-nowrap text-xs">
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                         <span className="text-slate-800 font-black tracking-tight leading-tight mb-1">{tx.description}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">TXN-{tx.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {tx.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className={`px-8 py-6 text-right font-black text-base whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.type === 'income' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-slate-300" />}
                        ₹{(tx.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="inline-flex items-center gap-1.5 text-emerald-600 text-[9px] font-black uppercase px-3 py-1 bg-emerald-50 rounded-full">
                          <CheckCircle2 size={10} /> Verified
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(tx.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Console */}
        <div className="p-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/20 gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Viewing <span className="text-slate-900">{(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, total)}</span> of <span className="text-slate-900">{total}</span> Global Records
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setFilters(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
              disabled={filters.page === 1}
              className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Previous
            </button>
            <button 
              onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
              disabled={filters.page * filters.limit >= total}
              className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manual Ledger Entry</h3>
                    <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
                       <Plus size={24} className="rotate-45" />
                    </button>
                 </div>
                 <TransactionForm 
                  onCancel={() => setShowAddModal(false)} 
                  onSuccess={() => {
                    setShowAddModal(false);
                    fetchTransactions();
                  }} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
