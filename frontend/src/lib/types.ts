// TypeScript types matching backend Pydantic schemas

export interface DemoAccount {
  id: string;
  holder_name: string;
  bank_name: string;
  account_suffix: string;
  display_label: string;
}

export interface DNADimension {
  score: number;
  label: string;
  explanation: string | null;
}

export interface FinancialDNA {
  income_stability: DNADimension;
  cash_flow_health: DNADimension;
  debt_pressure: DNADimension;
  savings_resilience: DNADimension;
  spending_stability: DNADimension;
  payment_discipline: DNADimension;
  computed_at: string;
}

export type ScoreBand = 'strong' | 'moderate' | 'weak';
export type BandColor = 'green' | 'amber' | 'red';

export interface TopFactor {
  name: string;
  label: string;
  direction: 'positive' | 'negative';
  magnitude: number;
}

export interface ResilienceScore {
  score: number;
  band: ScoreBand;
  band_color: BandColor;
  explanation_text: string;
  top_factors: TopFactor[] | null;
  computed_at: string;
}

export interface ConnectedAccountInfo {
  holder_name: string;
  bank_name: string;
  account_suffix: string;
  demo_account_id: string;
}

export interface LoanRecommendation {
  sustainable_limit: number;
  max_safe_emi: number;
  recommended_tenure_months: number;
  explanation_text: string;
  computed_at: string;
}

export interface FinancialEntryCreate {
  monthly_income: number;
  monthly_expenses_total: number;
  emi_amount: number;
  savings_balance: number;
  income_type: string;
  employment_tenure_months: number;
  missed_payments_last_year: number;
  note?: string;
}

export interface ScoreHistoryPoint {
  timestamp: string;
  score: number;
  band: ScoreBand;
  monthly_income: number;
  savings_balance: number;
}

export interface DashboardData {
  user_name: string;
  user_email: string;
  has_onboarded: boolean;
  resilience_score: ResilienceScore | null;
  dna: FinancialDNA | null;
  loan_recommendation: LoanRecommendation | null;
  score_history: ScoreHistoryPoint[];
}

export type ScenarioType = 'income_drop' | 'job_loss' | 'emergency_expense' | 'emi_increase';

export interface StressTestRequest {
  scenario: ScenarioType;
  magnitude: number;
}

export interface StressTestResult {
  scenario: ScenarioType;
  magnitude: number;
  original_score: number;
  perturbed_score: number;
  score_delta: number;
  months_to_distress: number | null;
  outcome_summary: string;
  explanation_text: string;
}

export interface AuthSyncResponse {
  id: string | number;
  firebase_uid: string;
  name: string;
  email: string;
  has_onboarded: boolean;
  has_linked_account: boolean;
}

