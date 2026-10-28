import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ReportForm } from '../components/reports/ReportForm';
import { AlertBanner } from '../components/common/AlertBanner';
import { ShieldCheck, MapPin, Droplets, ArrowLeft } from 'lucide-react';

export const ReportSubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3a405a] hover:text-[#685044] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Protocol Banner */}
      <AlertBanner
        type="info"
        title="Citizen Surveillance Advisory"
        message="Your report contributes to early epidemiological anomaly detection. Submissions trigger automated thresholds notifying local health surveillance teams."
      />

      <ReportForm
        defaultVillage={user?.village}
        onSubmitSuccess={() => navigate(user?.role === 'citizen' ? '/citizen' : '/health-worker')}
      />
    </div>
  );
};
