import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { VillageComparisonItem } from '../../types';

interface VillageBarChartProps {
  data: VillageComparisonItem[];
}

export const VillageBarChart: React.FC<VillageBarChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#685044]/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#3a405a]">
            Village-Level Vulnerability Comparison
          </h3>
          <p className="text-xs text-[#685044]">
            Total reports vs active early warnings by community
          </p>
        </div>
        <span className="px-2.5 py-1 bg-[#f9dec9] text-[#3a405a] text-xs font-bold rounded-lg border border-[#685044]/20">
          Cross-District
        </span>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#685044]">
            No village surveillance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.slice(0, 7)}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1cfb5" />
              <XAxis
                dataKey="village"
                angle={-20}
                textAnchor="end"
                interval={0}
                tick={{ fill: '#685044', fontSize: 10 }}
              />
              <YAxis tick={{ fill: '#685044', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#685044',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Bar
                dataKey="totalReports"
                name="Citizen Reports"
                fill="#3a405a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="activeAlerts"
                name="Active Warnings"
                fill="#e9afa3"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
