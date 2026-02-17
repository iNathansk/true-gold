
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ArrowLeft, 
  MessageSquare, 
  Calendar,
  Building2,
  User,
  Package,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { TransactionData, MaterialRow } from '../types';

interface ApprovalRequest extends TransactionData {
  requestedBy?: string;
}

// Added Props interface to handle requests and onUpdate passed from App.tsx
interface RHApprovalProps {
  requests: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const RHApproval: React.FC<RHApprovalProps> = ({ requests: propRequests, onUpdate }) => {
  const [selectedLot, setSelectedLot] = useState<ApprovalRequest | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [isQuotationVerified, setIsQuotationVerified] = useState(false);

  // Use props if available, otherwise fallback to local requests for safety
  const [internalRequests, setInternalRequests] = useState<ApprovalRequest[]>([]);

  useEffect(() => {
    if (propRequests && propRequests.length > 0) {
      setInternalRequests(propRequests);
    } else {
      // Mock Data fallback if props empty
      setInternalRequests([
        {
          branch: 'Erode Main',
          refNo: 'REF-8829',
          lotNo: 'LOT-4412',
          date: '2025-02-24',
          customerAadhar: '5566-7788-9900',
          customerName: 'Ravi Kumar',
          requestedBy: 'Suresh (Branch Manager)',
          status: 'Pending',
          items: [
            { sNo: 1, product: 'Chain', piece: 1, weight: 12.5, purity: '916', wastePercent: 2, netWeight: 12.25, rate: 7240, amount: 88690 },
            { sNo: 2, product: 'Bangles', piece: 2, weight: 24.0, purity: '916', wastePercent: 1.5, netWeight: 23.64, rate: 7240, amount: 171153.6 }
          ]
        }
      ]);
    }
  }, [propRequests]);

  const pendingRequests = internalRequests.filter(r => r.status === 'Pending');
  const historyRequests = internalRequests.filter(r => r.status !== 'Pending');

  const calculateTotalAmount = (items: MaterialRow[]) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const calculateTotalWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.weight, 0);
  const calculateTotalPieces = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.piece, 0);
  const calculateTotalNetWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.netWeight, 0);

  const handleDecision = (decision: 'Approved' | 'Rejected') => {
    if (!selectedLot) return;
    if (decision === 'Approved' && !isQuotationVerified) {
      alert("Please verify the quotation by checking the 'Verify Quotation' box first.");
      return;
    }
    if (!approvalRemarks.trim() && decision === 'Rejected') {
      alert("Please provide remarks for rejection.");
      return;
    }

    // Call the parent update handler
    onUpdate(selectedLot.lotNo, { status: decision, remarks: approvalRemarks });
    
    // Update local state for immediate feedback
    setInternalRequests(prev => prev.map(r => 
      r.lotNo === selectedLot.lotNo ? { ...r, status: decision, remarks: approvalRemarks } : r
    ));
    setSelectedLot(null);
    setApprovalRemarks('');
    setIsQuotationVerified(false);
  };

  if (selectedLot) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in zoom-in duration-300">
        <button 
          onClick={() => setSelectedLot(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <header className="px-8 py-6 bg-slate-50 border-b flex justify-between items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Branch</p>
                <p className="text-sm font-bold text-slate-900">{selectedLot.branch}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Ref No</p>
                <p className="text-sm font-bold text-slate-900">{selectedLot.refNo}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Lot #</p>
                <p className="text-sm font-bold text-amber-600">{selectedLot.lotNo}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Date</p>
                <p className="text-sm font-bold text-slate-900">{selectedLot.date}</p>
              </div>
            </div>
            <div className="px-6 py-2 bg-amber-50 rounded-lg border border-amber-100 hidden md:block">
              <p className="text-[10px] font-bold text-amber-700 uppercase">Verification Level</p>
              <p className="text-xs font-bold text-amber-900">RH APPROVAL (S5)</p>
            </div>
          </header>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Customer Details</p>
                <p className="text-sm font-bold text-slate-900">{selectedLot.customerName} ({selectedLot.customerAadhar})</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-4 py-3">1. SNo</th>
                    <th className="px-4 py-3">2. Product</th>
                    <th className="px-4 py-3">3. Piece</th>
                    <th className="px-4 py-3">4. Weight</th>
                    <th className="px-4 py-3">5. Purity</th>
                    <th className="px-4 py-3">6. Waste %</th>
                    <th className="px-4 py-3">7. Net Weight</th>
                    <th className="px-4 py-3">8. Rate</th>
                    <th className="px-4 py-3 text-right">9. Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedLot.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4">{item.sNo}</td>
                      <td className="px-4 py-4 font-bold text-slate-900">{item.product}</td>
                      <td className="px-4 py-4 font-medium">{item.piece}</td>
                      <td className="px-4 py-4 font-medium">{item.weight}g</td>
                      <td className="px-4 py-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{item.purity}</span></td>
                      <td className="px-4 py-4 text-slate-500">{item.wastePercent}%</td>
                      <td className="px-4 py-4 font-bold text-amber-700">{item.netWeight.toFixed(3)}g</td>
                      <td className="px-4 py-4 text-slate-600">₹ {item.rate?.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">₹ {item.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/50 border-t font-bold">
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-[10px] uppercase text-slate-500 text-right">Totals</td>
                    <td className="px-4 py-4 text-slate-900">{calculateTotalPieces(selectedLot.items)}</td>
                    <td className="px-4 py-4 text-slate-900">{calculateTotalWeight(selectedLot.items).toFixed(3)}g</td>
                    <td colSpan={2}></td>
                    <td className="px-4 py-4 text-amber-700">{calculateTotalNetWeight(selectedLot.items).toFixed(3)}g</td>
                    <td></td>
                    <td className="px-4 py-4 text-right text-slate-900">₹ {calculateTotalAmount(selectedLot.items).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setIsQuotationVerified(!isQuotationVerified)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${isQuotationVerified ? 'bg-amber-600 border-amber-600' : 'bg-white border-slate-300'}`}
                >
                  {isQuotationVerified && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Verify Quotation : Tik Box</h4>
                  <p className="text-[10px] text-amber-700">I confirm that all weights, purity levels, and rates have been cross-checked from the physical lot.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleDecision('Rejected')}
                  className="px-8 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  Reject
                </button>
                <button 
                  disabled={!isQuotationVerified}
                  onClick={() => handleDecision('Approved')}
                  className={`px-10 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${isQuotationVerified ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  Accept & Forward
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Decision Remarks</label>
              <textarea 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none h-24"
                placeholder="Enter audit remarks or rejection reasons..."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">RH Approval (Section 5)</h2>
          <p className="text-slate-500 text-sm">Verify branch quotations before Purchase Invoice generation.</p>
        </div>
        <div className="flex bg-white border rounded-xl p-1 shadow-sm">
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}>Pending</button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}>History</button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <th className="px-8 py-4">Lot ID</th>
              <th className="px-8 py-4">Origin Branch</th>
              <th className="px-8 py-4">Customer</th>
              <th className="px-8 py-4">Total Amount</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(activeTab === 'pending' ? pendingRequests : historyRequests).map((item) => (
              <tr key={item.lotNo} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5 font-bold text-slate-900">{item.lotNo}</td>
                <td className="px-8 py-5 text-slate-600 font-medium">{item.branch}</td>
                <td className="px-8 py-5 font-medium">{item.customerName}</td>
                <td className="px-8 py-5 font-bold">₹ {calculateTotalAmount(item.items).toLocaleString()}</td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => setSelectedLot(item)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-md">
                    {item.status === 'Pending' ? 'Inspect' : 'Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RHApproval;
