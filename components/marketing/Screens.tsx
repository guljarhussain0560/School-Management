'use client';

import RevealOnScroll from '@/components/marketing/RevealOnScroll';

export default function Screens() {
  return (
    <section id="screens" className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="grid gap-6 md:grid-cols-3">
        {[1,2,3].map((i) => (
          <RevealOnScroll key={i} delayMs={i * 100}>
            <div className="rounded-xl border bg-white p-3 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="h-52 rounded-md bg-gradient-to-br from-gray-50 to-white" />
              <div className="mt-3 text-sm font-medium">Beautiful, actionable screens</div>
              <div className="text-xs text-muted-foreground">Dashboard • Input Portal • Reports</div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}


