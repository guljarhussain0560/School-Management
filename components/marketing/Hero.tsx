'use client';

import Link from 'next/link';
import RevealOnScroll from '@/components/marketing/RevealOnScroll';

export default function Hero() {
  return (
    <header className="mx-auto w-full max-w-7xl px-6 py-12 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <RevealOnScroll>
          <h1 className="bg-gradient-to-br from-indigo-700 to-blue-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl">All-in-one School Management & Input Portal</h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">Real-time dashboard for Academics, Finance, and Operations with a beautiful Input Portal for teachers, admins, and transport managers.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700">Create your workspace</Link>
            <Link href="/login" className="rounded-lg bg-white px-5 py-3 text-sm font-medium shadow ring-1 ring-gray-200 hover:bg-gray-50">Log in</Link>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Autosave entries</span>
            <span>Role-based access</span>
            <span>Mobile-friendly</span>
          </div>
        </RevealOnScroll>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-2xl bg-gradient-to-br from-indigo-200/60 to-blue-200/60 blur-2xl" />
          <RevealOnScroll delayMs={150}>
            <div className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="h-64 rounded-md bg-gradient-to-br from-gray-50 to-white" />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </header>
  );
}


