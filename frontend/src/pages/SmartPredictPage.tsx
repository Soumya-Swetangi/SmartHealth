import React, { useState, useEffect } from 'react';
import { predictionService } from '../services/predictionService';
import {
  ModelInfoResponse,
  OutbreakPrediction,
  SmartPredictInput
} from '../types';
import { Button } from '../components/common/Button';
import {
  Cpu,
  Activity,
  Droplets,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  Clock,
  MapPin
} from 'lucide-react';

const NE_STATE_DISTRICTS: Record<string, string[]> = {
  Assam: [
    'Kamrup',
    'Dibrugarh',
    'Jorhat',
    'Silchar',
    'Nagaon',
    'Sonitpur',
    'Tinsukia',
    'Dhubri',
    'Barpeta',
    'Cachar'
  ],
  Meghalaya: ['East Khasi Hills', 'West Garo Hills', 'Ri Bhoi', 'Jaintia Hills'],
  Manipur: ['Imphal West', 'Imphal East', 'Churachandpur', 'Thoubal'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
  Tripura: ['West Tripura', 'North Tripura', 'South Tripura', 'Dhalai'],
  'Arunachal Pradesh': ['Papum Pare', 'Tawang', 'East Siang', 'Lohit'],
  Sikkim: ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim']
};

const SCENARIO_PRESETS: { label: string; badge: string; data: SmartPredictInput }[] = [
  {
    label: 'Monsoon Flood Surge (Kamrup, Assam)',
    badge: 'High / Critical Risk',
    data: {
      state: 'Assam',
      district: 'Kamrup',
      village: 'Sualkuchi Riverside',
      rainfall_mm: 285.0,
      temperature_c: 30.5,
      humidity_percent: 91.0,
      water_ph: 5.9,
      turbidity_ntu: 28.4,
      water_contamination: 1,
      sanitation_risk_score: 8.2,
      population_density: 640.0,
      recent_diarrheal_cases: 22,
      historical_outbreak_count: 4,
      monsoon_indicator: 1,
      model_choice: 'best_model'
    }
  },
  {
    label: 'Turbidity Cluster (East Khasi Hills, Meghalaya)',
    badge: 'Moderate Risk',
    data: {
      state: 'Meghalaya',
      district: 'East Khasi Hills',
      village: 'Mawlynnong Block',
      rainfall_mm: 165.0,
      temperature_c: 24.0,
      humidity_percent: 84.0,
      water_ph: 6.4,
      turbidity_ntu: 14.2,
      water_contamination: 1,
      sanitation_risk_score: 6.0,
      population_density: 310.0,
      recent_diarrheal_cases: 9,
      historical_outbreak_count: 2,
      monsoon_indicator: 1,
      model_choice: 'best_model'
    }
  },
  {
    label: 'Dry Season Safe Baseline (Aizawl, Mizoram)',
    badge: 'Low Risk',
    data: {
      state: 'Mizoram',
      district: 'Aizawl',
      village: 'Aizawl North',
      rainfall_mm: 24.0,
      temperature_c: 22.0,
      humidity_percent: 62.0,
      water_ph: 7.2,
      turbidity_ntu: 2.1,
      water_contamination: 0,
      sanitation_risk_score: 2.8,
      population_density: 220.0,
      recent_diarrheal_cases: 1,
      historical_outbreak_count: 0,
      monsoon_indicator: 0,
      model_choice: 'best_model'
    }
  }
];

export const SmartPredictPage: React.FC = () => {
  const [form, setForm] = useState<SmartPredictInput>(SCENARIO_PRESETS[0].data);
  const [currentPrediction, setCurrentPrediction] = useState<OutbreakPrediction | null>(null);
  const [history, setHistory] = useState<OutbreakPrediction[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [historyStateFilter, setHistoryStateFilter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchHistory(historyStateFilter);
  }, [historyStateFilter]);

  const fetchInitialData = async () => {
    setIsLoadingHistory(true);
    try {
      const [histRes, infoRes] = await Promise.allSettled([
        predictionService.getPredictionHistory({ limit: 15 }),
        predictionService.getModelInfo()
      ]);

      if (histRes.status === 'fulfilled' && histRes.value.success) {
        setHistory(histRes.value.data);
        if (histRes.value.data.length > 0 && !currentPrediction) {
          setCurrentPrediction(histRes.value.data[0]);
        }
      }

      if (infoRes.status === 'fulfilled' && infoRes.value.success) {
        setModelInfo(infoRes.value.data);
      }
    } catch (err) {
      console.error('Error loading initial ML data:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchHistory = async (stateFilter?: string) => {
    try {
      const res = await predictionService.getPredictionHistory({
        state: stateFilter || undefined,
        limit: 15
      });
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load prediction history:', err);
    }
  };

  const handleStateChange = (newState: string) => {
    const districts = NE_STATE_DISTRICTS[newState] || ['Central District'];
    setForm((prev) => ({
      ...prev,
      state: newState,
      district: districts[0],
      village: `${districts[0]} Central`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusBanner('');
    setIsSubmitting(true);

    try {
      const response = await predictionService.createPrediction(form);
      if (response.success) {
        setCurrentPrediction(response.data);
        setStatusBanner(
          `7-Day ML Outbreak Forecast generated and saved to MongoDB for ${response.data.village}, ${response.data.district} (${response.data.state || form.state}).`
        );
        await fetchHistory(historyStateFilter);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to run ML prediction. Ensure both Express backend (port 5000) and FastAPI ML service (port 8000) are running.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetData: SmartPredictInput) => {
    setForm({ ...presetData });
    setStatusBanner(`Loaded scenario preset: ${presetData.village}, ${presetData.district}`);
  };

  const getRiskPillClasses = (level?: string) => {
    const norm = (level || 'low').toLowerCase();
    if (norm === 'critical') return 'bg-rose-100 text-rose-800 border-rose-300';
    if (norm === 'high') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (norm === 'moderate' || norm === 'medium')
      return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const activeProbability = currentPrediction
    ? currentPrediction.risk_probability !== undefined
      ? currentPrediction.risk_probability * 100
      : currentPrediction.riskScore
    : 0;

  const rfEval = modelInfo?.evaluation?.random_forest?.test;
  const xgbEval = modelInfo?.evaluation?.xgboost?.test;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3a405a] text-[#f9dec9] text-xs font-bold mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#99b2dd]" />
            <span>Random Forest & XGBoost Outbreak Early Warning Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a405a]">
            SmartPredict — ML Outbreak Forecasting
          </h1>
          <p className="text-xs text-[#685044] mt-1 max-w-2xl">
            7-day water-borne disease outbreak risk inference across Northeast India using environmental, water-quality, and epidemiological features.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInitialData}
          className="flex items-center gap-1.5 font-bold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Model & History
        </Button>
      </div>

      {/* Scenario Presets */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#685044]">
          Quick Scenario Presets (Click to Populate Parameters)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCENARIO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset.data)}
              className="bg-white hover:bg-[#f9dec9]/40 p-4 rounded-2xl border border-[#685044]/20 shadow-sm text-left transition-all flex flex-col justify-between"
            >
              <span className="text-xs font-extrabold text-[#3a405a]">
                {preset.label}
              </span>
              <div className="flex items-center justify-between text-[11px] text-[#685044] mt-2 pt-2 border-t border-[#685044]/10">
                <span>
                  Rain: {preset.data.rainfall_mm}mm • pH: {preset.data.water_ph} • Cases:{' '}
                  {preset.data.recent_diarrheal_cases}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#99b2dd]/30 text-[#3a405a] font-bold text-[10px]">
                  {preset.badge}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <p className="font-bold">ML Service Connection Notice</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {statusBanner && !errorMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{statusBanner}</span>
        </div>
      )}

      {/* Main Grid: Input Form (7 cols) + Live ML Output (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#685044]/20 shadow-sm">
          <div className="border-b border-[#685044]/15 pb-4 mb-5">
            <h2 className="text-base font-extrabold text-[#3a405a] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#e9afa3]" />
              District Environmental & Epidemiological Feature Inputs
            </h2>
            <p className="text-xs text-[#685044] mt-0.5">
              All 13 features feed directly into the trained ColumnTransformer + Classifier pipeline
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
                  Northeast State
                </label>
                <select
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                >
                  {Object.keys(NE_STATE_DISTRICTS).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
                  District
                </label>
                <select
                  value={form.district}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      district: e.target.value,
                      village: `${e.target.value} Central`
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                >
                  {(NE_STATE_DISTRICTS[form.state] || [form.district]).map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
                  Village / Locality Label
                </label>
                <input
                  type="text"
                  value={form.village || ''}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                  placeholder="e.g. Sualkuchi Riverside"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
                  ML Classifier Artifact
                </label>
                <select
                  value={form.model_choice || 'best_model'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      model_choice: e.target.value as
                        | 'best_model'
                        | 'random_forest'
                        | 'xgboost'
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] font-semibold"
                >
                  <option value="best_model">Best Model (Validation ROC-AUC Winner)</option>
                  <option value="xgboost">XGBoost (XGBClassifier)</option>
                  <option value="random_forest">Random Forest (RandomForestClassifier)</option>
                </select>
              </div>
            </div>

            {/* Water Quality & Weather */}
            <div className="pt-3 border-t border-[#685044]/15">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#685044] mb-3 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#3a405a]" />
                Water Quality & Climatic Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Water pH (0–14)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={form.water_ph}
                    onChange={(e) =>
                      setForm({ ...form, water_ph: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                  <span className="text-[10px] text-[#685044]">Safe range: 6.5 – 8.5</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Turbidity (NTU)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="500"
                    value={form.turbidity_ntu}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        turbidity_ntu: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                  <span className="text-[10px] text-[#685044]">Safe threshold: &lt; 5 NTU</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Weekly Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="2000"
                    value={form.rainfall_mm}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rainfall_mm: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="-5"
                    max="50"
                    value={form.temperature_c}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        temperature_c: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={form.humidity_percent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        humidity_percent: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Coliform Contamination
                  </label>
                  <select
                    value={form.water_contamination}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        water_contamination: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                  >
                    <option value={1}>1 — Detected (Positive)</option>
                    <option value={0}>0 — Clear (Negative)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Surveillance & Vulnerability */}
            <div className="pt-3 border-t border-[#685044]/15">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#685044] mb-3 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-[#3a405a]" />
                Surveillance & Community Vulnerability Factors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Recent Diarrheal Cases (7d)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={form.recent_diarrheal_cases}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recent_diarrheal_cases: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Historical Outbreaks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.historical_outbreak_count}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        historical_outbreak_count: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Sanitation Risk (1–10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={form.sanitation_risk_score}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sanitation_risk_score: parseFloat(e.target.value) || 1
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Pop. Density (/km²)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="5"
                    max="25000"
                    value={form.population_density}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        population_density: parseFloat(e.target.value) || 100
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#3a405a] mb-1">
                    Season / Monsoon Indicator
                  </label>
                  <select
                    value={form.monsoon_indicator}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monsoon_indicator: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
                  >
                    <option value={1}>1 — Monsoon Season (May – September)</option>
                    <option value={0}>0 — Non-Monsoon / Dry Season</option>
                  </select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full font-extrabold shadow-md flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-[#99b2dd]" />
              Generate 7-Day Outbreak Forecast
            </Button>
          </form>
        </div>

        {/* Live ML Forecast Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#685044]/20 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#685044]/15">
              <div>
                <h2 className="text-base font-extrabold text-[#3a405a]">
                  ML Forecast Output
                </h2>
                <p className="text-xs text-[#685044]">
                  {currentPrediction
                    ? `${currentPrediction.village}, ${currentPrediction.district} (${
                        currentPrediction.state || 'Assam'
                      })`
                    : 'Submit parameters to run live inference'}
                </p>
              </div>
              {currentPrediction && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getRiskPillClasses(
                    currentPrediction.riskLevel
                  )}`}
                >
                  {currentPrediction.risk_classification || currentPrediction.riskLevel} Risk
                </span>
              )}
            </div>

            {currentPrediction ? (
              <div className="space-y-5">
                {/* Probability Box */}
                <div className="p-5 rounded-2xl bg-[#3a405a] text-[#f9dec9]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#f9dec9]/80 font-semibold">
                      Outbreak Risk Probability
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-[#99b2dd]">
                      {currentPrediction.prediction_horizon || 'Next 7 Days'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-4xl font-black text-white">
                      {activeProbability.toFixed(1)}%
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        currentPrediction.predicted_outbreak || activeProbability >= 50
                          ? 'bg-[#e9afa3] text-[#3a405a]'
                          : 'bg-[#99b2dd] text-[#3a405a]'
                      }`}
                    >
                      {currentPrediction.predicted_outbreak || activeProbability >= 50 ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Outbreak Likely
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Below Threshold
                        </>
                      )}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-white/15 mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(2, activeProbability))}%`,
                        backgroundColor:
                          activeProbability >= 75
                            ? '#e9afa3'
                            : activeProbability >= 50
                            ? '#f9dec9'
                            : '#99b2dd'
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase text-[#f9dec9]/60">
                        Active Classifier
                      </span>
                      <span className="font-bold text-white">
                        {currentPrediction.model || `Model v${currentPrediction.modelVersion}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase text-[#f9dec9]/60">
                        Model Confidence
                      </span>
                      <span className="font-bold text-white">
                        {((currentPrediction.confidence || 0.8) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* RF vs XGBoost Comparison */}
                {(currentPrediction.rf_probability !== undefined ||
                  currentPrediction.xgb_probability !== undefined) && (
                  <div className="p-4 rounded-2xl bg-[#f9dec9]/35 border border-[#685044]/15">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#3a405a] mb-3 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#3a405a]" />
                      Classifier Probability Comparison
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-[#3a405a]">
                            XGBClassifier (XGBoost)
                          </span>
                          <span className="font-extrabold text-[#3a405a]">
                            {((currentPrediction.xgb_probability || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#3a405a]/10">
                          <div
                            className="h-full rounded-full bg-[#3a405a]"
                            style={{
                              width: `${Math.min(
                                100,
                                (currentPrediction.xgb_probability || 0) * 100
                              )}%`
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-[#685044]">
                            RandomForestClassifier (scikit-learn)
                          </span>
                          <span className="font-extrabold text-[#685044]">
                            {((currentPrediction.rf_probability || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#3a405a]/10">
                          <div
                            className="h-full rounded-full bg-[#99b2dd]"
                            style={{
                              width: `${Math.min(
                                100,
                                (currentPrediction.rf_probability || 0) * 100
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suspected Disease Risk Breakdown */}
                {currentPrediction.predictedDiseases &&
                  currentPrediction.predictedDiseases.length > 0 && (
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#685044] mb-2">
                        Suspected Disease Risk Breakdown
                      </h3>
                      <div className="space-y-2">
                        {currentPrediction.predictedDiseases.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-[#f9dec9]/25 border border-[#685044]/15 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-[#3a405a] capitalize">
                              {item.disease.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-[#3a405a]/10 overflow-hidden">
                                <div
                                  className="h-full bg-[#3a405a] rounded-full"
                                  style={{
                                    width: `${Math.min(100, item.probability * 100)}%`
                                  }}
                                />
                              </div>
                              <span className="font-extrabold text-[#3a405a] w-12 text-right">
                                {(item.probability * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Contributing Risk Drivers */}
                {currentPrediction.contributing_factors &&
                  currentPrediction.contributing_factors.length > 0 && (
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#685044] mb-2">
                        Key Contributing Risk Drivers
                      </h3>
                      <div className="space-y-2">
                        {currentPrediction.contributing_factors.map((cf, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[#f9dec9]/40 border border-[#685044]/15 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-[#3a405a]">
                                {cf.factor}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  cf.impact === 'High'
                                    ? 'bg-rose-100 text-rose-800'
                                    : cf.impact === 'Moderate'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {cf.impact} Impact
                              </span>
                            </div>
                            <p className="text-[#685044] text-[11px]">{cf.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="py-12 text-center text-[#685044]">
                <Cpu className="w-10 h-10 mx-auto mb-3 text-[#3a405a]/40" />
                <p className="text-sm font-bold text-[#3a405a]">No Prediction Selected</p>
                <p className="text-xs mt-1">
                  Submit the form on the left to generate a live 7-day outbreak forecast.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Held-Out Test Set Evaluation Metrics Card */}
      {(rfEval || xgbEval) && (
        <div className="bg-white rounded-3xl p-6 border border-[#685044]/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#685044]/15">
            <div>
              <h2 className="text-base font-extrabold text-[#3a405a] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3a405a]" />
                Model Validation & Test Set Evaluation Metrics
              </h2>
              <p className="text-xs text-[#685044]">
                Chronological train/validation/test split evaluated on held-out Northeast India district-week observations
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              Selected Best Model: {(modelInfo?.evaluation?.best_model || 'xgboost').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {xgbEval && (
              <div className="p-4 rounded-2xl bg-[#f9dec9]/30 border border-[#685044]/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-[#3a405a] text-sm">
                    XGBClassifier (XGBoost)
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3a405a] text-[#f9dec9] font-bold">
                    ROC-AUC: {(xgbEval.roc_auc * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      Accuracy
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(xgbEval.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      Precision
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(xgbEval.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      Recall
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(xgbEval.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      F1-Score
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(xgbEval.f1 * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {rfEval && (
              <div className="p-4 rounded-2xl bg-[#f9dec9]/30 border border-[#685044]/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-[#3a405a] text-sm">
                    RandomForestClassifier (scikit-learn)
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#99b2dd]/50 text-[#3a405a] font-bold">
                    ROC-AUC: {(rfEval.roc_auc * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      Accuracy
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(rfEval.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      Precision
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(rfEval.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      Recall
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(rfEval.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#685044]/15">
                    <span className="block text-[10px] text-[#685044] font-semibold">
                      F1-Score
                    </span>
                    <span className="font-black text-sm text-[#3a405a]">
                      {(rfEval.f1 * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MongoDB Prediction History Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#685044]/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-extrabold text-[#3a405a] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#3a405a]" />
              Stored Outbreak Predictions (MongoDB History)
            </h2>
            <p className="text-xs text-[#685044]">
              Click any row to inspect its full disease breakdown and contributing risk drivers
            </p>
          </div>

          <select
            value={historyStateFilter}
            onChange={(e) => setHistoryStateFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
          >
            <option value="">All Northeast States</option>
            {Object.keys(NE_STATE_DISTRICTS).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {isLoadingHistory ? (
          <div className="py-10 text-center text-xs text-[#685044]">
            Loading prediction history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#685044]">
            No predictions recorded for this filter yet. Run a prediction above to save it to MongoDB.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3a405a]">
              <thead className="bg-[#f9dec9]/40 border-b border-[#685044]/15 text-[#685044] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Key Indicators</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Risk Probability</th>
                  <th className="py-3 px-4">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#685044]/10">
                {history.map((item) => {
                  const probPct =
                    item.risk_probability !== undefined
                      ? item.risk_probability * 100
                      : item.riskScore;
                  const ph =
                    item.features?.water_ph ?? item.features?.waterPhLevel ?? 7.0;
                  const turb =
                    item.features?.turbidity_ntu ?? item.features?.waterTurbidity ?? 1.0;
                  const cases =
                    item.features?.recent_diarrheal_cases ??
                    item.features?.recentReportCount ??
                    0;

                  return (
                    <tr
                      key={item._id}
                      onClick={() => setCurrentPrediction(item)}
                      className={`cursor-pointer transition-colors ${
                        currentPrediction?._id === item._id
                          ? 'bg-[#99b2dd]/25'
                          : 'hover:bg-[#f9dec9]/25'
                      }`}
                    >
                      <td className="py-3 px-4 text-[#685044] whitespace-nowrap">
                        {new Date(item.predictionDate).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#3a405a] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#e9afa3]" />
                          <span>
                            {item.village}, {item.district}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#685044]">
                          {item.state || 'Assam'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#685044]">
                        pH {Number(ph).toFixed(1)} • {Number(turb).toFixed(1)} NTU • {cases}{' '}
                        cases
                      </td>
                      <td className="py-3 px-4 font-medium text-[#3a405a]">
                        {item.model || `v${item.modelVersion}`}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-[#3a405a]">
                        {probPct.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRiskPillClasses(
                            item.riskLevel
                          )}`}
                        >
                          {item.risk_classification || item.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartPredictPage;
