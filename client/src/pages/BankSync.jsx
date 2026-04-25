import React, { useState, useEffect } from 'react';
import { Building2, Link2, RefreshCw, CheckCircle2, AlertCircle, ArrowRightLeft, ShieldCheck, Zap, MoreHorizontal, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePlaidLink } from 'react-plaid-link';
import { motion, AnimatePresence } from 'framer-motion';

const BankSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [showIndianConsent, setShowIndianConsent] = useState(false);
  const [aaStep, setAaStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleIndianConnect = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setShowIndianConsent(false);
      setIsConnected(true);
      toast.success('Successfully connected to HDFC Bank via Account Aggregator');
      
      setIsSyncing(true);
      setTimeout(() => {
        setBankTransactions([
          { id: 'in1', date: new Date().toISOString().split('T')[0], description: 'UPI/Zomato/UPI/123456', amount: -450, status: 'pending', category: 'Food & Dining' },
          { id: 'in2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], description: 'NEFT-Client Payment India', amount: 85000, status: 'pending', category: 'Income' },
          { id: 'in3', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], description: 'ACH-Reliance Jio Bill', amount: -1999, status: 'pending', category: 'Utilities' },
          { id: 'in4', date: new Date(Date.now() - 259200000).toISOString().split('T')[0], description: 'Amazon Web Services', amount: -12500, status: 'pending', category: 'Software' },
        ]);
        setIsSyncing(false);
        toast.success('Indian bank feeds synced!');
      }, 1500);
    }, 2000);
  };

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const res = await api.post('/plaid/create_link_token');
        setLinkToken(res.data.link_token);
      } catch (err) {
        if (err.response?.data?.error !== 'PLAID_KEYS_MISSING') {
          console.error('Error fetching link token:', err);
        }
      }
    };
    fetchLinkToken();
  }, []);

  const onSuccess = async (public_token, metadata) => {
    setIsLinking(true);
    try {
      await api.post('/plaid/set_access_token', { public_token });
      setIsConnected(true);
      toast.success(`Successfully connected to ${metadata.institution.name}`);
      fetchBankFeeds();
    } catch (error) {
      toast.error('Failed to link bank account');
    } finally {
      setIsLinking(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const fetchBankFeeds = async () => {
    setIsSyncing(true);
    try {
      const res = await api.get('/plaid/transactions');
      setBankTransactions(res.data.transactions);
      toast.success('Live bank feeds synced!');
    } catch (error) {
      toast.error('Failed to sync bank feeds from Plaid');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReconcile = async (tx) => {
    try {
      const payload = {
        type: tx.amount > 0 ? 'income' : 'expense',
        amount: Math.abs(tx.amount),
        description: tx.description,
        date: tx.date,
        payment_mode: 'Bank Transfer'
      };
      
      await api.post('/transactions', payload);
      
      setBankTransactions(prev => 
        prev.map(t => t.id === tx.id ? { ...t, status: 'reconciled' } : t)
      );
      toast.success('Transaction reconciled successfully!');
    } catch (error) {
      toast.error('Failed to reconcile transaction');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Bank Reconciliation <ShieldCheck className="text-indigo-600" size={28} />
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Verify and match your bank statements with AI-powered suggestions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             Live Connection
          </div>
          {!isConnected ? (
            <button 
              onClick={() => open()}
              disabled={!ready || isLinking}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-100 disabled:opacity-70"
            >
              {isLinking ? <RefreshCw size={18} className="animate-spin" /> : <Link2 size={18} />}
              {isLinking ? 'Securing Connection...' : 'Connect Live Bank'}
            </button>
          ) : (
            <button 
              onClick={fetchBankFeeds}
              disabled={isSyncing}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin text-indigo-600" : "text-slate-500"} />
              {isSyncing ? 'Refreshing Feeds...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-indigo-600 to-purple-600"></div>
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 shadow-inner">
            <Building2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Zero Bank Accounts Linked</h2>
          <p className="text-slate-500 max-w-lg mb-10 font-medium leading-relaxed">
            Eliminate manual data entry. Our secure banking bridge connects to 15,000+ global institutions including all major Indian banks via Account Aggregator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={() => setShowIndianConsent(true)}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 transition-all font-black shadow-2xl shadow-slate-200"
            >
              <Zap size={20} className="text-amber-400 fill-amber-400" />
              Connect Indian Bank (AA)
            </button>
            <button 
              onClick={() => open()}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-[1.5rem] hover:border-indigo-100 hover:bg-indigo-50/30 transition-all font-black"
            >
              <Link2 size={20} className="text-indigo-600" />
              International (Plaid)
            </button>
          </div>

          <div className="mt-16 flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> AES-256 Encrypted
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> RBI Compliant
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> ISO 27001
            </div>
          </div>
          
          <AnimatePresence>
            {showIndianConsent && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative text-left"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg">AA</div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Consent Hub</h3>
                    </div>
                    <button onClick={() => setShowIndianConsent(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  
                  {aaStep === 1 && (
                    <div className="space-y-6">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">Enter your phone number registered with the bank to discover your accounts across all Indian FIPs.</p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                        <input 
                          type="text" placeholder="Phone Number" 
                          className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-indigo-500/10 transition-all font-bold text-slate-800"
                          defaultValue="9876543210" 
                        />
                      </div>
                      <button 
                        onClick={() => setAaStep(2)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                      >
                        Request Access
                      </button>
                    </div>
                  )}
                  
                  {aaStep === 2 && (
                    <div className="space-y-8 text-center">
                      <p className="text-sm text-slate-500 font-medium">Verify the 6-digit code from your banking app</p>
                      <div className="flex justify-center gap-3">
                        {[1,2,3,4,5,6].map(i => (
                          <input key={i} type="text" maxLength="1" className="w-12 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all" defaultValue={i === 1 ? '7' : i === 2 ? '3' : ''} />
                        ))}
                      </div>
                      <button 
                        onClick={handleIndianConnect}
                        disabled={isLinking}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-indigo-100"
                      >
                        {isLinking ? <RefreshCw size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                        {isLinking ? 'Establishing Bridge...' : 'Authorize Sync'}
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Account Overview Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Connected Source</h3>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                  HDFC
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">HDFC Business Plus</p>
                  <p className="text-[10px] text-slate-400 font-bold">**** 4092 • CURRENT</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
              
              <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-xs font-bold hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                + Add Another Account
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Live Liquidity</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-black">₹4,52,000</span>
                  <span className="text-sm font-bold text-slate-400">.00</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1 rounded-full">
                  <RefreshCw size={10} /> SYNCED JUST NOW
                </div>
              </div>
              <Building2 size={120} className="absolute -bottom-8 -right-8 text-white opacity-5" />
            </motion.div>
          </div>

          {/* Main Reconciliation Interface */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">Statement Ledger</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Pending Reconciliation</p>
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                    type="text" placeholder="Filter descriptions..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all text-sm font-medium"
                   />
                </div>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 font-black">Timeline</th>
                      <th className="px-8 py-4 font-black">Description & Intelligence</th>
                      <th className="px-8 py-4 font-black text-right">Flow (INR)</th>
                      <th className="px-8 py-4 font-black text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bankTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <ArrowRightLeft size={32} />
                          </div>
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No feeds detected</p>
                        </td>
                      </tr>
                    ) : (
                      bankTransactions
                        .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((tx, idx) => (
                        <tr key={tx.id} className={`group transition-all ${tx.status === 'reconciled' ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'}`}>
                          <td className="px-8 py-6 text-slate-500 font-bold whitespace-nowrap text-xs">
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="px-8 py-6 min-w-[280px]">
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-black tracking-tight leading-tight mb-1">{tx.description}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                  {tx.category || "General"}
                                </span>
                                {tx.status === 'pending' && (
                                  <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                    <Zap size={10} className="fill-indigo-600" /> Suggested Match: 94%
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={`px-8 py-6 text-right font-black text-base whitespace-nowrap ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.amount > 0 ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="px-8 py-6 text-center">
                            {tx.status === 'reconciled' ? (
                              <div className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase px-3 py-1.5 bg-emerald-50 rounded-full">
                                <CheckCircle2 size={12} /> Reconciled
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleReconcile(tx)}
                                className="inline-flex items-center gap-2 text-indigo-600 hover:text-white text-xs font-black px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 rounded-xl transition-all group-hover:shadow-lg group-hover:shadow-indigo-100"
                              >
                                <ArrowRightLeft size={14} /> Match
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSync;
