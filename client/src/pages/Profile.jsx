import React, { useState, useEffect } from 'react';
import { User, Building, Landmark, Wallet, Save, Shield, Calendar, Mail, Globe, MapPin, Receipt, Fingerprint, TrendingUp, Users, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      setProfile({
        ...res.data.data,
        monthly_budget: res.data.data.monthly_budget / 100 
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...profile,
        monthly_budget: profile.monthly_budget * 100 
      };
      await api.put('/user/profile', payload);
      toast.success('Enterprise configuration updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="h-64 bg-slate-100 rounded-[2.5rem]"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-slate-100 rounded-[2rem]"></div>
        <div className="h-96 bg-slate-100 rounded-[2rem]"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Dynamic Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center text-5xl font-black border-4 border-white/20 shadow-2xl group-hover:rotate-3 transition-transform duration-500">
            {profile?.business_name?.charAt(0) || 'B'}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight">{profile?.business_name || 'Business Entity'}</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Enterprise Identification Hub</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-medium text-sm">
              <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl"><Mail size={16} className="text-indigo-400" /> {profile?.email}</span>
              <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl"><Calendar size={16} className="text-emerald-400" /> Joined {new Date(profile?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              <span className="px-4 py-2 bg-amber-400/10 text-amber-400 rounded-2xl border border-amber-400/20 text-[10px] font-black uppercase tracking-widest">
                {profile?.role || 'Global Admin'}
              </span>
            </div>
          </div>
        </div>
        <Building size={280} className="absolute -bottom-20 -right-20 text-white opacity-5 pointer-events-none" />
      </motion.div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Identity Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Globe size={20} /></div>
              Business Architecture
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Registered Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile?.business_name || ''} 
                    onChange={(e) => setProfile({...profile, business_name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry Classification</label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    value={profile?.business_type || ''} 
                    onChange={(e) => setProfile({...profile, business_type: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 appearance-none"
                  >
                    <option value="Retail">Retail & E-commerce</option>
                    <option value="Manufacturing">Discrete Manufacturing</option>
                    <option value="Services">Professional Services</option>
                    <option value="SaaS">Technology & SaaS</option>
                    <option value="Freelancer">Independent Consultant</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Operational State</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile?.state || ''} 
                    onChange={(e) => setProfile({...profile, state: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                    placeholder="e.g. Maharashtra, India"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/5 p-8 rounded-[2.5rem] border border-indigo-100/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                 <Users size={20} />
               </div>
               <div>
                 <h4 className="font-black text-slate-900 text-sm">Team Collaboration</h4>
                 <p className="text-[10px] font-bold text-slate-500">Manage stakeholder access and permissions.</p>
               </div>
            </div>
            <button 
              type="button" 
              onClick={() => toast.success('Team Management restricted to Enterprise tier. Please upgrade.')}
              className="px-6 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm"
            >
              Manage Team
            </button>
          </div>
        </div>

        {/* Compliance & Governance */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-10">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Shield size={20} /></div>
              Governance
            </h2>
            
            <div className="space-y-8 flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Identification (GSTIN)</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile?.gstin || ''} 
                    onChange={(e) => setProfile({...profile, gstin: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 ring-emerald-500/10 outline-none uppercase font-black text-slate-800 tracking-wider"
                    placeholder="27AABCS..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permanent Account (PAN)</label>
                <div className="relative">
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile?.pan || ''} 
                    onChange={(e) => setProfile({...profile, pan: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 ring-emerald-500/10 outline-none uppercase font-black text-slate-800 tracking-wider"
                    placeholder="AABCS..."
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Financial Budget Cap</label>
                  <span className="text-indigo-600 font-black text-sm">₹{parseFloat(profile?.monthly_budget || 0).toLocaleString()}</span>
                </div>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="number" 
                    value={profile?.monthly_budget || 0} 
                    onChange={(e) => setProfile({...profile, monthly_budget: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-900 text-white rounded-[1.25rem] outline-none font-black text-lg focus:ring-4 ring-indigo-500/20 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-4 italic leading-relaxed text-center">
                  * Threshold used by AI for real-time spend anomaly detection.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-6">
               <button 
                type="submit" 
                disabled={saving}
                className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 disabled:opacity-70 group"
               >
                 {saving ? (
                   <RefreshCw size={20} className="animate-spin text-amber-400" />
                 ) : (
                   <>
                     <Save size={20} className="text-amber-400 group-hover:scale-110 transition-transform" /> 
                     Commit Changes
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
