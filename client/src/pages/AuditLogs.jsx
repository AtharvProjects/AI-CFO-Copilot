import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Search, Filter, ArrowRight, Database, UserCheck, AlertCircle, RefreshCw, FileText, Lock, HardDrive } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 15, table_name: '', action: '' });
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit', { params: filters });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to load cryptographic logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const getActionStyles = (action) => {
    switch (action) {
      case 'INSERT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Immutable Audit Trail <ShieldCheck className="text-indigo-600" size={28} />
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Append-only cryptographic ledger of every financial mutation.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <Lock size={14} className="text-emerald-500" /> DB-Trigger Secured
           </div>
           <div className="w-1 h-1 rounded-full bg-slate-200"></div>
           <div className="flex items-center gap-2">
             <HardDrive size={14} className="text-indigo-500" /> SOC2 Compliant
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Advanced Filters */}
        <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center bg-slate-50/30">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
            <Database size={16} className="text-slate-400" />
            <select 
              className="text-xs font-black uppercase tracking-widest outline-none bg-transparent text-slate-600"
              value={filters.table_name}
              onChange={(e) => setFilters(prev => ({ ...prev, table_name: e.target.value, page: 1 }))}
            >
              <option value="">All Entities</option>
              <option value="transactions">Transactions</option>
              <option value="journal_entries">Journal Entries</option>
              <option value="accounts">Accounts</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
            <History size={16} className="text-slate-400" />
            <select 
              className="text-xs font-black uppercase tracking-widest outline-none bg-transparent text-slate-600"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}
            >
              <option value="">All Mutations</option>
              <option value="INSERT">Create (Insert)</option>
              <option value="UPDATE">Modify (Update)</option>
              <option value="DELETE">Purge (Delete)</option>
            </select>
          </div>
          
          <div className="ml-auto flex items-center gap-3 text-[10px] font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            <AlertCircle size={14} /> 
            <span>This log is permanent and cannot be modified or deleted.</span>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 font-black">Timestamp</th>
                <th className="px-8 py-5 font-black">Mutation</th>
                <th className="px-8 py-5 font-black">Entity Scope</th>
                <th className="px-8 py-5 font-black">Diff / Payload Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="px-8 py-24 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <RefreshCw size={32} className="animate-spin text-indigo-600" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Secure Logs...</p>
                   </div>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-24 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">Vault is empty</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={log.id} 
                    className="hover:bg-slate-50/50 transition-all align-top group"
                  >
                    <td className="px-8 py-6 text-slate-500 font-bold whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString('en-IN', { 
                        day: '2-digit', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit', second: '2-digit' 
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getActionStyles(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">
                        {log.table_name}
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-4 max-w-2xl">
                        {log.action === 'INSERT' && (
                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                             <FileText size={14} className="text-slate-400" />
                             <p className="text-[11px] font-bold text-slate-600">New atomic record initialized: <span className="font-black text-slate-900">{log.record_id}</span></p>
                          </div>
                        )}
                        {log.action === 'UPDATE' && log.old_data && log.new_data && (
                          <div className="grid grid-cols-1 gap-2">
                             {Object.keys(log.new_data).filter(key => JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])).map(key => (
                               <div key={key} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:border-indigo-100 transition-colors">
                                 <p className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-widest">{key.replace('_', ' ')}</p>
                                 <div className="flex items-center gap-4 text-xs">
                                   <div className="flex-1 p-2 bg-rose-50 text-rose-600 rounded-lg line-through truncate font-bold text-[11px]">
                                      {JSON.stringify(log.old_data[key])}
                                   </div>
                                   <ArrowRight size={14} className="text-slate-300 shrink-0" />
                                   <div className="flex-1 p-2 bg-emerald-50 text-emerald-700 rounded-lg font-black truncate text-[11px]">
                                      {JSON.stringify(log.new_data[key])}
                                   </div>
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                        {log.action === 'DELETE' && (
                          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-2">
                             <AlertCircle size={14} />
                             <p className="text-[11px] font-black uppercase tracking-tight italic">Terminal Event: Resource Purged.</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Console */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Ledger Depth: <span className="text-slate-900 font-black">{total} Sequential Logs</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page === 1}
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm"
            >
              Back
            </button>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page * filters.limit >= total}
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all shadow-xl shadow-slate-100"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
