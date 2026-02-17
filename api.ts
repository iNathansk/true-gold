
import { AppState, TransactionData, MasterRecord } from './types';

// Relative path works because of the Vite proxy configuration
const API_BASE_URL = '/api';

export const ApiService = {
  async getFullState(): Promise<AppState | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/state`);
      if (!response.ok) throw new Error('Server not reachable');
      return await response.json();
    } catch (e) {
      console.warn("Backend unavailable. Using local storage.");
      return null;
    }
  },

  async syncTransaction(txn: TransactionData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txn),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  async syncMaster(record: MasterRecord): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/masters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  async updateGoldRate(rate: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/gold-rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
};
