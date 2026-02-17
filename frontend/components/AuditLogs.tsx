
import React, { useState } from 'react';
import { 
  Terminal, 
  Zap, 
  Database, 
  AlertTriangle, 
  RefreshCcw, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  Trash2,
  Activity,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { AppState, TransactionData, View } from '../types';

interface AuditLogsProps {
  state: AppState;
  onClear: () => void;
  onStressTest: (txns: TransactionData[]) => void;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ state, onClear, onStressTest }) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerStressTest = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const branches = ['Erode Main', 'Salem West', 'Chennai Corporate', 'Coimbatore Hub'];
      const customers = ['Aditya Varma', 'Meera Nair', 'Siddharth Rao', 'Priya K.', 'Gopal Das'];
      const products = ['Gold Chain', 'Bangles', 'Silver Coin', 'Refined Bar'];
      
      const newTxns: TransactionData[] = Array.from({ length: 20 }).map((_, i) => ({
        branch: branches[Math.floor(Math.random() * branches.length)],
        refNo: `REF-STR-${1000 + i}`,
        lotNo: `LOT-STR-${5000 + i}`,
        date: new Date().toISOString().split('T')[0],
        customerAadhar: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customers[Math.floor(Math.random() * customers.length)],
        status: (['Pending', 'Approved', 'Paid', 'In Transit', 'Received'][Math.floor(Math.random() * 5)]) as any,
        items: [{
          sNo: 1,
          product: products[Math.floor(Math.random() * products.length)],
          piece: Math.floor(Math.random() * 5) + 1,
          weight: Number((Math.random() * 100).toFixed(3)),
          purity: '916',
          wastePercent: 2,
          netWeight: Number((Math.random() * 98).toFixed(3)),
          rate: 7240,
          amount: Math.floor(Math.random() * 500000)
        }],
        remarks: i % 5 === 0 ? 'Urgent Stress Load' : 'Simulation Data'
      }));

      onStressTest(newTxns);
      setIsSimulating(false);
      alert("Stress Test Complete: 20 high-load transactions injected into local storage.");
    }, 2000);
  };

  const dbSize = new Blob([JSON.stringify(state)]).size / 1024;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Audit & Stress Engine</h2>
          <p className="text-slate-500 text-sm">Monitor system integrity and perform resilience testing.</p>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
        >
          <Trash2 className="w-4 h-4" /> Hard Reset Database
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Simulation Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20">
                  <Zap className={`w-8 h-8 text-slate-900 ${isSimulating ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight uppercase italic">Stress Test Simulator</h3>
                  <p className="text-slate-400 text-sm font-medium">Inject synthetic high-volume traffic into the ERP.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Operational Load</p>
                  <p className="text-2xl font-black text-amber-500">20 <span className="text-xs text-slate-400 uppercase tracking-widest">Nodes / SEC</span></p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Complexity Depth</p>
                  <p className="text-2xl font-black text-emerald-500">Tier 3 <span className="text-xs text-slate-400 uppercase tracking-widest">Full Flow</span></p>
                </div>
              </div>

              <button 
                onClick={triggerStressTest}
                disabled={isSimulating}
                className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-50 transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95"
              >
                {isSimulating ? (
                  <><RefreshCcw className="w-5 h-5 animate-spin" /> Sequencing Packets...</>
                ) : (
                  <><Activity className="w-5 h-5 text-amber-500" /> Execute Stress Blast</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
             <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Terminal className="w-4 h-4 text-slate-400" /> Kernel System Logs
                </h3>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">All Systems Nominal</span>
             </div>
             <div className="p-8 space-y-4 font-mono text-[11px]">
                <div className="flex gap-4 text-slate-400">
                  <span className="text-slate-300">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-emerald-600 font-bold">INFO</span>
                  <span>LocalStorage driver initialized for persistence.</span>
                </div>
                <div className="flex gap-4 text-slate-400">
                  <span className="text-slate-300">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-amber-600 font-bold">WARN</span>
                  <span>High memory usage detected in transaction buffer.</span>
                </div>
                <div className="flex gap-4 text-slate-400">
                  <span className="text-slate-300">[{new Date(Date.now() - 5000).toLocaleTimeString()}]</span>
                  <span className="text-blue-600 font-bold">SYNC</span>
                  <span>Gemini Auditor handshake successful. Snapshot ready.</span>
                </div>
                {state.transactions.length > 10 && (
                  <div className="flex gap-4 text-slate-900 bg-amber-50 p-2 rounded-lg">
                    <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-amber-600 font-black">STRESS</span>
                    <span>Synthetic load detected. Registry handling {state.transactions.length} concurrent nodes.</span>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border p-8 shadow-sm space-y-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4 flex items-center gap-2">
                 <Gauge className="w-4 h-4 text-blue-500" /> Persistence Health
              </h4>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-slate-500">DB Footprint</span>
                       <span className="text-lg font-black text-slate-900">{dbSize.toFixed(2)} KB</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (dbSize / 500) * 100)}%` }}></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TXN Objects</p>
                       <p className="text-xl font-black text-slate-900">{state.transactions.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Master Records</p>
                       <p className="text-xl font-black text-slate-900">{state.masters.length}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100 space-y-6 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-amber-100 rounded-2xl">
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                 </div>
                 <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Compliance Guard</h4>
              </div>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                 Manual database resets and stress tests are logged for <span className="font-bold">Institutional Oversight</span>. Unauthorized purging of transaction history will trigger an immediate PMLA alert.
              </p>
              <button className="w-full py-3 bg-amber-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-800 transition-all">
                 Request Secure Archive
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
