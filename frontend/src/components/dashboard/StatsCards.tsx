import React from 'react';
import { DashboardOverviewStats } from '../../types';
import { FileText, AlertTriangle, ShieldCheck, Droplet, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardOverviewStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Citizen Reports',
      value: stats.reports.total,
      subText: `${stats.reports.pending} pending review`,
      icon: FileText,
      iconBg: 'bg-[#99b2dd]/30',
      iconColor: 'text-[#3a405a]'
    },
    {
      title: 'Active Early Warnings',
      value: stats.alerts.active,
      subText: `${stats.alerts.critical} critical alert${stats.alerts.critical === 1 ? '' : 's'}`,
      icon: AlertTriangle,
      iconBg: stats.alerts.critical > 0 ? 'bg-rose-100' : 'bg-[#e9afa3]/40',
      iconColor: stats.alerts.critical > 0 ? 'text-rose-600' : 'text-[#3a405a]'
    },
    {
      title: 'Villages At Risk',
      value: stats.alerts.villagesAtRisk,
      subText: 'Statistically flagged clusters',
      icon: ShieldCheck,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800'
    },
    {
      title: 'Water Point Contamination',
      value: `${stats.waterTests.contaminationRate}%`,
      subText: `${stats.waterTests.unsafe} unsafe out of ${stats.waterTests.total} tests`,
      icon: Droplet,
      iconBg: 'bg-[#99b2dd]/40',
      iconColor: 'text-[#3a405a]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#685044]/20 shadow-sm hover:shadow transition-shadow flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#685044] uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-extrabold text-[#3a405a] mt-1">
                {card.value}
              </h3>
              <p className="text-[11px] text-[#685044]/80 mt-1 font-medium">
                {card.subText}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
