import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, LineChart as ChartIcon } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

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

  const { kpis, forecast, donutChartData, budget } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time financial pulse of your business.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Income</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><ArrowUpRight size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(kpis?.totalIncome / 100 || 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Expense</h3>
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><ArrowDownRight size={18} /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">₹{(kpis?.totalExpense / 100 || 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Net Profit</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><IndianRupee size={18} /></div>
          </div>
          <div className={`text-2xl font-bold ${(kpis?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{(kpis?.netProfit / 100 || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Donut */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Expenses by Category</h3>
          <div className="h-64">
            {donutChartData && donutChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
              <div className="h-full flex items-center justify-center text-gray-400">No expense data</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {donutChartData?.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Mini Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">30-Day Forecast</h3>
            <ChartIcon size={18} className="text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-1">
            {forecast?.narrative || "AI forecasting requires more historical data to generate reliable predictions."}
          </p>
          <div className="h-48 mt-auto">
            {forecast?.data && forecast.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.data}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip formatter={(value) => `₹${(value / 100).toLocaleString()}`} />
                  <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg bg-gray-50/50">
                 Not enough data for forecast
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
