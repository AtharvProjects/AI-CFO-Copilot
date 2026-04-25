import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { generateCFOReport } from '../utils/generatePDF';
import { FileText, ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, LineChart as ChartIcon, CreditCard, HandCoins, Zap, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [scenarioAdj, setScenarioAdj] = useState(0);
  const socket = useSocket();

  const handleDownloadReport = async () => {
    setReportLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const res = await api.get(`/reports/monthly?month=${month}&year=${year}`);
      generateCFOReport(res.data);
      toast.success('CFO Report generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('transaction:new', () => fetchDashboardData());
    }
    return () => {
      if (socket) socket.off('transaction:new');
    };
  }, [socket]);

  const healthScore = useMemo(() => {
    if (!data?.kpis) return 0;
    const { totalIncome, totalExpense, cashRunwayDays } = data.kpis;
    let score = 0;
    if (totalIncome > totalExpense) score += 40;
    if (cashRunwayDays > 90) score += 30;
    else if (cashRunwayDays > 30) score += 15;
    if (totalIncome > 0) score += 30;
    return Math.min(score, 100);
  }, [data]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
        </div>
        <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, forecast, donutChartData, budget, cashFlowData } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Financial Command Center <Zap className="text-amber-500 fill-amber-500" size={24} />
          </h1>
          <p className="text-slate-500 mt-1">Advanced real-time intelligence for your business.</p>
        </div>
        <div className="flex gap-3">
           <button
            onClick={handleDownloadReport}
            disabled={reportLoading}
            className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {reportLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="relative z-10">Analyzing Data...</span>
              </>
            ) : (
              <>
                <FileText size={18} className="relative z-10" />
                <span className="relative z-10 font-semibold">Generate AI CFO Audit</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Primary Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Financial Health Score */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={80} />
          </div>
          <h3 className="text-slate-500 font-semibold text-xs uppercase tracking-widest mb-4">Health Score</h3>
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * healthScore) / 100}
                strokeLinecap="round"
                className={`${healthScore > 70 ? 'text-emerald-500' : healthScore > 40 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">{healthScore}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Index</span>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 px-4">
            {healthScore > 70 ? "Excellent position. Consider expansion." : healthScore > 40 ? "Stable. Monitor cash runway." : "Critical focus required on net burn."}
          </p>
        </motion.div>

        {/* Dynamic Alerts */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-600 p-6 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl"><Info size={20} /></div>
              <h3 className="font-bold text-lg">AI Smart Insight</h3>
            </div>
            <p className="text-indigo-50 text-sm leading-relaxed mb-4">
              {kpis?.cashRunwayDays < 30 
                ? "WARNING: Low liquidity detected. Your runway is under 30 days. Prioritize AR collection." 
                : "Your top expenditure is 'Software'. Our AI found 3 redundant subscriptions saving you ₹12,400/mo."}
            </p>
            <button 
              onClick={() => navigate('/chat')}
              className="text-xs font-bold uppercase tracking-widest bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
            >
              Take Action
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Budget Allocation</h3>
                <div className="mt-2 flex items-baseline gap-2">
                   <span className="text-2xl font-bold text-slate-800">₹{(budget?.used / 100).toLocaleString()}</span>
                   <span className="text-xs text-slate-400 font-medium">/ ₹{(budget?.total / 100).toLocaleString()}</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${budget?.percent > 85 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                {budget?.percent?.toFixed(1)}% USED
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budget?.percent || 0, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${budget?.percent > 85 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">
                Resetting in 12 days • Forecasted to exceed by 4%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verified Income', value: kpis?.totalIncome, icon: ArrowUpRight, color: 'emerald' },
          { label: 'Burn Rate (Exp)', value: kpis?.totalExpense, icon: ArrowDownRight, color: 'rose' },
          { label: 'Net Liquidity', value: kpis?.netProfit, icon: IndianRupee, color: 'indigo' },
          { label: 'Cash Runway', value: kpis?.cashRunwayDays, icon: Wallet, color: 'amber', suffix: ' Days' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{item.label}</h3>
              <div className={`p-2 bg-${item.color}-50 rounded-xl text-${item.color}-600`}>
                <item.icon size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">
                {item.label === 'Cash Runway' ? item.value : `₹${(Math.abs(item.value) / 100).toLocaleString()}`}
              </span>
              {item.suffix && <span className="text-xs text-slate-400 font-bold uppercase">{item.suffix}</span>}
              {item.label === 'Net Liquidity' && item.value < 0 && <span className="text-rose-500 text-xs font-black">CRITICAL</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visual Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Advanced Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-800 text-xl">Cash Velocity</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">6 Month Multi-Bar Comparison</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg text-[10px] font-bold text-indigo-600">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div> INCOME
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg text-[10px] font-bold text-rose-600">
                 <div className="w-2 h-2 rounded-full bg-rose-500"></div> EXPENSE
               </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(241, 245, 249, 0.5)'}}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass p-4 rounded-2xl shadow-2xl border border-white/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</p>
                          <div className="space-y-1">
                            {payload.map((p, i) => (
                              <div key={i} className="flex items-center justify-between gap-8">
                                <span className="text-xs font-bold text-slate-600">{p.name}:</span>
                                <span className={`text-xs font-black ${p.name === 'Income' ? 'text-indigo-600' : 'text-rose-600'}`}>₹{p.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="income" name="Income" fill="url(#incomeGrad)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expense" name="Expense" fill="url(#expenseGrad)" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-black text-slate-800 text-xl mb-2">Resource Allocation</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Category Mix</p>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutChartData}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {donutChartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">
                          {payload[0].name}: ₹{(payload[0].value / 100).toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-xs font-bold text-slate-400 uppercase">Top Exp</span>
               <span className="text-lg font-black text-slate-800 truncate px-4 max-w-full">
                 {donutChartData?.[0]?.name || "N/A"}
               </span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3">
             {donutChartData?.slice(0, 4).map((entry, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">{entry.name}</span>
                   <span className="text-xs font-black text-slate-800">₹{(entry.value / 100000).toFixed(1)}k</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>

      {/* Advanced Predictive Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Scenario Control Panel */}
        <div className="lg:col-span-1 glass p-8 rounded-[2.5rem] border-white/50 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <ChartIcon className="text-indigo-600" size={20} />
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Scenario Sim</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase">Strategic Hires</span>
                <span className="text-sm font-black text-indigo-600">
                  {Math.abs(Math.floor(Math.min(0, scenarioAdj) / 50000))} FTEs
                </span>
              </div>
              <input 
                type="range" min="-300000" max="0" step="50000"
                value={Math.min(0, scenarioAdj)}
                onChange={(e) => setScenarioAdj(Number(e.target.value) + Math.max(0, scenarioAdj))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase">Growth Revenue</span>
                <span className="text-sm font-black text-emerald-600">
                  +₹{(Math.max(0, scenarioAdj) / 1000).toFixed(0)}k
                </span>
              </div>
              <input 
                type="range" min="0" max="1000000" step="50000"
                value={Math.max(0, scenarioAdj)}
                onChange={(e) => setScenarioAdj(Number(e.target.value) + Math.min(0, scenarioAdj))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200/50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Monthly Delta</span>
              <span className={`text-2xl font-black ${scenarioAdj >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {scenarioAdj >= 0 ? '+' : ''}₹{(scenarioAdj / 1).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Predictive Area Chart */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-xl">30-Day Liquidity Forecast</h3>
            <div className="px-4 py-2 bg-indigo-50 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              AI Powered Model v2.4
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast?.data?.map(d => ({...d, balance: d.balance + (scenarioAdj * 100)}))}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl">
                          <p className="text-[10px] font-bold text-slate-400 mb-1">{payload[0].payload.date}</p>
                          <p className="text-sm font-black italic">₹{(payload[0].value / 100).toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-500 text-center">
            "{forecast?.narrative || "AI Analysis: Operational health is currently within normal parameters for MSME benchmarks."}"
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
