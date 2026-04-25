import React, { useState, useEffect } from 'react';
import { Calculator, Landmark, ArrowUpRight, ArrowDownRight, Calendar, FileText, Download } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const GstLedger = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGstData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gst/summary');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load GST data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGstData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-32 bg-gray-200 rounded-2xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-48 bg-gray-200 rounded-2xl"></div>
      <div className="h-48 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>;

  const { summary, dueDates, ledger } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Landmark className="text-blue-600" /> GST Ledger & Compliance
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your GST liability, Input Tax Credit (ITC), and filing deadlines.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Output GST (Sales)</h3>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><ArrowUpRight size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(summary?.output_gst / 100 || 0).toLocaleString()}</div>
          <p className="text-xs text-gray-400 mt-2">GST collected from customers</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Input Tax Credit (ITC)</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><ArrowDownRight size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(summary?.input_tax_credit / 100 || 0).toLocaleString()}</div>
          <p className="text-xs text-gray-400 mt-2">GST paid on business purchases</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-blue-100 font-medium text-sm mb-4">Net GST Payable</h3>
            <div className="text-3xl font-bold">₹{(summary?.net_gst_payable / 100 || 0).toLocaleString()}</div>
            <p className="text-xs text-blue-100 mt-2">Estimated liability for this period</p>
          </div>
          <Landmark size={80} className="absolute -bottom-4 -right-4 text-white opacity-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Due Dates */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" /> Filing Deadlines
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-800">GSTR-1</p>
                  <p className="text-xs text-gray-500">Sales Return</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{new Date(dueDates?.GSTR1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Upcoming</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-800">GSTR-3B</p>
                  <p className="text-xs text-gray-500">Summary Return</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{new Date(dueDates?.GSTR3B).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Upcoming</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
              Set Reminders
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-orange-500" /> Tax Optimization
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our AI detected that 12% of your "General Expenses" don't have GST details. Adding GSTINs for these vendors could save you ₹4,500 in ITC.
            </p>
            <button className="mt-4 text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline">
              View Suggestions <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* GST Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">GST Transaction Ledger</h3>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Download size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Entity/Description</th>
                  <th className="px-6 py-3 font-medium text-center">Rate</th>
                  <th className="px-6 py-3 font-medium text-right">Tax Amount</th>
                  <th className="px-6 py-3 font-medium text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger?.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No GST transactions recorded yet.</td></tr>
                ) : (
                  ledger?.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800 font-medium">{tx.description}</p>
                        <p className="text-[10px] text-gray-400">{tx.category}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{(tx.gst_rate * 100).toFixed(0)}%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-800">
                        ₹{((tx.cgst + tx.sgst + tx.igst) / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${tx.type === 'income' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {tx.type === 'income' ? 'OUTPUT' : 'INPUT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GstLedger;
