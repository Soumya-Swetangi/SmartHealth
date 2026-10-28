import React from 'react';
import { ReportStatus } from '../../types';

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ status }) => {
  const configs = {
    pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      label: 'Pending Review'
    },
    under_review: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Under Review'
    },
    verified: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Field Verified'
    },
    resolved: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      label: 'Action Taken / Resolved'
    },
    rejected: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Declined'
    }
  };

  const current = configs[status] || configs.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
};
