import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, Upload, Filter, Search, Download } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionForm from '../components/TransactionForm';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 10, type: '', search: '' });
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

    const loadToast = toast.loading('Uploading and importing CSV...');
    try {
      await api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('CSV Imported successfully', { id: loadToast });
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
    if(!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  }

  const exportToCSV = () => {
    if (transactions.length === 0) return toast.error('No transactions to export');
    
    // Create CSV content
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (INR)'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    transactions.forEach(tx => {
      const row = [
        new Date(tx.date).toLocaleDateString(),
        `"${tx.description.replace(/"/g, '""')}"`, // escape quotes
        tx.category,
        tx.type,
        (tx.amount / 100).toFixed(2)
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-2xl border border-white/40 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your income and expenses.</p>
        </div>
        <div className="flex gap-3">
          <div {...getRootProps()} className="cursor-pointer hidden sm:block">
            <input {...getInputProps()} />
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Upload size={16} />
              {isDragActive ? 'Drop here' : 'Import CSV'}
            </button>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium hidden sm:flex"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search description..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading transactions...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No transactions found.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{tx.category}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                      {tx.type === 'income' ? '+' : '-'} ₹{(tx.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(tx.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-medium">{Math.min(filters.page * filters.limit, total)}</span> of <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilters(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
              disabled={filters.page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
              disabled={filters.page * filters.limit >= total}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <TransactionForm 
            onCancel={() => setShowAddModal(false)} 
            onSuccess={() => {
              setShowAddModal(false);
              fetchTransactions();
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default Transactions;
