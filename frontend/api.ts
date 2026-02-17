
import { AppState, TransactionData, MasterRecord, AuthUser, SalesOrder } from './types';
import { GoogleGenAI } from "@google/genai";

const API_BASE_URL = '/api';

const getHeaders = () => {
  const userString = localStorage.getItem('true_money_auth');
  const headers: any = { 'Content-Type': 'application/json' };
  if (userString) {
    const { token } = JSON.parse(userString);
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const ApiService = {
  async login(credentials: { username: string; password: string }): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) return null;
      const user = await response.json();
      localStorage.setItem('true_money_auth', JSON.stringify(user));
      return user;
    } catch (e) { return null; }
  },

  logout() { localStorage.removeItem('true_money_auth'); },

  async getFullState(): Promise<AppState | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/state`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Server unreachable');
      return await response.json();
    } catch (e) { return null; }
  },

  // --- Specialized Workflow Actions ---

  async logKYC(data: { aadharMasked: string; name: string; status: string; remarks: string }): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/kyc/verify`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return response.ok;
  },

  async rhApprove(lotNo: string, decision: 'Approved' | 'Rejected', remarks: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/approve`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ lotNo, decision, remarks })
    });
    return response.ok;
  },

  async finalizeInvoice(lotNo: string, remarks: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/invoice`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ lotNo, remarks })
    });
    return response.ok;
  },

  async verifyAccounts(lotNo: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/verify`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ lotNo })
    });
    return response.ok;
  },

  async initiateTransfer(data: { lotNo: string; vehicleNo: string; driverName: string; sealNumber: string }): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/transfer`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return response.ok;
  },

  async confirmReceipt(lotNo: string, remarks: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/receive`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ lotNo, remarks })
    });
    return response.ok;
  },

  async logMelting(data: { lotNo: string; inputWeight: number; outputWeight: number; operator: string; temperature: number }): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/melt`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return response.ok;
  },

  async executeDisbursement(data: { lotNo: string; paymentMode: string; referenceNo: string; amount: number }): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/workflow/disburse`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return response.ok;
  },

  // --- General Synchronization ---

  async syncTransaction(txn: TransactionData): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(txn)
    });
    return response.ok;
  },

  async syncMaster(record: MasterRecord): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/masters`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(record)
    });
    return response.ok;
  },

  async syncSalesOrder(order: SalesOrder): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/sales-orders`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(order)
    });
    return response.ok;
  },

  async updateMarketRates(gold: number, silver: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/settings/market-rates`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ gold, silver })
    });
    return response.ok;
  }
};

export const MarketService = {
  async fetchLiveRates() {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: "What is the current retail market price for 1 gram of 24K Gold and 1 gram of Silver in INR in India? Return ONLY JSON: {\"gold\": number, \"silver\": number}",
        config: { tools: [{ googleSearch: {} }] }
      });
      const jsonMatch = response.text?.match(/\{.*\}/s);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { gold: 7240, silver: 92 };
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Market Source',
        uri: chunk.web?.uri || ''
      })).filter((s: any) => s.uri) || [];
      return { gold: data.gold, silver: data.silver, sources };
    } catch (error) { 
      return { gold: 7240, silver: 92, sources: [] }; 
    }
  }
};
