import React, { useState, useEffect } from 'react';
import { Building2, Link2, RefreshCw, CheckCircle2, AlertCircle, ArrowRightLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePlaidLink } from 'react-plaid-link';

const BankSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bankTransactions, setBankTransactions] = useState([]);

  const [linkToken, setLinkToken] = useState(null);
  
  // Indian AA Simulation State
  const [showIndianConsent, setShowIndianConsent] = useState(false);
  const [aaStep, setAaStep] = useState(1);

  const handleIndianConnect = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setShowIndianConsent(false);
      setIsConnected(true);
      toast.success('Successfully connected to HDFC Bank via Account Aggregator');
      
      // Simulate fetching Indian bank feeds
      setIsSyncing(true);
      setTimeout(() => {
        setBankTransactions([
          { id: 'in1', date: new Date().toISOString().split('T')[0], description: 'UPI/Zomato/UPI/123456', amount: -450, status: 'pending' },
          { id: 'in2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], description: 'NEFT-Client Payment India', amount: 85000, status: 'pending' },
          { id: 'in3', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], description: 'ACH-Reliance Jio Bill', amount: -1999, status: 'pending' },
        ]);
        setIsSyncing(false);
        toast.success('Indian bank feeds synced!');
      }, 1500);
      
    }, 2000);
  };

  // 1. Fetch Link Token on Mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const res = await api.post('/plaid/create_link_token');
        setLinkToken(res.data.link_token);
      } catch (err) {
        if (err.response?.data?.error !== 'PLAID_KEYS_MISSING') {
          console.error('Error fetching link token:', err);
          toast.error('Failed to initialize Plaid connection');
        }
      }
    };
    fetchLinkToken();
  }, []);

  // 2. Handle successful Plaid Link
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
      // Send to backend to create a real journal entry / transaction
      const payload = {
        type: tx.amount > 0 ? 'income' : 'expense',
        amount: Math.abs(tx.amount), // backend expects positive integers (actually rupees in the controller)
        description: tx.description,
        date: tx.date,
        payment_mode: 'Bank Transfer'
      };
      
      await api.post('/transactions', payload);
      
      // Mark as reconciled locally
      setBankTransactions(prev => 
        prev.map(t => t.id === tx.id ? { ...t, status: 'reconciled' } : t)
      );
      toast.success('Transaction reconciled successfully!');
    } catch (error) {
      toast.error('Failed to reconcile transaction');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-2xl border border-white/40 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bank Feeds & Reconciliation</h1>
          <p className="text-sm text-gray-500 mt-1">Connect your bank to automatically import and reconcile transactions.</p>
        </div>
        <div>
          {!isConnected ? (
            <button 
              onClick={() => open()}
              disabled={!ready || isLinking}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-70"
            >
              {isLinking ? <RefreshCw size={18} className="animate-spin" /> : <Link2 size={18} />}
              {isLinking ? 'Connecting...' : 'Connect Live Bank'}
            </button>
          ) : (
            <button 
              onClick={fetchBankFeeds}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin text-blue-600" : "text-gray-500"} />
              {isSyncing ? 'Syncing...' : 'Sync Feeds'}
            </button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 z-10">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 z-10">No Bank Account Connected</h2>
          <p className="text-gray-500 max-w-md mb-8 z-10">
            Securely connect your bank account to automatically import transactions, stop manual data entry, and enable one-click reconciliation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 z-10">
            <button 
              onClick={() => setShowIndianConsent(true)}
              disabled={isLinking}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium shadow-md shadow-orange-500/20"
            >
              <Building2 size={18} />
              Connect Indian Bank (AA)
            </button>
            <button 
              onClick={() => open()}
              disabled={!ready || isLinking}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-600/20 disabled:opacity-70"
            >
              <Link2 size={18} />
              Connect International Bank
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 mt-8 z-10">
            <CheckCircle2 size={16} className="text-green-500" /> RBI Compliant
            <span className="mx-2">•</span>
            <CheckCircle2 size={16} className="text-green-500" /> 256-bit Encryption
          </div>
          
          {/* Indian AA Consent Modal Overlay */}
          {showIndianConsent && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-left">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">AA</span>
                    Account Aggregator Consent
                  </h3>
                  <button onClick={() => setShowIndianConsent(false)} className="text-gray-400 hover:text-gray-600">×</button>
                </div>
                
                {aaStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Enter your phone number linked to your bank accounts to fetch your financial data securely.</p>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 ring-orange-500">
                      <span className="px-4 py-2 bg-gray-50 border-r border-gray-300 text-gray-600">+91</span>
                      <input type="text" placeholder="9876543210" className="flex-1 px-4 py-2 outline-none" defaultValue="9876543210" />
                    </div>
                    <button 
                      onClick={() => setAaStep(2)}
                      className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
                    >
                      Send OTP
                    </button>
                  </div>
                )}
                
                {aaStep === 2 && (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to your phone</p>
                    <div className="flex justify-center gap-2">
                      {[1,2,3,4,5,6].map(i => (
                        <input key={i} type="text" maxLength="1" className="w-10 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg outline-none focus:border-orange-500" defaultValue={i === 1 ? '7' : i === 2 ? '3' : ''} />
                      ))}
                    </div>
                    <button 
                      onClick={handleIndianConnect}
                      disabled={isLinking}
                      className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex justify-center items-center gap-2"
                    >
                      {isLinking ? <RefreshCw size={18} className="animate-spin" /> : null}
                      {isLinking ? 'Verifying & Linking...' : 'Verify OTP'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connected Accounts Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Connected Accounts</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                  HDFC
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Current Account</p>
                  <p className="text-xs text-gray-500">**** 4092</p>
                </div>
                <div className="ml-auto">
                  <span className="flex w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-blue-100 text-sm font-medium mb-1">Live Balance</h3>
                <p className="text-3xl font-bold mb-4">₹4,52,000.00</p>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <AlertCircle size={14} /> Last synced just now
                </div>
              </div>
              <Building2 size={100} className="absolute -bottom-6 -right-6 text-white opacity-10" />
            </div>
          </div>

          {/* Reconciliation Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Bank Statement Matches</h3>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                {bankTransactions.filter(t => t.status === 'pending').length} Pending
              </span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Bank Description</th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                    <th className="px-6 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bankTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No transactions found. Click Sync Feeds.
                      </td>
                    </tr>
                  ) : (
                    bankTransactions.map(tx => (
                      <tr key={tx.id} className={`transition-colors ${tx.status === 'reconciled' ? 'bg-green-50/30' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{tx.date}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{tx.description}</td>
                        <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${tx.amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                          {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {tx.status === 'reconciled' ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                              <CheckCircle2 size={14} /> Reconciled
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleReconcile(tx)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSync;
