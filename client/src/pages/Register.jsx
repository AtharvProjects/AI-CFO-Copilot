import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Building2, CreditCard, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  business_name: z.string().min(2, 'Business name is required'),
  gstin: z.string().length(15, 'GSTIN must be 15 characters').optional().or(z.literal('')),
  pan: z.string().length(10, 'PAN must be 10 characters').optional().or(z.literal('')),
  monthly_budget: z.string().optional().or(z.literal('')),
});

const Signup = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const success = await signup({
      ...data,
      monthly_budget: parseFloat(data.monthly_budget) || 0,
      state: 'Maharashtra', // Default for demo
      business_type: 'MSME'
    });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans py-12">
      {/* Background Decor */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-black/50 backdrop-blur-3xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <UserPlus className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create Enterprise Account</h2>
            <p className="text-slate-500 text-sm font-medium">Join 500+ Indian MSMEs using AI to scale</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Business Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  {...register('business_name')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. Sharma Electronics"
                />
              </div>
              {errors.business_name && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.business_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">GSTIN (Optional)</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  {...register('gstin')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="27AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">PAN Number</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  {...register('pan')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  {...register('email')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  {...register('password')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Monthly Budget (₹)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input 
                  type="number" 
                  {...register('monthly_budget')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. 500000"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="group relative w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-white/20 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isSubmitting ? 'Onboarding...' : (
                  <>
                    Initialize CFO Suite <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account? <Link to="/login" className="text-white hover:text-blue-400 transition-colors font-black uppercase text-[10px] tracking-widest ml-2">Login Here</Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-3 text-slate-600">
           <Zap size={16} fill="currentColor" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Automated GST & Compliance Onboarding</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
