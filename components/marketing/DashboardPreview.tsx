'use client';

import RevealOnScroll from '@/components/marketing/RevealOnScroll';

export default function DashboardPreview() {
  return (
    <section id="live" className="mx-auto w-full max-w-7xl px-6 py-12">
      <RevealOnScroll>
        <h2 className="text-center text-2xl font-semibold">Preview of dashboard data (demo)</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">Hardcoded examples to showcase how your data appears.</p>
      </RevealOnScroll>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <PreviewCardAcademic />
        <PreviewCardFinance />
        <PreviewCardOps />
      </div>
    </section>
  );
}

function PreviewCardAcademic() {
  return (
    <RevealOnScroll>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-medium">Academic Snapshot</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric colorBg="bg-indigo-50" colorText="text-indigo-700" value="96%" label="Attendance" />
          <Metric colorBg="bg-emerald-50" colorText="text-emerald-700" value="82%" label="Avg. Score" />
          <Metric colorBg="bg-amber-50" colorText="text-amber-700" value="74%" label="Curriculum" />
        </div>
        <div className="mt-4 h-28 rounded-md bg-gradient-to-br from-gray-50 to-white" />
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between"><span>Class 8 • Mathematics</span><span className="text-muted-foreground">Avg 84%</span></li>
          <li className="flex items-center justify-between"><span>Class 9 • Science</span><span className="text-muted-foreground">Avg 79%</span></li>
          <li className="flex items-center justify-between"><span>Class 7 • English</span><span className="text-muted-foreground">Avg 88%</span></li>
        </ul>
      </div>
    </RevealOnScroll>
  );
}

function PreviewCardFinance() {
  return (
    <RevealOnScroll delayMs={100}>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-medium">Finance Snapshot</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric colorBg="bg-emerald-50" colorText="text-emerald-700" value="₹4.2L" label="Fees Collected" />
          <Metric colorBg="bg-rose-50" colorText="text-rose-700" value="₹3.1L" label="Payroll" />
          <Metric colorBg="bg-blue-50" colorText="text-blue-700" value="62%" label="Budget Used" />
        </div>
        <div className="mt-4 h-28 rounded-md bg-gradient-to-br from-gray-50 to-white" />
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between"><span>Academics</span><span className="text-muted-foreground">₹1.4L</span></li>
          <li className="flex items-center justify-between"><span>Operations</span><span className="text-muted-foreground">₹1.1L</span></li>
          <li className="flex items-center justify-between"><span>Transport</span><span className="text-muted-foreground">₹0.6L</span></li>
        </ul>
      </div>
    </RevealOnScroll>
  );
}

function PreviewCardOps() {
  return (
    <RevealOnScroll delayMs={200}>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-medium">Operations & Transport</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric colorBg="bg-emerald-50" colorText="text-emerald-700" value="On Time" label="Bus #12" />
          <Metric colorBg="bg-amber-50" colorText="text-amber-700" value="Delayed" label="Bus #30" />
          <Metric colorBg="bg-blue-50" colorText="text-blue-700" value="OK" label="Facilities" />
        </div>
        <div className="mt-4 h-28 rounded-md bg-gradient-to-br from-gray-50 to-white" />
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between"><span>Safety</span><span className="text-muted-foreground">0 incidents</span></li>
          <li className="flex items-center justify-between"><span>Maintenance</span><span className="text-muted-foreground">3 tickets open</span></li>
          <li className="flex items-center justify-between"><span>Routes</span><span className="text-muted-foreground">A, B, C active</span></li>
        </ul>
      </div>
    </RevealOnScroll>
  );
}

function Metric({ colorBg, colorText, value, label }: { colorBg: string; colorText: string; value: string; label: string }) {
  return (
    <div className={`rounded-md ${colorBg} p-3`}>
      <div className={`text-xl font-semibold ${colorText}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}


