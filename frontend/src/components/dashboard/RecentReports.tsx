import React from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../../types';
import { ReportStatusBadge } from '../reports/ReportStatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { ArrowRight, Droplets } from 'lucide-react';

interface RecentReportsProps {
  reports: Report[];
  viewAllLink?: string;
}

export const RecentReports: React.FC<RecentReportsProps> = ({
  reports,
  viewAllLink = '/reports'
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#685044]/20 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#685044]/15 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#3a405a]">Recent Field Submissions</h3>
          <p className="text-xs text-[#685044]">Latest incoming citizen and health reports</p>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3a405a] hover:text-[#685044] transition-colors"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="divide-y divide-[#685044]/10">
        {reports.length === 0 ? (
          <p className="p-6 text-center text-xs text-[#685044]">No reports received yet</p>
        ) : (
          reports.slice(0, 5).map((r) => (
            <div
              key={r._id}
              className="p-4 hover:bg-[#f9dec9]/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f9dec9] flex items-center justify-center text-[#3a405a] flex-shrink-0 mt-0.5">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#3a405a]">{r.village}</span>
                    <span className="text-[10px] text-[#685044] bg-[#99b2dd]/20 px-1.5 py-0.5 rounded capitalize font-medium">
                      {r.sourceType}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#685044] mt-0.5">
                    Symptoms: <span className="capitalize">{r.symptoms.join(', ')}</span>
                  </p>
                  <p className="text-[10px] text-[#685044]/70 mt-0.5">
                    {formatDateTime(r.reportedAt)}
                  </p>
                </div>
              </div>
              <div>
                <ReportStatusBadge status={r.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
