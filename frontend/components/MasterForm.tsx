
import React, { useState } from 'react';
import { View, MasterRecord } from '../types';
import { Save, RotateCcw, Search, Filter, UserSearch, CheckCircle2, AlertCircle, XCircle, Plus, Database } from 'lucide-react';

interface MasterFormProps {
  type: View;
  records: MasterRecord[];
  onSave: (record: MasterRecord) => void;
}

const MasterForm: React.FC<MasterFormProps> = ({ type, records, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState<Record<string, string>>({});

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    record.identifier.includes(searchTerm) ||
    record.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFields = () => {
    switch(type) {
      case View.CustomerMaster:
        return [
          { key: 'name', label: 'Full Name', placeholder: 'Enter Name as per AADHAR' },
          { key: 'identifier', label: 'AADHAR Number', placeholder: '12-digit number' },
          { key: 'mobile', label: 'Mobile Number', placeholder: '10-digit number' },
          { key: 'dob', label: 'Date of Birth', type: 'date' },
          { key: 'email', label: 'Email Address', type: 'email' },
          { key: 'address', label: 'Residential Address', type: 'textarea' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State', type: 'select' },
        ];
      case View.FranchiseMaster:
        return [
          { key: 'id', label: 'Code', placeholder: 'FR-001' },
          { key: 'name', label: 'Name', placeholder: 'Enter Franchise Name' },
          { key: 'address', label: 'Address', type: 'textarea' },
          { key: 'contact', label: 'Contact #' },
          { key: 'hub', label: 'HUB', type: 'select' },
        ];
      default:
        return [
          { key: 'name', label: 'Name', placeholder: 'Enter name' },
          { key: 'identifier', label: 'Identifier Code' },
          { key: 'description', label: 'Description', type: 'textarea' }
        ];
    }
  };

  const handleSave = () => {
    if (!formState.name || !formState.identifier) return alert("Required fields missing.");
    
    const newRecord: MasterRecord = {
      id: formState.id || `${type.charAt(0)}-${Math.floor(Math.random() * 1000)}`,
      name: formState.name,
      identifier: formState.identifier,
      secondary: formState.mobile || formState.address,
      date: new Date().toLocaleDateString('en-GB'),
      kycStatus: type === View.CustomerMaster ? 'pending' : undefined,
      type: type,
      details: formState
    };
    
    onSave(newRecord);
    setFormState({});
    alert(`${type} record synchronized with backend.`);
  };

  const getKYCIndicator = (status: string) => {
    switch(status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">
      <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden ring-1 ring-slate-100">
        <header className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20">
              <Plus className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{type} Entry</h2>
              <p className="text-sm text-slate-400 font-medium">Create a new persistent record in the system database.</p>
            </div>
          </div>
          <button onClick={() => setFormState({})} className="relative z-10 p-3 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-xl">
            <RotateCcw className="w-5 h-5" />
          </button>
        </header>

        <form className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
          {getFields().map((field, i) => (
            <div key={i} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">
                {field.label}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea 
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-8 focus:ring-amber-50 focus:border-amber-200 outline-none transition-all h-32"
                  value={formState[field.key] || ''}
                  onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                />
              ) : field.type === 'select' ? (
                <select 
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-8 focus:ring-amber-50 outline-none transition-all appearance-none"
                  value={formState[field.key] || ''}
                  onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                >
                  <option value="">Choose Option</option>
                  <option>Tamil Nadu</option>
                  <option>Karnataka</option>
                  <option>Erode Hub</option>
                </select>
              ) : (
                <input 
                  type={field.type || 'text'}
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-8 focus:ring-amber-50 focus:border-amber-200 outline-none transition-all"
                  value={formState[field.key] || ''}
                  onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <div className="md:col-span-2 mt-4 pt-10 border-t flex justify-end gap-6">
            <button className="px-12 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest">
              <Save className="w-5 h-5" /> Sync with Backend
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
             <Database className="w-5 h-5 text-slate-400" />
             <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Persistent Archive</h3>
          </div>
          <div className="relative w-full md:w-96">
            <input 
              type="text"
              placeholder="Search Backend Records..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-400 text-[10px] uppercase font-black tracking-widest bg-slate-50/50">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Primary ID</th>
                <th className="px-6 py-4 text-right">Commit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record: MasterRecord) => (
                  <tr key={record.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-5">
                       {getKYCIndicator(record.kycStatus || 'verified')}
                    </td>
                    <td className="px-6 py-5 text-slate-900 font-black">{record.id}</td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-slate-900 font-bold">{record.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase mt-1">{record.secondary}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-500 font-bold">{record.identifier}</td>
                    <td className="px-6 py-5 text-right text-slate-400 font-black text-[10px] uppercase">{record.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center opacity-40 font-black uppercase tracking-widest text-[10px]">
                    No Persistent Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterForm;
