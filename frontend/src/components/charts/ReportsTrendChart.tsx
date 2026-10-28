import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendDataPoint } from '../../types';

interface ReportsTrendChartProps {
  data: TrendDataPoint[];
}

export const ReportsTrendChart: React.FC<ReportsTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#685044]/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#3a405a]">
            14-Day Epidemiological Trend Analysis
          </h3>
          <p className="text-xs text-[#685044]">
            Daily reported symptom surge & gastrointestinal complaints
          </p>
        </div>
        <span className="px-2.5 py-1 bg-[#99b2dd]/30 text-[#3a405a] text-xs font-bold rounded-lg">
          Time-Series
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3a405a" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3a405a" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorDiarrhea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e9afa3" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e9afa3" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1cfb5" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => val.slice(5)} // MM-DD
              tick={{ fill: '#685044', fontSize: 11 }}
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
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Reports"
              stroke="#3a405a"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              type="monotone"
              dataKey="diarrhea"
              name="Diarrhea Cases"
              stroke="#e9afa3"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDiarrhea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
