'use client';

import RevealOnScroll from '@/components/marketing/RevealOnScroll';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Visualizations() {
  return (
    <section id="viz" className="mx-auto w-full max-w-7xl px-6 py-12">
      <RevealOnScroll>
        <h2 className="text-center text-2xl font-semibold">See your data in multiple views</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">Trends, comparisons, distributions, and progress at a glance.</p>
      </RevealOnScroll>
      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <ChartCard title="Attendance trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[{d:'Mon',v:92},{d:'Tue',v:95},{d:'Wed',v:94},{d:'Thu',v:96},{d:'Fri',v:97}]}> 
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="d" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{stroke:'#e2e8f0'}} />
              <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#attGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Fee collection by class" delay={100}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{c:'VII',v:45},{c:'VIII',v:60},{c:'IX',v:52},{c:'X',v:66}]}> 
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="c" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill:'#f8fafc'}} />
              <Bar dataKey="v" radius={[4,4,0,0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Assignment completion" delay={200}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[{w:1,v:40},{w:2,v:55},{w:3,v:68},{w:4,v:78}]}> 
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="w" tick={{fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={{r:2}} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Budget distribution" delay={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{n:'Academics',v:45},{n:'Operations',v:30},{n:'Transport',v:25}]} dataKey="v" nameKey="n" outerRadius={60} innerRadius={30} paddingAngle={4}>
                {['#6366f1','#10b981','#f59e0b'].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ title, delay, children }: { title: string; delay?: number; children: React.ReactNode }) {
  return (
    <RevealOnScroll delayMs={delay ?? 0}>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">{title}</div>
        <div className="h-40">{children}</div>
      </div>
    </RevealOnScroll>
  );
}


