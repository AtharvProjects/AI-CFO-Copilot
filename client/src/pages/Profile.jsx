import React, { useState, useEffect } from 'react';
import { User, Building, Landmark, Wallet, Save, Shield, Calendar, Mail } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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
        monthly_budget: res.data.data.monthly_budget / 100 // Convert to rupees for UI
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
        monthly_budget: profile.monthly_budget * 100 // Convert back to paise
      };
      await api.put('/user/profile', payload);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
    <div className="h-48 bg-gray-200 rounded-3xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-32 bg-gray-200 rounded-2xl"></div>
      <div className="h-32 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/20">
            {profile?.business_name?.charAt(0) || 'B'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile?.business_name || 'Business Name'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-blue-100 text-sm">
              <span className="flex items-center gap-1"><Mail size={14} /> {profile?.email}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
              <span className="bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-wider border border-white/10">
                {profile?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>
        <Building size={180} className="absolute -bottom-10 -right-10 text-white opacity-5" />
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Business Settings */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="text-blue-500" /> Business Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Legal Entity Name</label>
              <input 
                type="text" 
                value={profile?.business_name || ''} 
                onChange={(e) => setProfile({...profile, business_name: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Industry / Business Type</label>
              <select 
                value={profile?.business_type || ''} 
                onChange={(e) => setProfile({...profile, business_type: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Services">Services</option>
                <option value="SaaS">SaaS</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Registered State</label>
              <input 
                type="text" 
                value={profile?.state || ''} 
                onChange={(e) => setProfile({...profile, state: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Maharashtra"
              />
            </div>
          </div>
        </div>

        {/* Compliance & Budget */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-green-500" /> Compliance & Budget
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">GSTIN</label>
                <input 
                  type="text" 
                  value={profile?.gstin || ''} 
                  onChange={(e) => setProfile({...profile, gstin: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  placeholder="27AABCS..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">PAN</label>
                <input 
                  type="text" 
                  value={profile?.pan || ''} 
                  onChange={(e) => setProfile({...profile, pan: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  placeholder="AABCS..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center justify-between">
                <span>Monthly Budget (₹)</span>
                <span className="text-blue-600">₹{parseFloat(profile?.monthly_budget || 0).toLocaleString()}</span>
              </label>
              <div className="relative mt-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="number" 
                  value={profile?.monthly_budget || 0} 
                  onChange={(e) => setProfile({...profile, monthly_budget: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">
                Our AI uses this to flag anomalies if your monthly spending exceeds this threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="md:col-span-2 flex justify-end gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
           <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-70"
           >
             {saving ? 'Updating...' : <><Save size={18} /> Save Settings</>}
           </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
