import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { Report } from '../types';
import { ReportCard } from '../components/reports/ReportCard';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PlusCircle, FileText, ArrowLeft } from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getMyReports(page, 6);
      setReports(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#3a405a]">
            My Submitted Surveillance Reports
          </h1>
          <p className="text-xs text-[#685044] mt-1">
            Track investigations, verified samples, and remedial measures taken on your reports.
          </p>
        </div>

        <Link
          to="/report-submission"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3a405a] hover:bg-[#2e3348] text-white text-xs font-bold rounded-xl shadow transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-[#99b2dd]" />
          Submit New Report
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" label="Loading your submission history..." />
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#685044]/20 space-y-3">
          <FileText className="w-12 h-12 text-[#685044]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#3a405a]">No Submissions on Record</h3>
          <p className="text-xs text-[#685044] max-w-sm mx-auto">
            You haven't submitted any water or symptom reports yet.
          </p>
          <Link
            to="/report-submission"
            className="inline-block px-4 py-2 bg-[#99b2dd] text-[#3a405a] font-bold text-xs rounded-lg mt-2"
          >
            Submit a Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} canManage={false} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
};
