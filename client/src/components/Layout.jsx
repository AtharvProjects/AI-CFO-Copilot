import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Calculator, FileText, MessageSquare, LogOut, Building2, ShieldCheck, Settings, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AlertBell from './AlertBell';
import { motion } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`relative group flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 transition-all duration-300 ${
        isActive 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute inset-0 bg-slate-900 rounded-2xl -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon size={20} className={isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-900'} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>}
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#FDFDFF] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-300">
              <Zap className="text-amber-400 fill-amber-400" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">
              CFO Copilot
            </h1>
          </div>
          <div className="px-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black leading-none">
              {user?.business_name || 'Enterprise'}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-4 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 px-4">Core Platform</div>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/transactions" icon={ReceiptText} label="Transactions" />
          <SidebarLink to="/bank-sync" icon={Building2} label="Bank Sync" />
          <SidebarLink to="/invoices" icon={FileText} label="Invoicing" />
          
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-8 mb-4 px-4">AI Intelligence</div>
          <SidebarLink to="/chat" icon={MessageSquare} label="AI Advisor" />
          <SidebarLink to="/gst-ledger" icon={Calculator} label="GST Ledger" />
          
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-8 mb-4 px-4">Administration</div>
          <SidebarLink to="/audit-logs" icon={ShieldCheck} label="Audit Logs" />
          <SidebarLink to="/profile" icon={Settings} label="Settings" />
        </nav>

        <div className="p-6 border-t border-slate-50 bg-slate-50/50">
          <button 
            onClick={logout}
            className="group flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 font-bold text-sm"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                   {String.fromCharCode(64 + i)}
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                 +12
               </div>
            </div>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Market: Open</span>
          </div>
          
          <div className="flex items-center gap-6">
            <AlertBell />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none capitalize">{user?.name || 'User'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Administrator</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-xl shadow-slate-200 border-2 border-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#FDFDFF] custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
