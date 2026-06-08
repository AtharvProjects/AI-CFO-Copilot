import React, { useState, useEffect } from 'react';
import { User, Building, Landmark, Wallet, Save, Shield, Calendar, Mail, Globe, MapPin, Receipt, Fingerprint, TrendingUp, Users, RefreshCw, Briefcase, IndianRupee } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    business_name: '',
    gstin: '',
    pan: '',
    state: '',
    business_type: 'Retail',
    monthly_budget: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        business_name: user.business_name || '',
        gstin: user.gstin || '',
        pan: user.pan || '',
        state: user.state || '',
        business_type: user.business_type || 'Retail',
        monthly_budget: user.monthly_budget || 0
      });
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfile(formData);
    setSaving(false);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse p-8">
      <div className="h-64 bg-slate-900/5 rounded-[3rem]"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-slate-900/5 rounded-[2.5rem]"></div>
        <div className="h-96 bg-slate-900/5 rounded-[2.5rem]"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 font-sans px-4">
      {/* Cinematic Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-600/30 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-[2.5rem] flex items-center justify-center text-5xl font-black border-4 border-white/10 shadow-2xl transition-transform duration-700 group-hover:rotate-6">
            {formData.business_name?.charAt(0) || 'B'}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-none mb-2">{formData.business_name || 'Your Enterprise'}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300">
                <Shield size={12} fill="currentColor" /> Authorized Admin Node
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl"><Mail size={14} className="text-indigo-400" /> {user?.email}</span>
              <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl"><Calendar size={14} className="text-emerald-400" /> Registered {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <Briefcase size={280} className="absolute -bottom-20 -right-20 text-white opacity-[0.03] pointer-events-none" />
      </motion.div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Business Infrastructure */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-indigo-100/50 transition-colors" />
            
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Globe size={20} /></div>
              Enterprise Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Business Name</label>
                <div className="relative group/field">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.business_name} 
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Industry Vertical</label>
                <div className="relative group/field">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                  <select 
                    value={formData.business_type} 
                    onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 appearance-none"
                  >
                    <option value="Retail">Retail & E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Registered State / HQ</label>
                <div className="relative group/field">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.state} 
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-lg">
                 <Users size={24} />
               </div>
               <div>
                 <h4 className="font-black text-white text-base tracking-tight leading-none mb-1">Collaboration Nodes</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-user workspace settings</p>
               </div>
            </div>
            <button 
              type="button" 
              onClick={() => toast.success('Team Access restricted to Enterprise. Upgrade to scale.')}
              className="px-8 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-lg"
            >
              Manage Team
            </button>
          </div>
        </div>

        {/* Governance & Liquidity */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-emerald-100/50 transition-colors" />
            
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100"><Shield size={20} /></div>
              Governance
            </h2>
            
            <div className="space-y-8 flex-1">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">GST Identification (GSTIN)</label>
                <div className="relative group/field">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.gstin} 
                    onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 ring-emerald-500/10 outline-none uppercase font-black text-slate-800 tracking-widest"
                    placeholder="27AAAAA0000A..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tax Reference (PAN)</label>
                <div className="relative group/field">
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.pan} 
                    onChange={(e) => setFormData({...formData, pan: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 ring-emerald-500/10 outline-none uppercase font-black text-slate-800 tracking-widest"
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Monthly Liquidity Cap</label>
                  <span className="text-indigo-600 font-black text-sm">₹{parseFloat(formData.monthly_budget).toLocaleString()}</span>
                </div>
                <div className="relative group/field">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                  <input 
                    type="number" 
                    value={formData.monthly_budget} 
                    onChange={(e) => setFormData({...formData, monthly_budget: e.target.value})}
                    className="w-full pl-10 pr-4 py-5 bg-slate-900 text-white rounded-2xl outline-none font-black text-xl focus:ring-4 ring-indigo-500/20 transition-all shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-5 italic leading-relaxed text-center font-bold">
                  * Dynamic threshold used for AI anomaly detection.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-6">
               <button 
                type="submit" 
                disabled={saving}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-70 group active:scale-[0.98]"
               >
                 {saving ? (
                   <RefreshCw size={20} className="animate-spin text-white" />
                 ) : (
                   <>
                     <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
                     Commit Profile Updates
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
