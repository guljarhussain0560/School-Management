'use client';

import RevealOnScroll from '@/components/marketing/RevealOnScroll';

export default function Features() {
  const items = [
    { title: 'Academic Monitoring', desc: 'Assignments, attendance, curriculum progress with rich charts', color: 'from-purple-500 to-pink-500' },
    { title: 'Finance & Payroll', desc: 'Fee collection, payroll uploads, budget utilization in real-time', color: 'from-emerald-500 to-teal-500' },
    { title: 'Operations & Transport', desc: 'Bus routes, GPS placeholders, maintenance and safety alerts', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-6 py-12">
      <h2 className="text-center text-2xl font-semibold">Everything you need to run your school</h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">Modern, colorful UI with Tailwind + shadcn components</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <RevealOnScroll key={f.title}>
            <div className="rounded-xl border bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className={`mb-3 h-10 w-10 rounded-md bg-gradient-to-br ${f.color}`} />
              <div className="text-base font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}


