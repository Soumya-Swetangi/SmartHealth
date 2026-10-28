import React from 'react';
import { Report } from '../../types';
import { ReportStatusBadge } from './ReportStatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { MapPin, Droplets, Calendar, User, Activity } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onUpdateStatus?: (report: Report) => void;
  canManage?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onUpdateStatus,
  canManage = false
}) => {
  const reporterName =
    typeof report.userId === 'object' && report.userId?.name
      ? report.userId.name
      : 'Anonymous Villager';

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#685044]/20 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f9dec9] flex items-center justify-center text-[#3a405a]">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#3a405a]">{report.village}</h4>
            <div className="flex items-center gap-1 text-[11px] text-[#685044]">
              <Calendar className="w-3 h-3" />
              <span>{formatDateTime(report.reportedAt)}</span>
            </div>
          </div>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="space-y-2 mb-4 text-xs text-[#3a405a]">
        <div className="flex items-center gap-2">
          <strong className="text-[#685044]">Water Point:</strong>
          <span className="capitalize font-semibold bg-[#99b2dd]/20 px-2 py-0.5 rounded text-[#3a405a]">
            {report.sourceType}
          </span>
        </div>

        <div>
          <strong className="text-[#685044] block mb-1">Symptoms Noted:</strong>
          <div className="flex flex-wrap gap-1.5">
            {report.symptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e9afa3]/30 text-[#3a405a] font-medium text-[11px] rounded-md"
              >
                <Activity className="w-3 h-3 text-[#3a405a]" />
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {report.description && (
          <p className="text-xs text-[#685044] bg-[#f9dec9]/30 p-2.5 rounded-xl border border-[#685044]/10 leading-relaxed italic">
            "{report.description}"
          </p>
        )}

        {report.resolutionNotes && (
          <div className="text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200">
            <strong>Action Note:</strong> {report.resolutionNotes}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#685044]/15 text-[11px] text-[#685044]">
        <span className="flex items-center gap-1 truncate max-w-[200px]">
          <User className="w-3 h-3" />
          By: {reporterName}
        </span>

        {canManage && onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus(report)}
            className="px-3 py-1 bg-[#3a405a] text-white hover:bg-[#2e3348] font-bold rounded-lg transition-colors text-xs"
          >
            Update Action
          </button>
        )}
      </div>
    </div>
  );
};
