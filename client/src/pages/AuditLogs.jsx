import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Search, Filter, ArrowRight, Database, UserCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 20, table_name: '', action: '' });
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit', { params: filters });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" /> Immutable Audit Trail
          </h1>
          <p className="text-sm text-gray-500 mt-1">Every financial action is logged and secured via database triggers.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Database size={16} className="text-gray-400" />
            <select 
              className="text-sm outline-none bg-transparent"
              value={filters.table_name}
              onChange={(e) => setFilters(prev => ({ ...prev, table_name: e.target.value, page: 1 }))}
            >
              <option value="">All Tables</option>
              <option value="transactions">Transactions</option>
              <option value="journal_entries">Journal Entries</option>
              <option value="accounts">Chart of Accounts</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <History size={16} className="text-gray-400" />
            <select 
              className="text-sm outline-none bg-transparent"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}
            >
              <option value="">All Actions</option>
              <option value="INSERT">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
          
          <div className="ml-auto text-xs text-gray-400 italic flex items-center gap-1">
            <AlertCircle size={14} /> This log is append-only and cannot be modified.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Table</th>
                <th className="px-6 py-3 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors align-top">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{log.table_name}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 max-w-lg">
                        {log.action === 'INSERT' && (
                          <p className="text-xs text-gray-600">New record created with ID: <span className="font-mono text-[10px]">{log.record_id}</span></p>
                        )}
                        {log.action === 'UPDATE' && log.old_data && log.new_data && (
                          <div className="flex flex-wrap gap-2">
                             {Object.keys(log.new_data).filter(key => JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])).map(key => (
                               <div key={key} className="bg-gray-50 p-2 rounded border border-gray-100 w-full">
                                 <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{key.replace('_', ' ')}</p>
                                 <div className="flex items-center gap-2 text-xs">
                                   <span className="text-red-500 line-through truncate max-w-[100px]">{JSON.stringify(log.old_data[key])}</span>
                                   <ArrowRight size={12} className="text-gray-400 shrink-0" />
                                   <span className="text-green-600 font-medium truncate max-w-[100px]">{JSON.stringify(log.new_data[key])}</span>
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                        {log.action === 'DELETE' && (
                          <p className="text-xs text-red-600 font-medium italic">Record was permanently removed.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs text-gray-500">
            Total logs: <span className="font-bold">{total}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page === 1}
              className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:bg-white disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page * filters.limit >= total}
              className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:bg-white disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
