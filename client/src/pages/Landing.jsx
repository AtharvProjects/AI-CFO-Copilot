import React from 'react';
import NavHeader from '../components/ui/nav-header';
import HeroSection from '../components/ui/glassmorphism-trust-hero';
import { CinematicHero } from '../components/ui/cinematic-landing-hero';
import { Calculator, ShieldCheck, MessageSquare, FileText, Banknote, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-8 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm hover:bg-white/10 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">
      {/* Sticky Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <NavHeader />
      </div>

      {/* Top Static Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-32 bg-zinc-950 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent tracking-tight">
              Built for the next generation of MSMEs
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
              Everything you need to manage your business finances in one place, powered by world-class AI agents.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calculator className="text-indigo-400" />} 
              title="GST Compliance" 
              desc="Automatic CGST/SGST splitting and real-time liability tracking." 
              delay={0.1}
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-400" />} 
              title="Audit Logs" 
              desc="Immutable ledger of every financial action for complete transparency." 
              delay={0.2}
            />
            <FeatureCard 
              icon={<MessageSquare className="text-blue-400" />} 
              title="AI CFO Advisor" 
              desc="Get strategic advice on cash flow and growth from specialized AI agents." 
              delay={0.3}
            />
            <FeatureCard 
              icon={<FileText className="text-orange-400" />} 
              title="OCR Invoicing" 
              desc="Upload any bill or receipt and watch the AI extract data in seconds." 
              delay={0.4}
            />
            <FeatureCard 
              icon={<Banknote className="text-purple-400" />} 
              title="Bank Reconciliation" 
              desc="Connect Indian or International banks and match statements instantly." 
              delay={0.5}
            />
            <FeatureCard 
              icon={<LayoutDashboard className="text-rose-400" />} 
              title="Visual Analytics" 
              desc="Real-time KPIs, scenario modeling, and 30-day cash forecasts." 
              delay={0.6}
            />
          </div>
        </div>
      </section>



      {/* New: High-Velocity Feature Showcase */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: AI Terminal Preview */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-black/50 rounded-3xl p-6 border border-white/10 shadow-2xl relative group"
            >
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-[10px] text-zinc-500 ml-2 font-mono">ai_cfo_advisor.log</span>
              </div>
              <div className="font-mono text-sm space-y-2">
                <p className="text-indigo-400">{" >> "} Initializing financial health audit...</p>
                <p className="text-zinc-400">[SYSTEM] Scanned 142 transactions from HDFC Bank.</p>
                <p className="text-zinc-400">[SYSTEM] OCR verified 12 new vendor bills.</p>
                <p className="text-emerald-400">{" >> "} ALERT: Anomaly detected in "Marketing" spend (+24%).</p>
                <p className="text-zinc-400">[ADVISOR] Recommendation: Reduce CAC by optimizing ad-spend.</p>
                <p className="text-indigo-400">{" >> "} Forecast: Cash runway extended to 184 days.</p>
                <motion.div 
                  animate={{ opacity: [0, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-4 bg-indigo-500 ml-1 translate-y-0.5" 
                />
              </div>
              <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
            </motion.div>

            {/* Right: Text Content */}
            <div className="space-y-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold leading-tight"
              >
                Financial Intelligence <br />
                <span className="text-indigo-500">at your fingertips.</span>
              </motion.h2 >
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 text-xl leading-relaxed font-light"
              >
                Stop guessing and start knowing. Our 4 specialized AI agents monitor your accounts 24/7, providing instant insights that used to take weeks of manual work.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">99.9% Accuracy</div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">RBI Compliant</div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">Zero-Manual Entry</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 md:p-20 text-center overflow-hidden shadow-2xl shadow-indigo-500/20"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
                Ready to scale?
              </h2>
              <p className="text-indigo-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Join the next generation of MSMEs using AI to automate their growth. Setup takes less than 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/dashboard" className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl">
                  Open Your Dashboard
                </Link>
                <Link to="/chat" className="px-10 py-5 bg-indigo-500 text-white rounded-2xl font-bold text-lg border border-white/20 hover:bg-indigo-400 transition-all hover:scale-105">
                  Talk to AI Advisor
                </Link>
              </div>
            </div>
            
            {/* Background elements for the CTA */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
      <footer className="py-12 bg-zinc-950 border-t border-white/10 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 AI CFO Copilot. All rights reserved.</p>
        <p className="mt-2 text-xs">Powered by Groq Llama 3.1 & Supabase</p>
      </footer>
    </div>
  );
}
