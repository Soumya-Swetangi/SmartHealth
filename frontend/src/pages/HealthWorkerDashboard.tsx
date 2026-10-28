import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services/reportService';
import { alertService } from '../services/alertService';
import { api } from '../services/api';
import { Report, Alert, MapSpatialItem, ReportStatus } from '../types';
import { ReportCard } from '../components/reports/ReportCard';
import { AlertsList } from '../components/dashboard/AlertsList';
import { RiskMap } from '../components/maps/RiskMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  RefreshCw,
  MapPin,
  ClipboardCheck,
  Cpu
} from 'lucide-react';

export const HealthWorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mapItems, setMapItems] = useState<MapSpatialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Status Update Modal State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('under_review');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, alertsRes, mapRes] = await Promise.all([
        reportService.getReports({
          village: user?.village,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
          page: currentPage,
          limit: 6
        }),
        alertService.getAlerts({ village: user?.village, status: 'active' }),
        api.get('/analytics/map-data')
      ]);

      setReports(reportsRes.data || []);
      if (reportsRes.pagination) {
        setTotalPages(reportsRes.pagination.pages);
        setTotalReports(reportsRes.pagination.total);
      }
      setAlerts(alertsRes.data || []);

      if (mapRes.data?.data) {
        const reps = mapRes.data.data.reports || [];
        const tests = mapRes.data.data.waterTests || [];
        setMapItems([...reps, ...tests]);
      }
    } catch (err) {
      console.error('Failed to load health worker dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, statusFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const handleOpenStatusModal = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setResolutionNotes(report.resolutionNotes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedReport) return;
    setUpdating(true);
    try {
      await reportService.updateReportStatus(selectedReport._id, {
        status: newStatus,
        assignedTo: user?.id || user?._id,
        resolutionNotes
      });
      setSelectedReport(null);
      loadData();
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAcknowledgeAlert = async (alertItem: Alert) => {
    try {
      await alertService.updateAlertStatus(alertItem._id, {
        status: 'acknowledged',
        notes: `Acknowledged by ${user?.name} on ${new Date().toLocaleDateString()}`
      });
      loadData();
    } catch {
      alert('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertItem: Alert) => {
    try {
      await alertService.updateAlertStatus(alertItem._id, {
        status: 'resolved',
        notes: `Resolved following sanitary remediation by ${user?.name}`
      });
      loadData();
    } catch {
      alert('Failed to resolve alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#99b2dd]/30 text-[#3a405a] text-xs font-bold rounded-full mb-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-[#3a405a]" />
            <span>Field Health Sentinel Desk • {user?.village}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a405a]">
            Field Surveillance Hub
          </h1>
          <p className="text-xs text-[#685044] mt-1 max-w-xl">
            Triage community gastrointestinal reports, conduct sanitary inspections, and record water quality tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/smart-predict"
            className="inline-flex items-center gap-2 px-4 py-3 bg-[#99b2dd]/35 hover:bg-[#99b2dd]/55 text-[#3a405a] text-xs font-extrabold rounded-xl border border-[#99b2dd] transition-all"
          >
            <Cpu className="w-4 h-4 text-[#3a405a]" />
            SmartPredict ML
          </Link>
          <Link
            to="/water-tests"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#3a405a] hover:bg-[#2e3348] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <FlaskConical className="w-4 h-4 text-[#99b2dd]" />
            Record Water Test
          </Link>
          <button
            onClick={loadData}
            className="p-3 bg-white border border-[#685044]/25 text-[#3a405a] hover:bg-[#f9dec9]/30 rounded-xl transition-colors shadow-sm"
            title="Refresh Surveillance Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Alerts for this jurisdiction */}
      <AlertsList
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
        canManage={true}
      />

      {/* Main Section: Reports Queue with Filters */}
      <div className="bg-white rounded-3xl p-6 border border-[#685044]/20 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#685044]/15 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#3a405a]">
              Incoming Citizen Reports Queue
            </h3>
            <p className="text-xs text-[#685044]">
              {totalReports} total reports pending surveillance triage
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search symptom, source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] placeholder-[#685044]/50 focus:outline-none focus:ring-1 focus:ring-[#99b2dd]"
              />
              <Search className="w-3.5 h-3.5 text-[#685044] absolute left-2.5 top-2.5" />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] focus:outline-none focus:ring-1 focus:ring-[#99b2dd]"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Field Verified</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <LoadingSpinner size="md" label="Loading village submissions..." />
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-[#685044] text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-sm text-[#3a405a]">No Reports Found</p>
            <p className="text-[11px] mt-1">No community reports match current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                canManage={true}
                onUpdateStatus={handleOpenStatusModal}
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalReports}
        />
      </div>

      {/* Geospatial Map */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-[#3a405a] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#e9afa3]" />
          Regional GIS Disease Risk Map
        </h3>
        <RiskMap items={mapItems} height="480px" />
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={`Update Report Status: ${selectedReport?.village || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              Surveillance Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review (Investigating)</option>
              <option value="verified">Verified (Contamination Confirmed)</option>
              <option value="resolved">Resolved (Source Treated/Fixed)</option>
              <option value="rejected">Rejected (False Alarm)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              Resolution / Field Observation Notes
            </label>
            <textarea
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Chlorinated handpump with bleaching powder. Advised villagers to boil water for 48 hours..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#685044]/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={updating}
              onClick={handleSaveStatus}
            >
              Save Status Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HealthWorkerDashboard;
