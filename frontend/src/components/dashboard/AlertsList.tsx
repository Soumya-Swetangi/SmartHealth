import React from 'react';
import { Alert } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { AlertTriangle, CheckCircle, ShieldAlert, Clock } from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (alert: Alert) => void;
  onResolve?: (alert: Alert) => void;
  canManage?: boolean;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  canManage = false
}) => {
  const getBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#685044]/20 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#685044]/15 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#3a405a]">
            Active Early-Warning Surveillance Triggers
          </h3>
          <p className="text-xs text-[#685044]">
            Algorithmic anomaly flags based on 7-day community surge thresholds
          </p>
        </div>
        <span className="px-2.5 py-1 bg-[#e9afa3]/40 text-[#3a405a] text-xs font-bold rounded-lg border border-[#e9afa3]">
          {alerts.filter((a) => a.status === 'active').length} Active Flags
        </span>
      </div>

      <div className="divide-y divide-[#685044]/10">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#685044]">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-sm text-[#3a405a]">No Active Risk Surges</p>
            <p className="text-[11px] text-[#685044] mt-1">
              All monitored Northeast villages are currently below epidemiological trigger thresholds.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-4 sm:p-5 transition-colors ${
                alert.riskLevel === 'critical'
                  ? 'bg-rose-50/40 hover:bg-rose-50/70'
                  : alert.status === 'acknowledged'
                  ? 'bg-amber-50/30'
                  : 'hover:bg-[#f9dec9]/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-[#3a405a]">
                      {alert.village}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getBadge(
                        alert.riskLevel
                      )}`}
                    >
                      {alert.riskLevel} Severity
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded capitalize">
                      Status: {alert.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#3a405a] leading-relaxed">
                    {alert.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#685044] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Triggered: {formatDateTime(alert.generatedAt)}
                    </span>
                    <span>
                      Reports in Cluster: <strong>{alert.reportCount}</strong>
                    </span>
                    {alert.symptomsInvolved.length > 0 && (
                      <span>
                        Key Symptoms:{' '}
                        <strong>{alert.symptomsInvolved.join(', ')}</strong>
                      </span>
                    )}
                  </div>

                  {alert.notes && (
                    <div className="mt-2 text-[11px] bg-white p-2 rounded-lg border border-[#685044]/15 text-[#685044]">
                      <strong>Surveillance Note:</strong> {alert.notes}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {canManage && alert.status !== 'resolved' && (
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    {alert.status === 'active' && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert)}
                        className="px-3 py-1.5 bg-[#99b2dd] hover:bg-[#85a2d4] text-[#3a405a] text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Acknowledge
                      </button>
                    )}
                    {onResolve && (
                      <button
                        onClick={() => onResolve(alert)}
                        className="px-3 py-1.5 bg-[#3a405a] hover:bg-[#2e3348] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
