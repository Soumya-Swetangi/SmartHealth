import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { alertService } from '../services/alertService';
import { Alert, AlertStatus, AlertRiskLevel } from '../types';
import { AlertsList } from '../components/dashboard/AlertsList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { AlertBanner } from '../components/common/AlertBanner';
import { Pagination } from '../components/common/Pagination';
import { ShieldAlert, RefreshCw, Filter, Sparkles } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts({
        status: statusFilter || undefined,
        riskLevel: riskFilter || undefined,
        page,
        limit: 10
      });
      setAlerts(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, riskFilter, page]);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      await alertService.triggerEvaluation();
      await loadAlerts();
    } catch {
      alert('Failed to run surveillance scan');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAcknowledge = async (alertItem: Alert) => {
    try {
      await alertService.updateAlertStatus(alertItem._id, {
        status: 'acknowledged',
        notes: `Acknowledged by ${user?.name}`
      });
      loadAlerts();
    } catch {
      alert('Failed to update alert');
    }
  };

  const handleResolve = async (alertItem: Alert) => {
    try {
      await alertService.updateAlertStatus(alertItem._id, {
        status: 'resolved',
        notes: `Intervention completed and cleared by ${user?.name}`
      });
      loadAlerts();
    } catch {
      alert('Failed to resolve alert');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e9afa3]/40 text-[#3a405a] text-xs font-bold rounded-full mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Early-Warning Algorithmic Triggers</span>
          </div>
          <h1 className="text-2xl font-black text-[#3a405a]">
            Epidemiological Risk Surveillance Center
          </h1>
          <p className="text-xs text-[#685044] mt-1 max-w-xl">
            Community anomaly indicators flagging unusual symptom clustering in 7-day surveillance windows.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'health_worker') && (
          <Button
            variant="primary"
            loading={evaluating}
            onClick={handleRunEvaluation}
            className="flex items-center gap-2 font-bold shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#99b2dd]" />
            Scan Threshold Engine
          </Button>
        )}
      </div>

      <AlertBanner
        type="disclaimer"
        title="Surveillance Indicator Disclaimer"
        message="Alerts are statistical flags calculated from unverified community symptom clusters. They serve as early warning cues for sanitary inspection and do NOT constitute confirmed clinical outbreaks."
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#685044]/20 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#685044]" />
          <span className="text-xs font-bold text-[#3a405a]">Filter Alerts:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Surges Only</option>
            <option value="acknowledged">Acknowledged / In Field</option>
            <option value="resolved">Resolved / Remediated</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
          >
            <option value="">All Severity Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="md" label="Loading active alert triggers..." />
      ) : (
        <>
          <AlertsList
            alerts={alerts}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            canManage={user?.role === 'admin' || user?.role === 'health_worker'}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
          />
        </>
      )}
    </div>
  );
};
