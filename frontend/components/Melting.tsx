
import React, { useState } from 'react';
import { 
  Flame, 
  Scale, 
  ArrowRight, 
  BarChart3, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Tag,
  Hammer,
  Loader2
} from 'lucide-react';
import { TransactionData } from '../types';

interface MeltingProps {
  receivedLots: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const Melting: React.FC<MeltingProps> = ({ receivedLots, onUpdate }) => {
  const [selectedLot, setSelectedLot] = useState<TransactionData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [meltingData, setMeltingData] = useState({
    meltedWeight: 0,
    temperature: 1064,
    operator: 'K. Balan',
    remarks: ''
  });

  const totalInputWeight = selectedLot ? selectedLot.items.reduce((s,i)=>s+i.weight,0) : 0;
  const weightLoss = totalInputWeight - (meltingData.meltedWeight || 0);
  const lossPercent = totalInputWeight > 0 ? (weightLoss / totalInputWeight) * 100 : 0;

  const handleMeltSubmit = () => {
    if (!selectedLot || meltingData.meltedWeight <= 0) return alert("Please enter final melted weight.");
    
    setIsProcessing(true);
    setTimeout(() => {
      // In a real system, we might create a separate 'Bar' record here.
      // For this simulation, we mark the lot as 'Processed' or similar.
      onUpdate(selectedLot.lotNo, { 
        status: 'Approved', // Marking as ready for final sale/liquidation
        remarks: `Melted: ${meltingData.meltedWeight}g. Loss: ${weightLoss.toFixed(3)}g. Operator: ${meltingData.operator}` 
      });
      setIsProcessing(false);
      alert(`Melt Process Completed. Bar ID: BAR-${selectedLot.lotNo.split('-')[1]} generated.`);
      setSelectedLot(null);
    }, 1500);
  };

  if (selectedLot) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-300">
        <button onClick={() => setSelectedLot(null)} className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors">
          <RotateCcw className="w-4 h-4" /> Cancel Process
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6 border-orange-100">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-orange-100 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-600" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Melting Laboratory</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Process Lot: {selectedLot.lotNo}</p>
               </div>
            </div>

            <div className="space-y-4 pt-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Input Weight (System Record)</label>
                  <div className="text-2xl font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{totalInputWeight.toFixed(3)}g</div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block mb-2">Actual Melted Weight (Output)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.001"
                      className="w-full border-2 border-orange-200 rounded-xl px-4 py-4 text-xl font-black focus:ring-4 focus:ring-orange-100 outline-none text-orange-900"
                      placeholder="0.000"
                      value={meltingData.meltedWeight || ''}
                      onChange={(e)=>setMeltingData({...meltingData, meltedWeight: parseFloat(e.target.value)})}
                    />
                    <Scale className="absolute right-4 top-4 w-6 h-6 text-orange-300" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Process Remarks</label>
                  <textarea 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-50 outline-none h-20"
                    placeholder="Note any impurities..."
                    value={meltingData.remarks}
                    onChange={(e)=>setMeltingData({...meltingData, remarks: e.target.value})}
                  />
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl ring-1 ring-orange-500/20">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Melting Reconciliation</h4>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Refining Loss</span>
                    <span className="text-xl font-bold text-red-400">{weightLoss.toFixed(3)}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Loss Percentage</span>
                    <span className={`text-xl font-bold ${lossPercent > 5 ? 'text-amber-500' : 'text-green-400'}`}>
                      {lossPercent.toFixed(2)}%
                    </span>
                  </div>
                  {lossPercent > 5 && (
                    <div className="flex items-start gap-3 bg-red-900/30 border border-red-800/50 p-4 rounded-xl animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-[10px] text-red-300 leading-normal uppercase font-bold tracking-tight">Warning: Melting loss exceeds standard threshold. Audit required.</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-800">
                    <button 
                      onClick={handleMeltSubmit}
                      disabled={isProcessing}
                      className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Hammer className="w-4 h-4" /> Cast Bar & Close Lot</>}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Melting & Refining</h2>
            <p className="text-slate-500 text-sm">Convert physical lots into standardized bullion bars.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 font-bold text-[10px] uppercase tracking-widest">
            <Flame className="w-4 h-4 animate-pulse" /> Furnace Standby
          </div>
       </header>

       <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <Scale className="w-4 h-4" /> Available for Casting
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="bg-slate-50/50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <th className="px-8 py-4">Lot ID</th>
                      <th className="px-8 py-4">Received From</th>
                      <th className="px-8 py-4">System Weight</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {receivedLots.map(lot => (
                     <tr key={lot.lotNo} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-900">{lot.lotNo}</td>
                        <td className="px-8 py-5 text-slate-600">{lot.branch}</td>
                        <td className="px-8 py-5 font-bold text-slate-900">{lot.items.reduce((s,i)=>s+i.weight,0).toFixed(3)}g</td>
                        <td className="px-8 py-5">
                           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-green-100 text-green-700">Lot Verified</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button 
                             onClick={() => setSelectedLot(lot)}
                             className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-orange-700 transition-all shadow-md active:scale-95"
                           >
                              Refine Metal
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             {receivedLots.length === 0 && (
               <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                  <Flame className="w-12 h-12 mb-2 opacity-10" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No verified lots pending refinement</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default Melting;
