import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { generateCFOReport } from '../utils/generatePDF';
import { FileText, ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, LineChart as ChartIcon, CreditCard, HandCoins } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
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
      socket.on('transaction:new', () => {
        // Refresh dashboard when a new transaction is added from anywhere
        fetchDashboardData();
      });
    }
    return () => {
      if (socket) socket.off('transaction:new');
    };
  }, [socket]);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    </div>;
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Unable to load dashboard</h2>
        <p className="text-gray-500 mt-2">Please check your connection and try again.</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, forecast, donutChartData, budget } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time financial pulse of your business.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={reportLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reportLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Generating AI Summary...</span>
            </>
          ) : (
            <>
              <FileText size={18} />
              <span>Download CFO Report</span>
            </>
          )}
        </button>
      </div>

      {kpis?.totalIncome === 0 && kpis?.totalExpense === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-2xl">👋</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Welcome to your AI CFO Copilot!</h2>
            <p className="text-gray-600 text-sm max-w-2xl">
              Your dashboard looks a little empty. Let's get started by recording your first transaction, uploading a vendor bill, or syncing your bank account.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Income</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><ArrowUpRight size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(kpis?.totalIncome / 100 || 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Expense</h3>
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><ArrowDownRight size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(kpis?.totalExpense / 100 || 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Net Profit</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><IndianRupee size={18} /></div>
          </div>
          <div className={`text-2xl font-bold ${(kpis?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{(kpis?.netProfit / 100 || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Receivables</h3>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><HandCoins size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(kpis?.receivables / 100 || 0).toLocaleString()}</div>
          <div className="mt-2 flex items-center text-xs text-orange-500">
            <span className="font-medium mr-1">Overdue:</span> ₹{((kpis?.receivables * 0.3) / 100 || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Payables</h3>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><CreditCard size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(kpis?.payables / 100 || 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Cash Runway</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Wallet size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{kpis?.cashRunwayDays || 0} <span className="text-sm font-normal text-gray-500">days</span></div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">Monthly Budget Tracking</h3>
            <p className="text-xs text-gray-500">₹{(budget?.used / 100 || 0).toLocaleString()} of ₹{(budget?.total || 0).toLocaleString()}</p>
          </div>
          <div className="font-bold text-sm" style={{ color: budget?.percent > 80 ? '#EF4444' : '#3B82F6' }}>
            {budget?.percent?.toFixed(1) || 0}%
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${budget?.percent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(budget?.percent || 0, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Cash Flow Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-6">Cash Flow</h3>
        <div className="h-72">
          {data.cashFlowData && data.cashFlowData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="income" name="Income" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expense" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg bg-gray-50/50">
              No cash flow data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Expenses List (Zeni style) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-6">Top Expenses - This Month</h3>
          <div className="space-y-5">
            {data.topExpenses && data.topExpenses.length > 0 ? data.topExpenses.map((expense, idx) => {
              const maxVal = data.topExpenses[0].value;
              const width = Math.max((expense.value / maxVal) * 100, 5);
              return (
                <div key={idx} className="relative">
                  <div className="flex justify-between text-sm mb-1 z-10 relative px-2">
                    <span className="font-medium text-gray-700">{expense.name}</span>
                    <span className="text-gray-600">₹{(expense.value / 100).toLocaleString()}</span>
                  </div>
                  <div className="absolute inset-0 bg-green-50 rounded z-0" style={{ width: `${width}%` }}></div>
                </div>
              );
            }) : (
              <div className="py-10 text-center text-gray-400">No expenses recorded</div>
            )}
          </div>
        </div>

        {/* Expenses Donut */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-800 mb-4">Expenses Breakdown</h3>
          <div className="h-48 flex-1">
            {donutChartData && donutChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${(value / 100).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4">
            {donutChartData?.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Forecast Line Chart & Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">30-Day Cash Forecast</h3>
            <ChartIcon size={18} className="text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mb-6 max-w-2xl">
            {forecast?.narrative || "AI forecasting requires more historical data to generate reliable predictions."}
          </p>
          <div className="h-64 mt-auto">
            {forecast?.data && forecast.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.data.map(d => ({...d, balance: d.balance + (scenarioAdj * 100)}))}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip formatter={(value) => `₹${(value / 100).toLocaleString()}`} />
                  <Line type="monotone" dataKey="balance" stroke="#8B5CF6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg bg-gray-50/50">
                 Not enough data for forecast
               </div>
            )}
          </div>
        </div>

        {/* Scenario Modeling Panel */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col lg:col-span-1">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Scenario Modeling</h3>
            <p className="text-xs text-gray-500 mt-1">Adjust variables to see forecast impact</p>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Planned New Hires</span>
                <span className="text-blue-600 font-bold">{Math.floor(Math.abs(Math.min(0, scenarioAdj)) / 50000)}</span>
              </div>
              <input 
                type="range" 
                min="-200000" 
                max="0" 
                step="50000"
                value={Math.min(0, scenarioAdj)}
                onChange={(e) => setScenarioAdj(Number(e.target.value) + Math.max(0, scenarioAdj))}
                className="w-full accent-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">-₹50k per hire</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">New Client Revenue</span>
                <span className="text-green-600 font-bold">+₹{Math.max(0, scenarioAdj).toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="500000" 
                step="50000"
                value={Math.max(0, scenarioAdj)}
                onChange={(e) => setScenarioAdj(Number(e.target.value) + Math.min(0, scenarioAdj))}
                className="w-full accent-green-500"
              />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-blue-200/50">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Net Scenario Impact</span>
              <span className={`font-bold ${scenarioAdj >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scenarioAdj > 0 ? '+' : ''}₹{scenarioAdj.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
