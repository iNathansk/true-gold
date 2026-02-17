
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, 
  IdCard, 
  User, 
  MapPin, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCcw, 
  Clock, 
  ChevronRight, 
  UserCheck,
  RotateCw,
  MapPinOff,
  Info,
  CheckCircle,
  XCircle,
  Fingerprint,
  Check,
  FileText
} from 'lucide-react';

interface KYCHistoryItem {
  id: string;
  aadhar: string;
  fullAadhar: string;
  name: string;
  address: string;
  status: 'success' | 'error';
  addressStatus: 'verified' | 'failed' | 'n/a';
  timestamp: string;
}

// Verhoeff Algorithm Tables for Aadhaar Checksum Validation
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const validateVerhoeff = (array: string) => {
  let c = 0;
  const invertedArray = array.replace(/\s/g, '').split('').map(Number).reverse();
  if (invertedArray.length !== 12) return false;
  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }
  return c === 0;
};

const KYCCheck: React.FC = () => {
  const [aadhar, setAadhar] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [addressVerified, setAddressVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [history, setHistory] = useState<KYCHistoryItem[]>([]);
  
  const formRef = useRef<HTMLDivElement>(null);

  // Auto-format Aadhaar with spaces
  const formatAadhar = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 12);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhar(formatAadhar(e.target.value));
  };

  // Regulatory Validation Engine
  const validation = useMemo(() => {
    const rawAadhar = aadhar.replace(/\s/g, '');
    const isAadharLen = rawAadhar.length === 12;
    const isAadharNumeric = /^\d+$/.test(rawAadhar);
    const isAadharChecksum = isAadharLen && isAadharNumeric && validateVerhoeff(rawAadhar);
    const isAadharNotDummy = isAadharLen && !/^(\d)\1{11}$/.test(rawAadhar);
    
    const isNameLen = name.trim().length >= 3;
    const isNameFormat = /^[a-zA-Z\s.]+$/.test(name);
    
    const isAddressLen = address.trim().length >= 15;
    const hasPincode = /\d{6}/.test(address);

    return {
      aadhar: {
        valid: isAadharLen && isAadharChecksum && isAadharNotDummy,
        checksum: isAadharChecksum,
        len: isAadharLen,
        dummy: !isAadharNotDummy && isAadharLen
      },
      name: {
        valid: isNameLen && isNameFormat,
        len: isNameLen,
        format: isNameFormat
      },
      address: {
        valid: isAddressLen && hasPincode,
        len: isAddressLen,
        pincode: hasPincode
      },
      allValid: (isAadharLen && isAadharChecksum && isAadharNotDummy) && 
                 (isNameLen && isNameFormat) && 
                 (isAddressLen && hasPincode)
    };
  }, [aadhar, name, address]);

  useEffect(() => {
    setHistory([
      { 
        id: 'KYC-9X2L4A', 
        aadhar: 'XXXX-XXXX-9012', 
        fullAadhar: '123456789012', 
        name: 'Ravi Kumar', 
        address: '123 Main St, Erode, TN 638001',
        status: 'success', 
        addressStatus: 'verified', 
        timestamp: '24 Feb 2025, 10:30 AM' 
      }
    ]);
  }, []);

  const performVerification = () => {
    if (!validation.allValid) return;

    setIsVerifying(true);
    setVerificationStatus('idle');

    // Simulate Secure Handshake with Identity Repository
    setTimeout(() => {
      setIsVerifying(false);
      const isIdentitySuccess = !name.toLowerCase().includes('dummy');
      const isAddressSuccess = isIdentitySuccess && (address.toLowerCase().includes('erode') || address.toLowerCase().includes('638'));
      
      const newStatus = isIdentitySuccess ? 'success' : 'error';
      const newMessage = isIdentitySuccess 
        ? 'Identity Verified Successfully. Demographic data matched with central records.' 
        : 'Demographic Mismatch. Please check Aadhaar number and name spelling.';

      setVerificationStatus(newStatus);
      setAddressVerified(isAddressSuccess);
      setStatusMessage(newMessage);

      const maskedAadhar = `XXXX-XXXX-${aadhar.replace(/\s/g, '').slice(-4)}`;
      const newEntry: KYCHistoryItem = {
        id: `KYC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        aadhar: maskedAadhar,
        fullAadhar: aadhar.replace(/\s/g, ''),
        name: isIdentitySuccess ? name : 'Verification Failed',
        address: address,
        status: newStatus,
        addressStatus: isIdentitySuccess ? (isAddressSuccess ? 'verified' : 'failed') : 'n/a',
        timestamp: new Date().toLocaleString('en-GB')
      };
      setHistory(prev => [newEntry, ...prev]);
    }, 2000);
  };

  const resetForm = () => {
    setAadhar('');
    setName('');
    setAddress('');
    setVerificationStatus('idle');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] border shadow-2xl overflow-hidden ring-1 ring-slate-200" ref={formRef}>
        <header className="px-10 py-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 ring-4 ring-slate-800">
              <Fingerprint className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                Digital KYC Gate
                <span className="text-[10px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-black uppercase tracking-widest">PMLA S-12</span>
              </h2>
              <p className="text-sm text-slate-400 font-medium">Compliance verification for high-value metal procurement.</p>
            </div>
          </div>
          {verificationStatus !== 'idle' && (
            <button onClick={resetForm} className="relative z-10 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-all uppercase tracking-widest bg-slate-800 px-5 py-2.5 rounded-full border border-slate-700">
              <RefreshCcw className="w-3.5 h-3.5" /> Start New
            </button>
          )}
        </header>

        <div className="p-10">
          {verificationStatus === 'success' ? (
            <div className="bg-white rounded-2xl p-8 space-y-10 animate-in zoom-in duration-500">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200 ring-8 ring-green-50 animate-in zoom-in spin-in-1 duration-700">
                  <CheckCircle2 className="w-14 h-14 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">KYC Authenticated</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto mt-2 leading-relaxed">{statusMessage}</p>
                </div>
              </div>

              {!addressVerified && (
                <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-[2rem] p-8 flex gap-8 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                  <div className="p-5 bg-amber-500 text-slate-900 rounded-2xl h-fit shadow-lg shadow-amber-500/20">
                    <MapPinOff className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-black text-amber-900">Address Mismatch Alert</h4>
                      <div className="relative group cursor-help">
                        <Info className="w-4 h-4 text-amber-500" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-80 p-5 bg-slate-900 text-white text-[11px] rounded-2xl shadow-2xl z-20 leading-relaxed font-normal normal-case animate-in fade-in zoom-in duration-200">
                           <p className="font-black mb-3 text-amber-400 uppercase tracking-widest text-[9px] border-b border-slate-800 pb-2">Why did this happen?</p>
                           <ul className="space-y-2 text-slate-300">
                               <li className="flex gap-2"><span className="text-amber-500">•</span> Input address deviates significantly from UIDAI XML record.</li>
                               <li className="flex gap-2"><span className="text-amber-500">•</span> Pincode 638... is not resolving to the Erode jurisdiction.</li>
                               <li className="flex gap-2"><span className="text-amber-500">•</span> Database timeout during deep-verification of village/ward codes.</li>
                           </ul>
                           <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-amber-800 font-medium leading-relaxed">Identity is confirmed, but address verification failed. Manual POI (Proof of Identity) collection is mandatory to proceed with billing.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-8 border-t border-slate-100">
                <button onClick={resetForm} className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 uppercase tracking-[0.2em]">
                  Process Next Client
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7 space-y-10">
                {/* Aadhaar Field */}
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    Customer Aadhaar (UID)
                    {validation.aadhar.valid && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`w-full border-2 rounded-2xl px-6 py-5 text-xl font-mono tracking-[0.25em] focus:ring-8 focus:ring-slate-100 outline-none transition-all ${
                        aadhar.length > 0 && !validation.aadhar.valid ? 'border-red-200 bg-red-50 text-red-900' : 'border-slate-100 bg-slate-50 text-slate-900'
                      } ${validation.aadhar.valid ? 'border-green-200 bg-green-50' : 'group-hover:border-slate-200'}`} 
                      placeholder="0000 0000 0000" 
                      value={aadhar} 
                      onChange={handleAadharChange} 
                      disabled={isVerifying} 
                    />
                    <IdCard className={`absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${validation.aadhar.valid ? 'text-green-500' : 'text-slate-300'}`} />
                  </div>
                  {aadhar.length > 0 && !validation.aadhar.valid && (
                    <p className="text-[10px] text-red-600 font-black mt-3 flex items-center gap-2 uppercase tracking-tight">
                      <AlertCircle className="w-3.5 h-3.5" /> 
                      {validation.aadhar.dummy ? 'Invalid dummy sequence' : !validation.aadhar.checksum ? 'Verhoeff checksum failed' : 'Aadhaar must be 12 digits'}
                    </p>
                  )}
                </div>

                {/* Name Field */}
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    Legal Name (As on Card)
                    {validation.name.valid && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`w-full border-2 rounded-2xl px-6 py-5 text-lg font-bold focus:ring-8 focus:ring-slate-100 outline-none transition-all ${
                        name.length > 0 && !validation.name.valid ? 'border-red-200 bg-red-50 text-red-900' : 'border-slate-100 bg-slate-50 text-slate-900'
                      } ${validation.name.valid ? 'border-green-200 bg-green-50' : 'group-hover:border-slate-200'}`} 
                      placeholder="ENTER FULL NAME" 
                      value={name} 
                      onChange={(e) => setName(e.target.value.toUpperCase())} 
                      disabled={isVerifying} 
                    />
                    <User className={`absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${validation.name.valid ? 'text-green-500' : 'text-slate-300'}`} />
                  </div>
                  {name.length > 0 && !validation.name.valid && (
                    <p className="text-[10px] text-red-600 font-black mt-3 flex items-center gap-2 uppercase tracking-tight">
                      <AlertCircle className="w-3.5 h-3.5" /> 
                      {!validation.name.format ? 'Special characters not allowed' : 'Legal name too short'}
                    </p>
                  )}
                </div>

                {/* Address Field */}
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    Residential Address & Pincode
                    {validation.address.valid && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </label>
                  <div className="relative">
                    <textarea 
                      rows={3} 
                      className={`w-full border-2 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-8 focus:ring-slate-100 outline-none transition-all ${
                        address.length > 0 && !validation.address.valid ? 'border-red-200 bg-red-50 text-red-900' : 'border-slate-100 bg-slate-50 text-slate-900'
                      } ${validation.address.valid ? 'border-green-200 bg-green-50' : 'group-hover:border-slate-200'}`} 
                      placeholder="STREET, AREA, CITY, PINCODE" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value.toUpperCase())} 
                      disabled={isVerifying} 
                    />
                    <MapPin className={`absolute right-6 top-8 w-6 h-6 transition-colors ${validation.address.valid ? 'text-green-500' : 'text-slate-300'}`} />
                  </div>
                  {address.length > 0 && !validation.address.valid && (
                    <p className="text-[10px] text-red-600 font-black mt-3 flex items-center gap-2 uppercase tracking-tight">
                      <AlertCircle className="w-3.5 h-3.5" /> 
                      {!validation.address.pincode ? 'Mandatory 6-digit Pincode missing' : 'Insufficient address depth'}
                    </p>
                  )}
                </div>

                <button 
                  onClick={performVerification} 
                  disabled={isVerifying || !validation.allValid} 
                  className={`w-full font-black py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm ${
                    validation.allValid ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isVerifying ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Performing Handshake...</>
                  ) : (
                    <><ShieldCheck className="w-6 h-6" /> Authenticate Records</>
                  )}
                </button>
              </div>

              {/* Compliance Status Sidebar */}
              <div className="lg:col-span-5 space-y-8">
                <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 space-y-8 shadow-inner">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-5 flex items-center gap-3">
                    <FileText className="w-4 h-4" /> Regulatory Checklist
                  </h4>
                  <div className="space-y-5">
                    <ComplianceRow 
                      label="Aadhaar Verhoeff Integrity" 
                      met={validation.aadhar.checksum} 
                      active={aadhar.length > 0} 
                    />
                    <ComplianceRow 
                      label="Demographic Format" 
                      met={validation.name.format} 
                      active={name.length > 0} 
                    />
                    <ComplianceRow 
                      label="Structural Address Check" 
                      met={validation.address.valid} 
                      active={address.length > 0} 
                    />
                    <ComplianceRow 
                      label="PMLA Compliance Minima" 
                      met={validation.allValid} 
                      active={true} 
                    />
                  </div>

                  <div className="pt-10 border-t border-slate-200">
                    <div className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="p-3 bg-blue-50 rounded-2xl shrink-0">
                        <Info className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Data is validated against <span className="font-bold text-slate-900">UIDAI Central Repository</span>. All transmissions are encrypted using 256-bit AES standards for financial safety.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center gap-6 shadow-sm">
                  <div className="p-4 bg-amber-100 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-xs text-amber-900 font-bold uppercase tracking-wide leading-tight">
                    KYC is mandatory for all transactions above <span className="text-amber-600 font-black underline">₹ 50,000</span> as per Govt notification.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Audit Logs */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <header className="px-10 py-8 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-slate-300" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Compliance Audit Trail</h3>
          </div>
          <span className="text-[10px] font-black bg-slate-900 text-white px-5 py-2 rounded-full uppercase tracking-widest">Archive: {history.length}</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                <th className="px-10 py-6 text-center w-24">Compliance</th>
                <th className="px-10 py-6">Identity Holder</th>
                <th className="px-10 py-6">Masked UID</th>
                <th className="px-10 py-6">Session Time</th>
                <th className="px-10 py-6 text-right">Audit Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    {item.status === 'success' ? (
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto ring-1 ring-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto ring-1 ring-red-100">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div>
                      <p className="font-black text-slate-900 text-base">{item.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        ID: {item.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8 font-mono text-xs text-slate-500 font-black tracking-[0.1em]">{item.aadhar}</td>
                  <td className="px-10 py-8 text-xs text-slate-400 font-bold">{item.timestamp}</td>
                  <td className="px-10 py-8 text-right">
                    <button className="text-[10px] font-black text-slate-900 uppercase border-b-2 border-slate-900 pb-1 hover:text-amber-600 hover:border-amber-600 transition-all">
                      Review Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ComplianceRow: React.FC<{ label: string; met: boolean; active: boolean }> = ({ label, met, active }) => (
  <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
    !active ? 'bg-transparent border-slate-100 opacity-40' : 
    met ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-red-50 border-red-200'
  }`}>
    <span className={`text-[11px] font-black uppercase tracking-wide ${!active ? 'text-slate-400' : met ? 'text-green-900' : 'text-red-900'}`}>
      {label}
    </span>
    {active ? (
      met ? <div className="p-1.5 bg-green-500 rounded-lg shadow-lg shadow-green-200"><Check className="w-3.5 h-3.5 text-white" /></div> : <div className="p-1.5 bg-red-500 rounded-lg shadow-lg shadow-red-200"><XCircle className="w-3.5 h-3.5 text-white" /></div>
    ) : (
      <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
    )}
  </div>
);

export default KYCCheck;
