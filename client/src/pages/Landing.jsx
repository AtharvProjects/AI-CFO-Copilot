import React from 'react';
import NavHeader from '../components/ui/nav-header';
import HeroSection from '../components/ui/glassmorphism-trust-hero';
import { ShiningText } from '../components/ui/shining-text';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">
      {/* Sticky Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <NavHeader />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* AI Processing Demo Section */}
      <div className="py-24 bg-zinc-900 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=800&q=80')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-white">Experience AI-Driven Accuracy</h2>
          <div className="p-8 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col items-center gap-6">
            <div className="w-full flex justify-between items-center px-4 py-3 bg-zinc-900 rounded-lg border border-white/5">
              <span className="text-zinc-400 font-mono text-sm">Parsing invoice_1042.pdf...</span>
              <ShiningText text="AI Copilot is thinking..." />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {['Vendor: AWS', 'Amount: ₹4,500', 'Tax: ₹810', 'Cat: Software'].map((tag, i) => (
                <div key={i} className="px-4 py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-sm">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section moved to /pricing */}

      {/* Simple Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-white/10 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 AI CFO Copilot. All rights reserved.</p>
        <p className="mt-2 text-xs">Powered by Groq Llama 3.1 & Supabase</p>
      </footer>
    </div>
  );
}
