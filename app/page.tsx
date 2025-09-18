'use client';

import Link from 'next/link';
import RevealOnScroll from '@/components/marketing/RevealOnScroll';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import Screens from '@/components/marketing/Screens';
import DashboardPreview from '@/components/marketing/DashboardPreview';
import Visualizations from '@/components/marketing/Visualizations';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <Navbar />

      <Hero />

      <Features />

      <Screens />

      <DashboardPreview />

      <Visualizations />

      <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Get started free</h3>
              <p className="mt-1 text-sm text-indigo-100">Create a workspace in minutes. Upgrade anytime as you scale.</p>
            </div>
            <div className="flex flex-wrap justify-start gap-3 md:justify-end">
              <Link href="/signup" className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-indigo-700 shadow hover:bg-indigo-50">Create account</Link>
              <Link href="/login" className="rounded-lg bg-indigo-500/30 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/40 hover:bg-indigo-500/40">I already have an account</Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}