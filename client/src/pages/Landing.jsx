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



      {/* Pricing Section moved to /pricing */}

      {/* Simple Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-white/10 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 AI CFO Copilot. All rights reserved.</p>
        <p className="mt-2 text-xs">Powered by Groq Llama 3.1 & Supabase</p>
      </footer>
    </div>
  );
}
