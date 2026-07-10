import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  ArrowUpRight, 
  Layers 
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  // Chart.js-like analytics dataset mapped nicely for Recharts Area
  const analyticsData = [
    { name: 'Jan', earnings: 180000, impressions: 1200 },
    { name: 'Feb', earnings: 250000, impressions: 1800 },
    { name: 'Mar', earnings: 420000, impressions: 2400 },
    { name: 'Apr', earnings: 380000, impressions: 2100 },
    { name: 'May', earnings: 620000, impressions: 3200 },
    { name: 'Jun', earnings: 850000, impressions: 4500 },
    { name: 'Jul', earnings: 1250000, impressions: 5800 }
  ];

  const stats = [
    { label: 'Net Earnings', value: '₦3,910,000.00', change: '+32.4%', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' },
    { label: 'Total Impressions', value: '20.8K', change: '+18.7%', icon: Eye, color: 'text-blue-400 bg-blue-500/10 border-blue-500/15' },
    { label: 'Active Projects', value: '4 Orders', change: 'On Track', icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15' },
    { label: 'Delivery Rate', value: '100%', change: 'Perfect', icon: CheckCircle, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15' }
  ];

  const recentOrders = [
    { id: 'ORD_101', client: 'John Doe', service: 'Build fullstack Fintech workspace', budget: '₦680,000', status: 'In Progress', deadline: '2 days' },
    { id: 'ORD_102', client: 'Sarah Smith', service: 'Figma SaaS Layout design', budget: '₦180,000', status: 'Delivered', deadline: 'Completed' },
    { id: 'ORD_103', client: 'Femi Alao', service: 'Tailwind React responsive landing page', budget: '₦75,000', status: 'Revision Requested', deadline: '1 day' },
    { id: 'ORD_104', client: 'Global Media', service: 'AI custom agent API proxy hook', budget: '₦320,000', status: 'In Progress', deadline: '5 days' }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Dashboard Welcome & Profile banner */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/60 pb-5 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Seller Enterprise Console</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Real-time revenue stream, gig traffic analytics, and active contracts.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all cursor-pointer">
            + List a New Service
          </button>
        </div>
      </section>

      {/* 2. Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#0E1320] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-base md:text-lg font-black text-white font-mono leading-none">{stat.value}</h3>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-bold font-mono inline-block">
                  {stat.change}
                </span>
              </div>
              <div className={`p-3.5 rounded-xl border ${stat.color}`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Recharts Earnings Visualizer Area Chart & Orders Summary Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics area chart */}
        <div className="lg:col-span-2 bg-[#0E1320] border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white tracking-wide">Revenue Stream Analytics</h3>
              <p className="text-[10px] text-slate-500 font-mono">Completed payments versus platform traffic</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-lg">
              <TrendingUp size={12} /> +12.4% MoM Growth
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level metrics & performance */}
        <div className="bg-[#0E1320] border border-slate-800/80 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide">Seller Badges Check</h3>
            <p className="text-[10px] text-slate-500 font-mono">Required standards for Top-Rated verification</p>
          </div>

          <div className="space-y-4 flex-1 mt-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>Response Time Rate</span>
                <span>100% (Target: &gt;90%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>On-Time Delivery Rate</span>
                <span>98% (Target: &gt;90%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>Order Completion Rate</span>
                <span>100% (Target: &gt;90%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Seller Level:</span>
            <span className="text-emerald-400 uppercase tracking-widest font-mono text-[10px]">Level 2 Pro Node</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Escrow Orders Queue */}
      <section className="bg-[#0E1320] border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide">Active Escrow Order Contracts</h3>
            <p className="text-[10px] text-slate-500 font-mono">Orders active inside the workrooms</p>
          </div>
          <button className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1">
            Manage Workrooms <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5">Order ID</th>
                <th className="py-2.5">Buyer</th>
                <th className="py-2.5">Requested Service</th>
                <th className="py-2.5">Escrow Budget</th>
                <th className="py-2.5">Contract Status</th>
                <th className="py-2.5">Deadline</th>
              </tr>
            </thead>
            <tbody className="text-xs font-sans divide-y divide-slate-850">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/20 transition-all">
                  <td className="py-3 font-mono font-bold text-slate-400">{ord.id}</td>
                  <td className="py-3 font-bold text-white">{ord.client}</td>
                  <td className="py-3 text-slate-300">{ord.service}</td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">{ord.budget}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.status === 'Delivered' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                        : ord.status === 'In Progress'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{ord.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
