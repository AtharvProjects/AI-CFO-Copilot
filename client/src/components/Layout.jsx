import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Calculator, FileText, MessageSquare, LogOut, Building2, ShieldCheck, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AlertBell from './AlertBell';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
        isActive 
          ? 'bg-blue-600/10 text-blue-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
      <span>{label}</span>
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-gray-200 flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            CFO Copilot
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            {user?.business_name || 'Business'}
          </p>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/transactions" icon={ReceiptText} label="Transactions" />
          <SidebarLink to="/bank-sync" icon={Building2} label="Bank Sync" />
          <SidebarLink to="/invoices" icon={FileText} label="Invoicing" />
          <SidebarLink to="/chat" icon={MessageSquare} label="AI Advisor" />
          <SidebarLink to="/gst-ledger" icon={Calculator} label="GST Ledger" />
          <SidebarLink to="/audit-logs" icon={ShieldCheck} label="Audit Logs" />
          <SidebarLink to="/profile" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {/* Dynamic Title could go here based on route */}
          </h2>
          <div className="flex items-center gap-4">
            <AlertBell />
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
