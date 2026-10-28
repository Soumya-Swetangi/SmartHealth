export type UserRole = 'citizen' | 'health_worker' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  village: string;
  phone?: string;
  isActive?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  configError?: boolean;
  retryAfterSeconds?: number;
  data?: {
    phone: string;
    cooldownSeconds: number;
    expiresInSeconds: number;
  };
}

export type ReportSourceType =
  | 'handpump'
  | 'well'
  | 'river'
  | 'pond'
  | 'pipeline'
  | 'other';

export type ReportStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'resolved'
  | 'rejected';

export interface Report {
  _id: string;
  userId:
    | string
    | {
        _id?: string;
        name: string;
        email?: string;
        village?: string;
        phone?: string;
      };
  village: string;
  sourceType: ReportSourceType;
  symptoms: string[];
  description?: string;
  reportedAt: string;
  status: ReportStatus;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  assignedTo?:
    | string
    | {
        _id?: string;
        name: string;
        email?: string;
      };
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AlertRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  _id: string;
  village: string;
  riskLevel: AlertRiskLevel;
  reason: string;
  reportCount: number;
  symptomsInvolved: string[];
  status: AlertStatus;
  generatedAt: string;
  resolvedAt?: string;
  resolvedBy?:
    | string
    | {
        _id?: string;
        name: string;
        email?: string;
        role?: string;
      };
  notes?: string;
}

export type WaterTestResult = 'safe' | 'unsafe' | 'borderline';

export interface WaterTest {
  _id: string;
  reportId?: string | Partial<Report>;
  village: string;
  sourceType: string;
  testedBy:
    | string
    | {
        _id?: string;
        name: string;
        email?: string;
        village?: string;
        role?: string;
      };
  testDate: string;
  parameters: {
    pH?: number;
    turbidity?: number;
    chlorine?: number;
    coliform?: boolean;
    ecoli?: boolean;
  };
  result: WaterTestResult;
  notes?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'status_update' | 'system';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardOverviewStats {
  reports: {
    total: number;
    pending: number;
    verified: number;
    resolved: number;
    resolutionRate: number;
  };
  alerts: {
    active: number;
    critical: number;
    villagesAtRisk: number;
  };
  waterTests: {
    total: number;
    unsafe: number;
    contaminationRate: number;
  };
  users: {
    totalActive: number;
  };
}

export interface TrendDataPoint {
  date: string;
  total: number;
  diarrhea: number;
  fever: number;
  vomiting: number;
}

export interface SymptomDistributionItem {
  name: string;
  value: number;
}

export interface VillageComparisonItem {
  village: string;
  totalReports: number;
  activeAlerts: number;
  unsafeWater: number;
  highestRisk: string;
}

export interface MapSpatialItem {
  id: string;
  type: 'report' | 'waterTest';
  village: string;
  sourceType: string;
  symptoms?: string[];
  status?: string;
  description?: string;
  result?: string;
  parameters?: Record<string, any>;
  notes?: string;
  riskLevel: string;
  coordinates: [number, number]; // [lng, lat]
  timestamp: string;
}

export interface SmartPredictInput {
  state: string;
  district: string;
  village?: string;
  rainfall_mm: number;
  temperature_c: number;
  humidity_percent: number;
  water_ph: number;
  turbidity_ntu: number;
  water_contamination: number;
  sanitation_risk_score: number;
  population_density: number;
  recent_diarrheal_cases: number;
  historical_outbreak_count: number;
  monsoon_indicator: number;
  model_choice?: 'best_model' | 'random_forest' | 'xgboost';
}

export interface ContributingFactor {
  factor: string;
  impact: string;
  detail: string;
}

export interface OutbreakPrediction {
  _id: string;
  state?: string;
  district: string;
  village: string;
  predictionDate: string;
  targetWeekStart: string;
  targetWeekEnd: string;
  riskScore: number;
  risk_probability?: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  risk_classification?: 'Low' | 'Moderate' | 'High' | 'Critical' | string;
  predicted_outbreak?: boolean;
  prediction_horizon?: string;
  model?: string;
  model_choice?: string;
  rf_probability?: number;
  xgb_probability?: number;
  predictedDiseases: { disease: string; probability: number }[];
  contributing_factors?: ContributingFactor[];
  features: {
    state?: string;
    district?: string;
    rainfall_mm?: number;
    temperature_c?: number;
    humidity_percent?: number;
    water_ph?: number;
    turbidity_ntu?: number;
    water_contamination?: number;
    sanitation_risk_score?: number;
    population_density?: number;
    recent_diarrheal_cases?: number;
    historical_outbreak_count?: number;
    monsoon_indicator?: number;
    recentReportCount: number;
    symptomDiarrhea: number;
    symptomVomiting: number;
    symptomFever: number;
    waterPhLevel: number;
    waterTurbidity: number;
    waterContamination: number;
    populationDensity: number;
    seasonalFactor: number;
    historicalOutbreakRate: number;
  };
  modelVersion: string;
  confidence: number;
  training_data_type?: string;
  isDataSynthetic: boolean;
  disclaimer?: string;
  createdAt?: string;
}

export interface ModelMetricSplit {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
  positive_rate: number;
}

export interface ModelInfoResponse {
  status: string;
  modelVersion: string;
  training_data_type: string;
  isDataSynthetic: boolean;
  disclaimer: string;
  feature_columns: string[];
  evaluation?: {
    random_forest?: {
      val: ModelMetricSplit;
      test: ModelMetricSplit;
    };
    xgboost?: {
      val: ModelMetricSplit;
      test: ModelMetricSplit;
    };
    best_model?: string;
    note?: string;
  };
}
