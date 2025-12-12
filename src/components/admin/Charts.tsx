'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartsProps {
  diagnosisTrends: { date: string; count: number }[];
  commonSymptoms: { symptom: string; count: number }[];
  drugVerificationStats: {
    verified: number;
    expired: number;
    unverified: number;
  };
}

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B'];

export function Charts({
  diagnosisTrends,
  commonSymptoms,
  drugVerificationStats,
}: ChartsProps) {
  const pieData = [
    { name: 'Verified', value: drugVerificationStats.verified },
    { name: 'Expired', value: drugVerificationStats.expired },
    { name: 'Unverified', value: drugVerificationStats.unverified },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Diagnosis Trends */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Diagnosis Trends (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={diagnosisTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Diagnoses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Common Symptoms */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Common Symptoms (Top 10)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={commonSymptoms.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symptom" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10B981" name="Occurrences" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drug Verification Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Drug Verification Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

