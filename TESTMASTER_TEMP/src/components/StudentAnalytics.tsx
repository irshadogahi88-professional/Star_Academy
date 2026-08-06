"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SubjectData {
  subject: string;
  score: number;
}

export function StudentAnalytics({ data }: { data: SubjectData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">No Analytics Yet</h4>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Complete some tests to see your performance breakdown!</p>
      </div>
    );
  }

  // Find max and min for color coding strong/weak points
  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Performance by Subject</h3>
        <p className="text-gray-500 dark:text-gray-400">Track your strong areas and identify weak points.</p>
      </div>
      
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
            <XAxis dataKey="subject" tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
              formatter={(value: any) => [`${value}%`, 'Avg Score']}
            />
            <Bar dataKey="score" radius={[8, 8, 8, 8]}>
              {data.map((entry, index) => {
                // Color coding logic: Lowest score is Red, Highest is Emerald, Rest is Indigo
                let fill = '#6366f1'; // Indigo (average)
                if (entry.score === minScore && data.length > 1) fill = '#ef4444'; // Red (weakest)
                else if (entry.score === maxScore && data.length > 1) fill = '#10b981'; // Emerald (strongest)
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.length > 1 && (
        <div className="flex justify-center items-center space-x-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Strongest</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Work</span>
          </div>
        </div>
      )}
    </div>
  );
}
