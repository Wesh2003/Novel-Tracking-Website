import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getStatistics();
        setStats(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const data = stats?.monthlyActivity || [
    { month: 'Jan', pages: 100 },
    { month: 'Feb', pages: 200 },
    { month: 'Mar', pages: 180 },
    { month: 'Apr', pages: 240 },
    { month: 'May', pages: 300 },
    { month: 'Jun', pages: 260 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Books read', value: stats?.totalBooksRead || 0 },
          { label: 'Pages read', value: stats?.totalPagesRead || 0 },
          { label: 'Avg. pages/day', value: stats?.averagePagesPerDay || 0 },
          { label: 'Avg. completion time', value: `${stats?.avgCompletionTime || 0} days` },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Monthly reading</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPages" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="pages" stroke="#8b5cf6" fill="url(#colorPages)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Top genres</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(stats?.mostReadGenres || [['Fantasy', 4], ['Classics', 2], ['Sci-Fi', 3]]).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
