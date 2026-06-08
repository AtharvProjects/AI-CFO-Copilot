import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-black/50 backdrop-blur-3xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
              <Zap className="text-white" size={32} fill="white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm font-medium">Access your AI CFO command center</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Business Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  {...register('email')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-indigo-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  {...register('password')} 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-indigo-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                 <input type="checkbox" className="rounded bg-white/10 border-white/10 text-indigo-600 focus:ring-0 focus:ring-offset-0" />
                 <span className="text-xs text-slate-500">Remember session</span>
               </div>
               <Link to="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">Forgot Password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isSubmitting ? 'Authenticating...' : (
                <>
                  Enter Dashboard <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              New to AI CFO? <Link to="/register" className="text-white hover:text-indigo-400 transition-colors font-black uppercase text-[10px] tracking-widest ml-2">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-3 text-slate-600">
           <ShieldCheck size={16} />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">SOC2 Type II & RBI Compliant</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
