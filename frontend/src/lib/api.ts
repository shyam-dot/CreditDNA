import axios from 'axios';
import { auth } from './firebase';
import type {
  AuthSyncResponse,
  DashboardData,
  FinancialDNA,
  StressTestRequest,
  StressTestResult,
  LoanRecommendation,
} from './types';


const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function syncUser(
  firebase_uid: string,
  name: string,
  email: string
): Promise<AuthSyncResponse> {
  const { data } = await api.post<AuthSyncResponse>('/api/auth/sync', {
    firebase_uid,
    name,
    email,
  });
  return data;
}

// ── Financial Entries ─────────────────────────────────────────────────────────

export async function createFinancialEntry(
  payload: import('./types').FinancialEntryCreate
): Promise<DashboardData> {
  const { data } = await api.post<DashboardData>('/api/entries', payload);
  return data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/api/dashboard');
  return data;
}

// ── DNA Profile ───────────────────────────────────────────────────────────────

export async function getDnaProfile(): Promise<FinancialDNA> {
  const { data } = await api.get<FinancialDNA>('/api/profile/dna');
  return data;
}

// ── Stress Test ───────────────────────────────────────────────────────────────

export async function runStressTest(
  payload: StressTestRequest
): Promise<StressTestResult> {
  const { data } = await api.post<StressTestResult>('/api/stress-test', payload);
  return data;
}

// ── Loan Recommendation ───────────────────────────────────────────────────────

export async function getLoanRecommendation(): Promise<LoanRecommendation> {
  const { data } = await api.get<LoanRecommendation>('/api/loan-recommendation');
  return data;
}

export default api;
