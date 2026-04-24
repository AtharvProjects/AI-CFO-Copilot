import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, RefreshCw, CheckCircle2, Send } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import OutgoingInvoiceGenerator from '../components/OutgoingInvoiceGenerator';

const Invoices = () => {
  const [activeTab, setActiveTab] = useState('outgoing');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

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
    const loadToast = toast.loading('Uploading and running OCR parsing...');
    try {
      await api.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Invoice parsed successfully', { id: loadToast });
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
        amount: invoice.total / 100, // API expects rupees, backend multiplies by 100
        description: `Invoice from ${invoice.vendor} (${invoice.invoice_number || 'N/A'})`,
        date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        payment_mode: 'Bank Transfer' // Default
      };
      
      await api.post('/transactions', payload);
      
      toast.success('Successfully synced to expenses!');
    } catch (error) {
      toast.error('Failed to sync to expenses');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoicing & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Create professional invoices or auto-parse incoming vendor bills.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('outgoing')}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'outgoing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Create Invoice
          </button>
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'incoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Vendor Bills (OCR)
          </button>
        </div>
      </div>

      {activeTab === 'outgoing' ? (
        <OutgoingInvoiceGenerator />
      ) : (
        <>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer bg-white/50 backdrop-blur-sm
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          <UploadCloud size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {isDragActive ? 'Drop invoice here' : 'Click or drag to upload invoice'}
        </h3>
        <p className="text-sm text-gray-500">Supports PDF, JPG, PNG up to 10MB.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-blue-500" /> Processed Invoices
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Inv. No</th>
                <th className="px-6 py-3 font-medium">GSTIN</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No invoices uploaded yet.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{inv.vendor || 'Unknown Vendor'}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.invoice_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.gstin || '-'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">
                      {inv.total ? `₹${(inv.total / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {inv.synced_to_transaction ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                          <CheckCircle2 size={14} /> Synced
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSyncToExpense(inv)}
                          disabled={syncingId === inv.id}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {syncingId === inv.id ? <RefreshCw size={14} className="animate-spin" /> : 'Sync to Expense'}
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
      </>
      )}
    </div>
  );
};

export default Invoices;
