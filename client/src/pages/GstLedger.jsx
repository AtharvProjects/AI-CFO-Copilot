import React, { useState, useEffect, useRef } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, Calendar, FileText, Download, X, Sparkles, Bot, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── AI Suggestions Popup ───────────────────────────────────────────────────
const SuggestionsModal = ({ onClose }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message:
                'Give me specific, actionable GST and ITC optimization suggestions based on my recent transactions. List 3–5 clear steps I can take right now to reduce my tax liability.',
              agentId: 3,
            }),
          }
        );

        if (!res.ok) throw new Error('Failed to fetch suggestions');

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        setLoading(false);

        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value && !cancelled) {
            const chunk = decoder.decode(value, { stream: true });
            setResponse((prev) => prev + chunk);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setResponse('Sorry, failed to load suggestions. Please try again.');
        }
      }
    };

    fetchSuggestions();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-base">AI Tax Optimization</h2>
                <p className="text-xs text-gray-500">Powered by your Tax/GST Advisor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                <Loader2 size={32} className="animate-spin text-orange-500" />
                <p className="text-sm font-medium">Analysing your transactions…</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 mt-0.5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Bot size={16} />
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="font-bold text-gray-900 mt-4 mb-2" {...props} />,
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-3 rounded-xl border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                      th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase" {...props} />,
                      td: ({ node, ...props }) => <td className="px-4 py-2 text-sm text-gray-700 border-t" {...props} />,
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                  <div ref={bottomRef} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              AI suggestions · Verify before acting
            </p>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const GstLedger = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  if (loading)
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );

  const { summary, dueDates, ledger } = data || {};

  return (
    <>
      {showSuggestions && (
        <SuggestionsModal onClose={() => setShowSuggestions(false)} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Landmark className="text-blue-600" /> GST Ledger &amp; Compliance
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your GST liability, Input Tax Credit (ITC), and filing deadlines.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium text-sm">Output GST (Sales)</h3>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ₹{(summary?.output_gst / 100 || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-2">GST collected from customers</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium text-sm">Input Tax Credit (ITC)</h3>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <ArrowDownRight size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ₹{(summary?.input_tax_credit / 100 || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-2">GST paid on business purchases</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-blue-100 font-medium text-sm mb-4">Net GST Payable</h3>
              <div className="text-3xl font-bold">
                ₹{(summary?.net_gst_payable / 100 || 0).toLocaleString()}
              </div>
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
                    <p className="text-sm font-bold text-blue-600">
                      {new Date(dueDates?.GSTR1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Upcoming</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">GSTR-3B</p>
                    <p className="text-xs text-gray-500">Summary Return</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {new Date(dueDates?.GSTR3B).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Upcoming</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                Set Reminders
              </button>
            </div>

            {/* Tax Optimization Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100 shadow-sm mb-6">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" /> Tax Optimization
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our AI detected that 12% of your "General Expenses" don't have GST details. Adding
                GSTINs for these vendors could save you ₹4,500 in ITC.
              </p>
              <button
                id="view-suggestions-btn"
                onClick={() => setShowSuggestions(true)}
                className="mt-4 text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
              >
                View Suggestions <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Compliance Checklist */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <CheckCircle2 size={18} className="text-emerald-500" /> Compliance Checklist
              </h3>
              <div className="space-y-3">
                {[
                  { label: "HSN Codes Verified", status: true },
                  { label: "GSTR-2B Matching", status: true },
                  { label: "E-Way Bill Reconciliation", status: false },
                  { label: "TDS/TCS Liability Check", status: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    {item.status ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={12} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <X size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-4 italic text-center">
                Last checked: Today, 02:30 PM
              </p>
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
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No GST transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    ledger?.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-800 font-medium">{tx.description}</p>
                          <p className="text-[10px] text-gray-400">{tx.category}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                            {(tx.gst_rate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                          ₹{((tx.cgst + tx.sgst + tx.igst) / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              tx.type === 'income'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
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
    </>
  );
};

export default GstLedger;
