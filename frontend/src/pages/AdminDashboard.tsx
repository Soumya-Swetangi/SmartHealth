import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { alertService } from '../services/alertService';
import { userService } from '../services/userService';
import {
  DashboardOverviewStats,
  TrendDataPoint,
  SymptomDistributionItem,
  VillageComparisonItem,
  MapSpatialItem,
  Alert
} from '../types';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ReportsTrendChart } from '../components/charts/ReportsTrendChart';
import { SymptomPieChart } from '../components/charts/SymptomPieChart';
import { VillageBarChart } from '../components/charts/VillageBarChart';
import { RiskMap } from '../components/maps/RiskMap';
import { AlertsList } from '../components/dashboard/AlertsList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import {
  ShieldAlert,
  RefreshCw,
  Users,
  Compass,
  Sparkles,
  Cpu
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardOverviewStats>({
    reports: { total: 0, pending: 0, verified: 0, resolved: 0, resolutionRate: 0 },
    alerts: { active: 0, critical: 0, villagesAtRisk: 0 },
    waterTests: { total: 0, unsafe: 0, contaminationRate: 0 },
    users: { totalActive: 0 }
  });

  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomDistributionItem[]>([]);
  const [villages, setVillages] = useState<VillageComparisonItem[]>([]);
  const [mapItems, setMapItems] = useState<MapSpatialItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, symptomsRes, villagesRes, mapRes, alertsRes] =
        await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/trends?days=14'),
          api.get('/analytics/symptoms'),
          api.get('/analytics/villages'),
          api.get('/analytics/map-data'),
          alertService.getAlerts({ status: 'active' })
        ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (trendsRes.data?.data) setTrends(trendsRes.data.data);
      if (symptomsRes.data?.data) setSymptoms(symptomsRes.data.data);
      if (villagesRes.data?.data) setVillages(villagesRes.data.data);

      if (mapRes.data?.data) {
        const reps = mapRes.data.data.reports || [];
        const tests = mapRes.data.data.waterTests || [];
        setMapItems([...reps, ...tests]);
      }

      setAlerts(alertsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSeedDatabase = async () => {
    if (!window.confirm('Seed demo dataset with realistic Northeast India data?')) return;
    setSeeding(true);
    setSeedNotice(null);
    try {
      await userService.seedDemoDatabase();
      setSeedNotice('Database seeded with Northeast India sample surveillance data!');
      await loadDashboardData();
    } catch (err: any) {
      setSeedNotice(`Seed error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleRunEarlyWarningEngine = async () => {
    setEvaluating(true);
    try {
      await alertService.triggerEvaluation();
      await loadDashboardData();
    } catch {
      alert('Error triggering early warning analysis');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAcknowledgeAlert = async (alertItem: Alert) => {
    try {
      await alertService.updateAlertStatus(alertItem._id, {
        status: 'acknowledged',
        notes: 'Acknowledged by Regional Director'
      });
      loadDashboardData();
    } catch {}
  };

  const handleResolveAlert = async (alertItem: Alert) => {
    try {
      await alertService.updateAlertStatus(alertItem._id, {
        status: 'resolved',
        notes: 'Sanitary remediation verified by Regional Command'
      });
      loadDashboardData();
    } catch {}
  };

  if (loading && stats.reports.total === 0) {
    return (
      <LoadingSpinner
        size="lg"
        label="Compiling Northeast regional epidemiological models..."
        className="h-96"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3a405a] text-[#f9dec9] text-xs font-bold rounded-full mb-2">
            <Compass className="w-3.5 h-3.5 text-[#99b2dd]" />
            <span>Regional Executive Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a405a]">
            Regional Epidemiological Command Dashboard
          </h1>
          <p className="text-xs text-[#685044] mt-1 max-w-xl">
            Surveillance of water-borne risks across Assam, Meghalaya, Manipur, Arunachal Pradesh, Nagaland, and surrounding Northeast hill districts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/smart-predict"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3a405a] hover:bg-[#2e3348] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Cpu className="w-4 h-4 text-[#99b2dd]" />
            SmartPredict ML
          </Link>

          <Button
            variant="secondary"
            size="sm"
            loading={evaluating}
            onClick={handleRunEarlyWarningEngine}
            className="flex items-center gap-1.5 font-bold shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-[#3a405a]" />
            Scan Warning Engine
          </Button>

          <Button
            variant="accent"
            size="sm"
            loading={seeding}
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 font-bold shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#3a405a]" />
            Seed Demo Dataset
          </Button>

          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#685044]/30 text-[#3a405a] hover:bg-[#f9dec9]/30 text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" />
            User Directory
          </Link>

          <button
            onClick={loadDashboardData}
            className="p-2.5 bg-white border border-[#685044]/30 text-[#3a405a] hover:bg-[#f9dec9]/40 rounded-lg transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {seedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-between">
          <span>{seedNotice}</span>
          <button onClick={() => setSeedNotice(null)} className="text-emerald-700 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <StatsCards stats={stats} />

      {/* Early-Warning Engine Active Alerts */}
      <AlertsList
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
        canManage={true}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportsTrendChart data={trends} />
        </div>
        <div>
          <SymptomPieChart data={symptoms} />
        </div>
      </div>

      {/* Village Vulnerability Bar Chart */}
      <div>
        <VillageBarChart data={villages} />
      </div>

      {/* GIS Leaflet Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#3a405a]">
            Interactive GIS Epidemiological Risk Map
          </h3>
          <span className="text-xs text-[#685044]">
            Spatial clustering of citizen reports & biological water test samples
          </span>
        </div>
        <RiskMap items={mapItems} height="520px" />
      </div>
    </div>
  );
};

export default AdminDashboard;
