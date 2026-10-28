import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services/reportService';
import { alertService } from '../services/alertService';
import { Report, Alert } from '../types';
import { ReportCard } from '../components/reports/ReportCard';
import { AlertsList } from '../components/dashboard/AlertsList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { PlusCircle, FileText, CheckCircle2, ShieldCheck, MapPin, Cpu } from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [villageAlerts, setVillageAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCitizenData = async () => {
      setLoading(true);
      try {
        const [reportsRes, alertsRes] = await Promise.all([
          reportService.getMyReports(1, 4),
          alertService.getAlerts({ village: user?.village, status: 'active', limit: 2 })
        ]);
        setReports(reportsRes.data || []);
        setVillageAlerts(alertsRes.data || []);
      } catch (err) {
        console.error('Failed to load citizen data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadCitizenData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading citizen portal records..." className="h-96" />;
  }

  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const verifiedCount = reports.filter((r) => r.status === 'verified').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Village Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f9dec9]/60 text-[#3a405a] text-xs font-bold rounded-full border border-[#685044]/20">
            <MapPin className="w-3.5 h-3.5 text-[#e9afa3]" />
            <span>Community Sentinel Jurisdiction: {user?.village}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a405a]">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#685044] max-w-xl">
            You can log contaminated water pumps, community diarrhea/fever symptoms, and track field remediation by local health workers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/smart-predict"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#99b2dd]/35 hover:bg-[#99b2dd]/55 text-[#3a405a] text-xs font-extrabold rounded-xl border border-[#99b2dd] transition-all"
          >
            <Cpu className="w-4 h-4 text-[#3a405a]" />
            SmartPredict ML
          </Link>
          <Link
            to="/report-submission"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3a405a] hover:bg-[#2e3348] text-white text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-5 h-5 text-[#99b2dd]" />
            Submit New Water Report
          </Link>
        </div>
      </div>

      {/* Village Early Warnings Banner if any */}
      {villageAlerts.length > 0 && (
        <AlertBanner
          type="warning"
          title={`Active Early Warning Flag: ${user?.village}`}
          message={villageAlerts[0].reason}
        />
      )}

      {/* Citizen Personal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#685044]/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#685044] uppercase">My Submissions</p>
            <h3 className="text-2xl font-black text-[#3a405a] mt-1">{reports.length}</h3>
            <p className="text-[11px] text-[#685044] mt-0.5">Total issues reported by you</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#99b2dd]/30 flex items-center justify-center text-[#3a405a]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#685044]/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#685044] uppercase">Field Verified</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{verifiedCount}</h3>
            <p className="text-[11px] text-[#685044] mt-0.5">Inspected by health workers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#685044]/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#685044] uppercase">Remediated / Resolved</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</h3>
            <p className="text-[11px] text-[#685044] mt-0.5">Action taken & cleared</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Submissions & Community Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#3a405a]">
              My Recent Reports
            </h3>
            <Link
              to="/my-reports"
              className="text-xs font-bold text-[#3a405a] hover:underline"
            >
              View Full History →
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#685044]/20 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#685044]/40 mx-auto" />
              <p className="text-sm font-bold text-[#3a405a]">No Submissions Yet</p>
              <p className="text-xs text-[#685044] max-w-sm mx-auto">
                If you observe cloudy water, unusual odor, or someone falling sick from the community handpump, please submit a report.
              </p>
              <Link
                to="/report-submission"
                className="inline-block px-4 py-2 bg-[#99b2dd] text-[#3a405a] font-bold text-xs rounded-lg"
              >
                Submit First Report
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} canManage={false} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Village Alerts and Water Safety Tips */}
        <div className="space-y-6">
          <AlertsList alerts={villageAlerts} canManage={false} />

          <div className="bg-white rounded-2xl p-5 border border-[#685044]/20 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-[#3a405a] tracking-wider">
              Rural Northeast Water Safety Rules
            </h4>
            <div className="text-xs text-[#685044] space-y-2 leading-relaxed">
              <p>• <strong>Rolling Boil:</strong> Boil well and river water for at least 60 seconds before cooking or drinking.</p>
              <p>• <strong>Halazone Chlorine:</strong> Drop 1 tablet per 20 liters of turbid flood water and wait 30 minutes.</p>
              <p>• <strong>Hand Washing:</strong> Wash hands thoroughly after handling livestock or farm irrigation canals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
