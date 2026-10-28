import React from 'react';
import { AlertTriangle, Info, CheckCircle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface AlertBannerProps {
  type?: 'warning' | 'critical' | 'info' | 'success' | 'disclaimer';
  title?: string;
  message: string;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'warning',
  title,
  message,
  className = ''
}) => {
  const configs = {
    warning: {
      bg: 'bg-[#f9dec9]',
      border: 'border-[#e9afa3]',
      text: 'text-[#3a405a]',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      defaultTitle: 'Potential Risk – Unverified Reports'
    },
    critical: {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-900',
      icon: <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />,
      defaultTitle: 'Critical Risk Alert – Unverified Citizen Reports'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-[#99b2dd]',
      text: 'text-[#3a405a]',
      icon: <Info className="w-5 h-5 text-[#3a405a] flex-shrink-0" />,
      defaultTitle: 'Community Advisory'
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
      defaultTitle: 'Resolution Confirmed'
    },
    disclaimer: {
      bg: 'bg-[#f9dec9]/70',
      border: 'border-[#685044]/30',
      text: 'text-[#685044]',
      icon: <ShieldAlert className="w-5 h-5 text-[#3a405a] flex-shrink-0" />,
      defaultTitle: 'Medical & Epidemiological Disclaimer'
    }
  };

  const current = configs[type];

  return (
    <div
      className={`p-4 rounded-xl border ${current.bg} ${current.border} ${current.text} shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {current.icon}
        <div className="flex-1">
          <h4 className="font-bold text-sm leading-5">
            {title || current.defaultTitle}
          </h4>
          <p className="mt-1 text-xs leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
};
