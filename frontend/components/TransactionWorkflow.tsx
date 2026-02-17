
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  ArrowRight, 
  Save, 
  Printer, 
  User, 
  IdCard,
  Building2,
  Calendar
} from 'lucide-react';
import { TransactionData, MaterialRow } from '../types';

// Added Props interface to handle onSave passed from App.tsx
interface TransactionWorkflowProps {
  onSave: (txn: TransactionData) => void;
}

const TransactionWorkflow: React.FC<TransactionWorkflowProps> = ({ onSave }) => {
  const [step, setStep] = useState<'inward' | 'quotation'>('inward');
  const [formData, setFormData] = useState<TransactionData>({
    branch: 'Erode Main',
    refNo: 'REF-' + Math.floor(Math.random() * 10000),
    lotNo: 'LOT-' + Math.floor(Math.random() * 10000),
    date: new Date().toISOString().split('T')[0],
    customerAadhar: '',
    customerName: '',
    items: [
      { sNo: 1, product: 'Chain', piece: 1, weight: 12.5, purity: '916', wastePercent: 2, netWeight: 12.25 }
    ],
    status: 'Pending'
  });

  const addItem = () => {
    const newSNo = formData.items.length + 1;
    setFormData({
      ...formData,
      items: [...formData.items, { sNo: newSNo, product: '', piece: 1, weight: 0, purity: '916', wastePercent: 0, netWeight: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sNo: i + 1 }));
    setFormData({ ...formData, items: updated });
  };

  const updateItem = (index: number, field: keyof MaterialRow, value: any) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate Net Weight if weight or waste changes
    if (field === 'weight' || field === 'wastePercent') {
      const w = parseFloat(field === 'weight' ? value : updated[index].weight) || 0;
      const wp = parseFloat(field === 'wastePercent' ? value : updated[index].wastePercent) || 0;
      updated[index].netWeight = Number((w - (w * (wp / 100))).toFixed(3));
    }

    // Auto-calculate Amount if rate changes (for Quotation step)
    if (field === 'rate' || field === 'netWeight') {
      const r = parseFloat(field === 'rate' ? value : updated[index].rate || '0') || 0;
      const nw = updated[index].netWeight;
      updated[index].amount = Number((r * nw).toFixed(2));
    }

    setFormData({ ...formData, items: updated });
  };

  // Fixed Save Draft to actually call onSave prop
  const handleSave = () => {
    onSave(formData);
    alert("Draft saved and synchronized with backend.");
  };

  const totalWeight = formData.items.reduce((sum, item) => sum + item.weight, 0);
  const totalNetWeight = formData.items.reduce((sum, item) => sum + item.netWeight, 0);
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {step === 'inward' ? 'Material Inward' : 'Quotation Generation'}
          </h2>
          <p className="text-slate-500 text-sm">Processing Material Lot for Gold/Silver Procurement</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setStep('inward')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${step === 'inward' ? 'bg-white shadow text-amber-700' : 'text-slate-500'}`}
          >
            1. Material Inward
          </button>
          <button 
            onClick={() => setStep('quotation')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${step === 'quotation' ? 'bg-white shadow text-amber-700' : 'text-slate-500'}`}
          >
            2. Quotation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border space-y-4">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Branch Details</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Branch Name</label>
            <input 
              readOnly
              value={formData.branch}
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Lot Number</label>
              <input 
                readOnly
                value={formData.lotNo}
                className="w-full bg-amber-50 border-amber-200 border rounded-lg px-3 py-2 text-sm text-amber-900 font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Reference No</label>
              <input 
                readOnly
                value={formData.refNo}
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <div className="relative">
              <input 
                type="date"
                value={formData.date}
                className="w-full bg-white border rounded-lg px-3 py-2 text-sm" 
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl border space-y-4">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <User className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Customer Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">AADHAR Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter 12 digit AADHAR"
                    className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.customerAadhar}
                    onChange={(e) => setFormData({...formData, customerAadhar: e.target.value})}
                  />
                  <IdCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <button className="text-xs font-semibold text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                Verify KYC & Fetch Details
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
              <input 
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
              <p className="mt-2 text-[10px] text-slate-400 italic font-medium">Fields auto-filled from Customer Master if verified.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
            Product Details & Measurements
          </h3>
          <button 
            onClick={addItem}
            className="text-xs font-semibold bg-white border px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-16">SNo</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 w-24">Piece</th>
                <th className="px-4 py-3 w-32">Weight (g)</th>
                <th className="px-4 py-3 w-24">Purity</th>
                <th className="px-4 py-3 w-24">Waste %</th>
                <th className="px-4 py-3 w-32">Net Weight</th>
                {step === 'quotation' && (
                  <>
                    <th className="px-4 py-3 w-32">Rate (₹)</th>
                    <th className="px-4 py-3 w-40">Amount</th>
                  </>
                )}
                <th className="px-4 py-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {formData.items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-medium">{item.sNo}</td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      placeholder="e.g. Kolusu"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
                      value={item.product}
                      onChange={(e) => updateItem(index, 'product', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:ring-0 p-0"
                      value={item.piece}
                      onChange={(e) => updateItem(index, 'piece', parseInt(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      step="0.001"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 font-semibold"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      className="w-full bg-transparent border-none focus:ring-0 p-0"
                      value={item.purity}
                      onChange={(e) => updateItem(index, 'purity', e.target.value)}
                    >
                      <option value="916">916</option>
                      <option value="999">999</option>
                      <option value="18K">18K</option>
                      <option value="750">750</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:ring-0 p-0"
                      value={item.wastePercent}
                      onChange={(e) => updateItem(index, 'wastePercent', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-700">{item.netWeight.toFixed(3)}</td>
                  {step === 'quotation' && (
                    <>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          className="w-full bg-amber-50 border rounded px-2 py-1 focus:ring-0 font-semibold text-amber-900"
                          value={item.rate || ''}
                          placeholder="0.00"
                          onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹ {item.amount?.toLocaleString() || '0'}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t">
              <tr>
                <td colSpan={3} className="px-4 py-4 text-right text-slate-500 uppercase text-xs">Total Weight</td>
                <td className="px-4 py-4 text-slate-900">{totalWeight.toFixed(3)}g</td>
                <td colSpan={2} className="px-4 py-4 text-right text-slate-500 uppercase text-xs">Total Net Weight</td>
                <td className="px-4 py-4 text-amber-700">{totalNetWeight.toFixed(3)}g</td>
                {step === 'quotation' && (
                  <>
                    <td className="px-4 py-4 text-right text-slate-500 uppercase text-xs">Grand Total</td>
                    <td className="px-4 py-4 text-lg text-slate-900">₹ {totalAmount.toLocaleString()}</td>
                  </>
                )}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button className="flex items-center gap-2 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> Print {step === 'inward' ? 'Inward Slip' : 'Quotation'}
          </button>
        </div>
        <button 
          onClick={() => setStep(step === 'inward' ? 'quotation' : 'inward')}
          className="flex items-center gap-2 bg-amber-600 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-all shadow-md shadow-amber-200"
        >
          {step === 'inward' ? 'Move to Quotation' : 'Back to Inward Details'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {step === 'quotation' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
          <div className="p-2 bg-amber-200 rounded-full">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Send for RH Approval?</h4>
            <p className="text-sm text-amber-700 mb-4">Once confirmed, this quotation will be forwarded to the Regional Head for final rate verification and approval.</p>
            <button 
              onClick={() => {
                onSave({...formData, status: 'Pending'});
                alert("Submitted for RH Approval.");
              }}
              className="bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-amber-800"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock export for ShieldCheck which I'll use in the main render
const ShieldCheck = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;

export default TransactionWorkflow;
