
import React from 'react';
import { 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TransactionData } from '../types';

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 500 },
  { name: 'Thu', value: 280 },
  { name: 'Fri', value: 590 },
  { name: 'Sat', value: 320 },
  { name: 'Sun', value: 210 },
];

const COLORS = ['#d4af37', '#b8860b', '#daa520', '#ffd700', '#cfb53b', '#c5b358', '#e5e4e2'];

interface DashboardProps {
  transactions: TransactionData[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const recentTransactions = [...transactions].reverse().slice(0, 5);

  const getStatusInfo = (status: TransactionData['status']) => {
    switch (status) {
      case 'Pending': return { label: 'Awaiting Approval', color: 'bg-amber-400' };
      case 'Approved': return { label: 'Approved for Billing', color: 'bg-emerald-500' };
      case 'Rejected': return { label: 'Audit Rejected', color: 'bg-rose-500' };
      case 'Invoiced': return { label: 'Invoice Generated', color: 'bg-blue-500' };
      case 'Paid': return { label: 'Payment Completed', color: 'bg-indigo-600' };
      case 'In Transit': return { label: 'Moving to Hub', color: 'bg-orange-500' };
      case 'Received': return { label: 'Received at Hub', color: 'bg-teal-500' };
      default: return { label: status, color: 'bg-slate-400' };
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Console</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time oversight of Bharani Velli Maaligai operations.</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-2xl border shadow-sm flex items-center gap-3 text-xs font-bold text-slate-600">
          <Clock className="w-4 h-4 text-amber-600" />
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Weight Inward', value: `${transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.weight, 0), 0).toFixed(2)} g`, change: '+12%', up: true, icon: Package },
          { label: 'Pending Approvals', value: transactions.filter(t => t.status === 'Pending').length.toString(), change: 'Live', up: true, icon: Clock },
          { label: 'Total Invoiced', value: `₹ ${transactions.filter(t => t.status === 'Invoiced' || t.status === 'Paid').reduce((sum, t) => sum + t.items.reduce((s, i) => s + (i.amount || 0), 0), 0).toLocaleString()}`, change: '+8%', up: true, icon: TrendingUp },
          { label: 'Verified Nodes', value: 'Active', change: 'Online', up: true, icon: CheckCircle2 },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-all border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <stat.icon className="w-5 h-5 text-amber-600" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest flex items-center px-2 py-1 rounded-full ${stat.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Activity className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Weekly Weight Flow (g)</h3>
            </div>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none ring-1 ring-slate-100 focus:ring-amber-500">
              <option>916 Gold</option>
              <option>Fine Silver</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions - Dynamic Feed */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent Status</h3>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">Live Feed</span>
          </div>
          
          <div className="space-y-8">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => {
                const statusInfo = getStatusInfo(txn.status);
                return (
                  <div key={txn.lotNo} className="flex gap-5 group relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${statusInfo.color} ring-4 ring-white shadow-md relative z-10`}></div>
                      <div className="w-px h-full bg-slate-100 absolute top-3"></div>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">{txn.lotNo}</p>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter tabular-nums bg-slate-50 px-2 py-0.5 rounded">{txn.date}</span>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-bold text-slate-600">{txn.customerName}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${statusInfo.color.replace('bg-', 'text-')}`}>
                          {statusInfo.label}
                        </p>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {txn.branch}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-4 opacity-40">
                <Activity className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No activity detected in local storage</p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-10 py-4 text-[10px] font-black text-amber-700 bg-amber-50/50 border border-amber-100 rounded-2xl hover:bg-amber-50 transition-all uppercase tracking-[0.2em] shadow-sm">
            Audit Activity Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
