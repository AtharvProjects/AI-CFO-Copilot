import React from 'react';
import NavHeader from '../components/ui/nav-header';
import HeroSection from '../components/ui/glassmorphism-trust-hero';
import { CinematicHero } from '../components/ui/cinematic-landing-hero';
import { Calculator, ShieldCheck, MessageSquare, FileText, Banknote, LayoutDashboard, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-xl hover:bg-white/5 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
       {icon}
    </div>
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Sticky Navigation */}
      <div className="fixed top-8 left-0 right-0 z-50 flex justify-center">
        <NavHeader />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <HeroSection />
        {/* Industry Ready Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-40 left-1/2 -translate-x-1/2 z-30 px-6 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full backdrop-blur-xl flex items-center gap-2"
        >
          <Zap size={14} className="text-indigo-400 fill-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">V2.0 Now Industry Ready for MSMEs</span>
        </motion.div>
      </div>

      {/* Trust Bar */}
      <section className="py-12 border-y border-white/5 bg-zinc-900/20 backdrop-blur-md relative z-20">
         <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">BANK-BRIDGE</div>
            <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter uppercase">GST-Portal</div>
            <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter uppercase">Groq AI</div>
            <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter uppercase">Supabase</div>
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-40 bg-zinc-950 relative z-20">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-32"
          >
            <h2 className="text-5xl md:text-8xl font-black mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tighter leading-none">
              Financial autonomy <br/> for modern builders.
            </h2>
            <p className="text-zinc-500 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
              We've automated the entire back-office so you can focus on scale. Powered by specialized L4 reasoning agents.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Calculator className="text-indigo-400" />} 
              title="GST Engine" 
              desc="Deep integration with Indian tax laws. Automatic ITC scans and GSTR reconciliation." 
              delay={0.1}
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-400" />} 
              title="Immutable Ledger" 
              desc="Every mutation is cryptographically logged. SOC2-ready audit trails for stakeholders." 
              delay={0.2}
            />
            <FeatureCard 
              icon={<MessageSquare className="text-blue-400" />} 
              title="CFO Advisors" 
              desc="4 specialized AI agents working 24/7 to analyze your burn, risk, and growth." 
              delay={0.3}
            />
            <FeatureCard 
              icon={<FileText className="text-orange-400" />} 
              title="AI OCR Portal" 
              desc="Industry-leading extraction for vendor bills. Automatic expense booking from photos." 
              delay={0.4}
            />
            <FeatureCard 
              icon={<Banknote className="text-purple-400" />} 
              title="Bank Bridge" 
              desc="Direct AA-link for Indian banks. Real-time feeds with zero-manual entry." 
              delay={0.5}
            />
            <FeatureCard 
              icon={<LayoutDashboard className="text-rose-400" />} 
              title="Command Center" 
              desc="Scenario modeling, real-time KPIs, and 6-month predictive liquidity charts." 
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Terminal Preview Section */}
      <section className="py-40 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-black/60 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative group"
            >
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
              <div className="font-mono text-sm space-y-4 text-zinc-300">
                <p className="text-indigo-400 font-bold">{" > "} Initializing CFO_Intelligence_Pod.v2</p>
                <p className="text-zinc-500 opacity-60">{" [AUTH] "} Identity verified via AA-Consent Token.</p>
                <p className="text-zinc-500 opacity-60">{" [DATA] "} Analyzing 340ms of transaction history...</p>
                <p className="text-emerald-400">{" [INSIGHT] "} Found ₹42,500 in unclaimed ITC from Q3.</p>
                <p className="text-amber-400">{" [ALERT] "} Subscription "SaaS-X" detected at 2x normal rate.</p>
                <p className="text-indigo-400">{" [MODEL] "} Recalculating runway: +24 days gained.</p>
                <motion.div 
                  animate={{ opacity: [0, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-5 bg-indigo-500 ml-1" 
                />
              </div>
              <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000" />
            </motion.div>

            <div className="space-y-10">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400"
              >
                <Shield size={12} className="text-indigo-400" /> Security by Design
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter"
              >
                Enterprise <br />
                <span className="text-indigo-500">transparency.</span>
              </motion.h2 >
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 text-xl leading-relaxed font-medium"
              >
                Every action is logged in an immutable vault. Our multi-agent architecture ensures zero blind spots in your business performance.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-12 pt-4"
              >
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-white">99.9%</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Accuracy</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-white">24/7</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Monitoring</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-white">L4</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">AI Reasoning</span>
                 </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] bg-gradient-to-br from-indigo-600 to-indigo-900 p-20 md:p-32 text-center overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]"
          >
            <div className="relative z-10">
              <h2 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter leading-none">
                Scale without <br className="hidden md:block" /> the friction.
              </h2>
              <p className="text-indigo-100 text-xl md:text-2xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed opacity-80">
                Join 500+ Indian MSMEs automating their financial future. Deployment takes minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                <Link to="/dashboard" className="px-14 py-6 bg-white text-indigo-900 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-indigo-900/50">
                  Enter Dashboard
                </Link>
                <Link to="/register" className="px-14 py-6 bg-indigo-500/20 backdrop-blur-xl border-2 border-white/20 text-white rounded-[2rem] font-black text-xl hover:bg-white hover:text-indigo-900 transition-all hover:scale-105">
                  Sign Up Free
                </Link>
              </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
            <Globe size={400} className="absolute -bottom-40 -right-40 text-white opacity-5 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      <footer className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
               <Zap className="text-indigo-400" size={20} />
             </div>
             <span className="font-black text-xl tracking-tighter uppercase">CFO Copilot</span>
          </div>
          <div className="flex gap-12 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
             <a href="#" className="hover:text-white transition-colors">Security</a>
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Compliance</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">&copy; 2026 Enterprise Edition</p>
        </div>
      </footer>
    </div>
  );
}
