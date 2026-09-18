import { BookOpen, BookText, Flame, Goal, Library, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '../api';

const COLORS = ['#f472b6', '#8b5cf6', '#38bdf8', '#34d399', '#fbbf24'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, novelsData] = await Promise.all([
          api.getStatistics(),
          api.getNovels(),
        ]);
        setStats(statsData);
        setNovels(novelsData.novels || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="card p-6 text-slate-300">Loading dashboard…</div>;
  }

  const goalProgress = 72;
  const monthlyChartData = stats?.monthlyActivity || [
    { month: 'Jan', pages: 120 },
    { month: 'Feb', pages: 220 },
    { month: 'Mar', pages: 180 },
    { month: 'Apr', pages: 310 },
    { month: 'May', pages: 280 },
    { month: 'Jun', pages: 390 },
  ];

  const genreData = stats?.mostReadGenres?.map(([name, value]) => ({ name, value })) || [
    { name: 'Fantasy', value: 4 },
    { name: 'Classics', value: 2 },
    { name: 'Sci-Fi', value: 3 },
  ];

  const cards = [
    { label: 'Total books', value: novels.length, icon: Library },
    { label: 'Currently reading', value: novels.filter((book) => book.status === 'Currently Reading').length, icon: BookOpen },
    { label: 'Completed', value: novels.filter((book) => book.status === 'Completed').length, icon: BookText },
    { label: 'Pages read', value: stats?.totalPagesRead || 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">{label}</span>
              <div className="rounded-xl bg-violet-500/15 p-2 text-violet-300">
                <Icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Reading progress</h3>
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">+14% this month</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="pages" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Goal className="text-violet-300" size={18} />
            <h3 className="text-lg font-semibold text-white">Monthly goal</h3>
          </div>
          <p className="text-4xl font-bold text-white">{goalProgress}%</p>
          <p className="mt-2 text-sm text-slate-400">386 of 500 pages read</p>
          <div className="progress-bar mt-5">
            <span style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between"><span>Books this year</span><strong>7/20</strong></div>
            <div className="flex items-center justify-between"><span>Reading streak</span><strong>12 days</strong></div>
            <div className="flex items-center justify-between"><span>Avg. pages/day</span><strong>34</strong></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Favorite genres</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {genreData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="text-orange-300" size={18} />
            <h3 className="text-lg font-semibold text-white">Reading activity</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Today', value: 42 },
              { label: 'This week', value: 245 },
              { label: 'This month', value: 620 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value} pages</span>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${Math.min(item.value / 8, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
