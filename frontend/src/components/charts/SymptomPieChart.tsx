import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { SymptomDistributionItem } from '../../types';

interface SymptomPieChartProps {
  data: SymptomDistributionItem[];
}

const COLORS = [
  '#3a405a', // twilight-indigo
  '#e9afa3', // powder-blush
  '#99b2dd', // powder-blue
  '#685044', // ash-brown
  '#f9dec9', // powder-petal
  '#d97706'  // amber
];

export const SymptomPieChart: React.FC<SymptomPieChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#685044]/20 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#3a405a]">
          Symptom Distribution Breakdown
        </h3>
        <p className="text-xs text-[#685044]">
          Proportion of water-borne clinical indicators reported
        </p>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#685044]">
            No symptoms recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#685044',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
