
import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  ArrowLeft, 
  Package, 
  Truck, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  Search, 
  AlertCircle,
  QrCode,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { TransactionData, MaterialRow } from '../types';

// Added Props interface to handle inTransitLots and onUpdate passed from App.tsx
interface HubReceiptProps {
  inTransitLots: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const HubReceipt: React.FC<HubReceiptProps> = ({ inTransitLots: propInTransit, onUpdate }) => {
  const [selectedLot, setSelectedLot] = useState<TransactionData | null>(null);
  const [isPhysicallyVerified, setIsPhysicallyVerified] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'received'>('pending');

  // Use props if available, otherwise fallback to local mock data
  const [internalInTransit, setInternalInTransit] = useState<TransactionData[]>([]);

  useEffect(() => {
    if (propInTransit && propInTransit.length > 0) {
      setInternalInTransit(propInTransit);
    } else {
      // Mock Lots in Transit to Hub fallback
      setInternalInTransit([
        {
          branch: 'Erode Main',
          refNo: 'REF-8829',
          lotNo: 'LOT-4412',
          date: '2025-02-24',
          customerAadhar: '5566-7788-9900',
          customerName: 'Ravi Kumar',
          status: 'In Transit',
          items: [
            { sNo: 1, product: 'Chain', piece: 1, weight: 12.5, purity: '916', wastePercent: 2, netWeight: 12.25, rate: 7240, amount: 88690 },
            { sNo: 2, product: 'Bangles', piece: 2, weight: 24.0, purity: '916', wastePercent: 1.5, netWeight: 23.64, rate: 7240, amount: 171153.6 }
          ]
        }
      ]);
    }
  }, [propInTransit]);

  const calculateTotalPieces = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.piece, 0);
  const calculateTotalWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.weight, 0);
  const calculateTotalNetWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.netWeight, 0);

  const handleReceiptConfirmation = () => {
    if (!selectedLot) return;
    if (!isPhysicallyVerified) {
      alert("Please check the physical verification box to proceed.");
      return;
    }
    // Logic to move lot to Received status
    onUpdate(selectedLot.lotNo, { status: 'Received', remarks });
    alert(`Lot ${selectedLot.lotNo} has been successfully received at Hub.`);
    setSelectedLot(null);
    setIsPhysicallyVerified(false);
    setRemarks('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Hub Receipt Management</h2>
            <p className="text-slate-500 text-sm">Verify and receive material lots sent from branch locations.</p>
          </div>
          <div className="flex bg-white border rounded-xl p-1 shadow-sm">
             <button onClick={() => setActiveTab('pending')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-500'}`}>In Transit</button>
             <button onClick={() => setActiveTab('received')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'received' ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-500'}`}>History</button>
          </div>
       </header>

       {selectedLot ? (
         <div className="animate-in zoom-in duration-300">
            <button onClick={() => setSelectedLot(null)} className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Intake Queue
            </button>

            <div className="bg-white rounded-2xl border shadow-xl overflow-hidden ring-4 ring-indigo-50/50">
              <header className="px-8 py-6 bg-indigo-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">Hub Intake & Verification</h2>
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest leading-none mt-1">Physical Goods Receipt</p>
                    </div>
                </div>
                <div className="bg-indigo-800 px-4 py-2 rounded-xl flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-indigo-300" />
                    <span className="text-xs font-mono font-bold">SCAN LOT TAG</span>
                </div>
              </header>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-6 border-b border-slate-100">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Branch</p><p className="text-sm font-bold text-slate-900">{selectedLot.branch}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lot Ref #</p><p className="text-sm font-bold text-indigo-600">{selectedLot.lotNo}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer</p><p className="text-sm font-bold text-slate-900">{selectedLot.customerName}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sent Date</p><p className="text-sm font-bold text-slate-900">{selectedLot.date}</p></div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                      <Scale className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Verification Checklist</h3>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                          <tr>
                            <th className="px-4 py-3">SNo</th>
                            <th className="px-4 py-3">Product Description</th>
                            <th className="px-4 py-3">Sent Pcs</th>
                            <th className="px-4 py-3">Sent Weight</th>
                            <th className="px-4 py-3">Purity</th>
                            <th className="px-4 py-3 bg-indigo-50 text-indigo-700">Recv Weight (Manual)</th>
                            <th className="px-4 py-3 text-right">Match</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedLot.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-4 text-slate-400">{item.sNo}</td>
                              <td className="px-4 py-4 font-bold text-slate-900">{item.product}</td>
                              <td className="px-4 py-4 font-medium">{item.piece}</td>
                              <td className="px-4 py-4 font-medium">{item.weight}g</td>
                              <td className="px-4 py-4 font-bold text-slate-500">{item.purity}</td>
                              <td className="px-4 py-4 bg-indigo-50/50">
                                <input 
                                  type="number" 
                                  placeholder="0.000"
                                  className="w-full bg-white border border-indigo-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                              </td>
                              <td className="px-4 py-4 text-right">
                                <CheckCircle2 className="w-5 h-5 text-slate-200 inline-block" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Intake Remarks</label>
                      <textarea 
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                        placeholder="Note any weight discrepancies or physical damages..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                  </div>

                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => setIsPhysicallyVerified(!isPhysicallyVerified)}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm ${isPhysicallyVerified ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 hover:border-indigo-400'}`}
                        >
                          {isPhysicallyVerified && <CheckCircle2 className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-indigo-900 uppercase tracking-wide text-sm">Physical Goods Received : Tik Box</h4>
                          <p className="text-xs text-indigo-700">I confirm the receipt of this lot and have verified the physical weight against the system data.</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleReceiptConfirmation}
                        disabled={!isPhysicallyVerified}
                        className={`mt-6 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${isPhysicallyVerified ? 'bg-indigo-900 text-white hover:bg-indigo-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        Confirm Receipt & Update Inventory
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
       ) : (
         <div className="bg-white rounded-2xl border shadow-sm overflow-hidden border-slate-100">
          <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Truck className="w-4 h-4" /> Incoming Lots
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search Lot ID..." 
                  className="bg-white border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="bg-slate-50/50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <th className="px-8 py-4">Lot ID</th>
                      <th className="px-8 py-4">Origin</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Total Weight</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {(activeTab === 'pending' ? internalInTransit : []).map(lot => (
                     <tr key={lot.lotNo} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-5 font-bold text-slate-900">{lot.lotNo}</td>
                        <td className="px-8 py-5 text-slate-600 font-medium">{lot.branch}</td>
                        <td className="px-8 py-5 font-medium">{lot.customerName}</td>
                        <td className="px-8 py-5 font-bold">{calculateTotalWeight(lot.items).toFixed(3)}g</td>
                        <td className="px-8 py-5">
                           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                              <Truck className="w-3 h-3 mr-1" /> {lot.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button 
                             onClick={() => setSelectedLot(lot)}
                             className="bg-indigo-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-800 transition-all shadow-md active:scale-95 flex items-center gap-2 ml-auto"
                           >
                              <FileCheck className="w-3.5 h-3.5" /> Inspect & Receive
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             {(activeTab === 'received' || (activeTab === 'pending' && internalInTransit.length === 0)) && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                   <ShieldCheck className="w-12 h-12 mb-2 opacity-20" />
                   <p className="font-bold uppercase tracking-widest text-xs">No Intake History Found</p>
                </div>
             )}
          </div>
         </div>
       )}
    </div>
  );
};

export default HubReceipt;
