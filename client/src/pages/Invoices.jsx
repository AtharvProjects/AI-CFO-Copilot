import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, RefreshCw, CheckCircle2, Send, Zap, Search, ShieldCheck, ArrowRightLeft, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import OutgoingInvoiceGenerator from '../components/OutgoingInvoiceGenerator';
import { motion, AnimatePresence } from 'framer-motion';

const Invoices = () => {
  const [activeTab, setActiveTab] = useState('outgoing');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'incoming') {
      fetchInvoices();
    }
  }, [activeTab]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('invoice', file);

    setUploading(true);
    const loadToast = toast.loading('AI is reading your bill...');
    try {
      await api.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Invoice extracted successfully', { id: loadToast });
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process invoice', { id: loadToast });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    } 
  });

  const handleSyncToExpense = async (invoice) => {
    if(!invoice.total || !invoice.vendor) {
      toast.error('Cannot sync: Missing total or vendor data from OCR.');
      return;
    }

    setSyncingId(invoice.id);
    try {
      const payload = {
        type: 'expense',
        amount: invoice.total / 100,
        description: `Invoice from ${invoice.vendor} (${invoice.invoice_number || 'N/A'})`,
        date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        payment_mode: 'Bank Transfer'
      };
      
      await api.post('/transactions', payload);
      toast.success('Successfully synced to expenses!');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to sync to expenses');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Invoicing & AI OCR <Zap className="text-amber-500 fill-amber-500" size={28} />
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Professional billing for modern MSMEs.</p>
        </div>
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl backdrop-blur-md border border-slate-200">
          <button 
            onClick={() => setActiveTab('outgoing')}
            className={`flex items-center gap-2 px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'outgoing' ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Plus size={16} /> Create Invoice
          </button>
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'incoming' ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <FileText size={16} /> Vendor Bills (OCR)
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'outgoing' ? (
          <motion.div 
            key="outgoing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass p-1 rounded-3xl"
          >
            <OutgoingInvoiceGenerator />
          </motion.div>
        ) : (
          <motion.div 
            key="incoming"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* OCR Dropzone */}
            <div 
              {...getRootProps()} 
              className={`group relative overflow-hidden border-2 border-dashed rounded-[2.5rem] p-16 flex flex-col items-center justify-center transition-all cursor-pointer bg-white/40 backdrop-blur-md
                ${isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'}`}
            >
              <input {...getInputProps()} />
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck size={120} />
              </div>
              
              <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all transform group-hover:scale-110 ${isDragActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                {uploading ? <RefreshCw size={32} className="animate-spin" /> : <UploadCloud size={32} />}
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                {isDragActive ? 'Drop the file now' : 'Upload Vendor Bill'}
              </h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs text-center leading-relaxed">
                Our AI will extract Vendor, Date, GSTIN and Amount automatically. <br/>
                <span className="text-[10px] font-black uppercase text-slate-400 mt-2 block">PDF • JPG • PNG up to 10MB</span>
              </p>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">AI Processed Inbox</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ready for reconciliation</p>
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                    type="text" placeholder="Filter vendors..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all text-sm font-medium"
                   />
                </div>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 font-black">Issue Date</th>
                      <th className="px-8 py-5 font-black">Vendor Entity</th>
                      <th className="px-8 py-5 font-black">Reference #</th>
                      <th className="px-8 py-5 font-black">Compliance (GST)</th>
                      <th className="px-8 py-5 font-black text-right">Total Amount</th>
                      <th className="px-8 py-5 font-black text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Syncing processed queue...</td></tr>
                    ) : invoices.length === 0 ? (
                      <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">No documents detected</td></tr>
                    ) : (
                      invoices
                        .filter(inv => inv.vendor?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((inv) => (
                        <tr key={inv.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-6 text-slate-500 font-bold text-xs whitespace-nowrap">
                            {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-slate-800 font-black tracking-tight">{inv.vendor || 'Unknown Entity'}</span>
                          </td>
                          <td className="px-8 py-6 text-slate-500 font-medium">#{inv.invoice_number || 'N/A'}</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                              {inv.gstin || 'NO GSTIN'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-base text-slate-900">
                            {inv.total ? `₹${(inv.total / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-8 py-6 text-center">
                            {inv.synced_to_transaction ? (
                              <div className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase px-3 py-1.5 bg-emerald-50 rounded-full">
                                <CheckCircle2 size={12} /> Booked
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleReconcile(tx)}
                                onClick={() => handleSyncToExpense(inv)}
                                disabled={syncingId === inv.id}
                                className="inline-flex items-center gap-2 text-indigo-600 hover:text-white text-xs font-black px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 rounded-xl transition-all group-hover:shadow-lg group-hover:shadow-indigo-100 disabled:opacity-50"
                              >
                                {syncingId === inv.id ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                                Sync Expense
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invoices;
