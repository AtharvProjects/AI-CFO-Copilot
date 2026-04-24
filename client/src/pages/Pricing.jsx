import React from 'react';
import NavHeader from '../components/ui/nav-header';
import { PricingContainer } from '../components/ui/pricing-container';

const PRICING_PLANS = [
  { name: "Starter", monthlyPrice: 0, yearlyPrice: 0, features: ["1 User", "50 Transactions/mo", "Basic Categorization", "Standard Support"], isPopular: false, accent: "bg-indigo-500", rotation: -2 },
  { name: "Pro", monthlyPrice: 1999, yearlyPrice: 19990, features: ["3 Users", "Unlimited Transactions", "4 AI CFO Agents", "Priority Support"], isPopular: true, accent: "bg-indigo-600", rotation: 1 },
  { name: "Enterprise", monthlyPrice: 4999, yearlyPrice: 49990, features: ["Unlimited Users", "Multi-GSTIN Support", "Custom Integrations", "24/7 Dedicated Support"], isPopular: false, accent: "bg-indigo-800", rotation: 2 },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden pt-32 pb-12">
      {/* Sticky Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <NavHeader />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <PricingContainer title="Transparent Pricing for MSMEs" plans={PRICING_PLANS} />
      </div>

      {/* Simple Footer */}
      <footer className="mt-24 py-12 border-t border-white/10 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 AI CFO Copilot. All rights reserved.</p>
        <p className="mt-2 text-xs">Powered by Groq Llama 3.1 & Supabase</p>
      </footer>
    </div>
  );
}
