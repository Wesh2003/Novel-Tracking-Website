import { useEffect, useState } from 'react';
import { Goal } from 'lucide-react';
import { api } from '../api';

export default function ReadingGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ title: '', goal_type: 'books', target_value: 20, current_value: 7, unit: 'books' });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await api.getGoals();
        setGoals(response.goals || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createGoal(form);
      setGoals((prev) => [response.goal, ...prev]);
      setForm({ title: '', goal_type: 'books', target_value: 20, current_value: 7, unit: 'books' });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <div className="mb-5 flex items-center gap-2 text-white">
          <Goal size={18} className="text-violet-300" />
          <h2 className="text-xl font-semibold">Create goal</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Title</label>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Goal type</label>
            <select value={form.goal_type} onChange={(e) => setForm((prev) => ({ ...prev, goal_type: e.target.value, unit: e.target.value === 'pages' ? 'pages' : 'books' }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500">
              <option value="books">Books</option>
              <option value="pages">Pages</option>
              <option value="minutes">Minutes</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Target</label>
              <input type="number" value={form.target_value} onChange={(e) => setForm((prev) => ({ ...prev, target_value: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Current</label>
              <input type="number" value={form.current_value} onChange={(e) => setForm((prev) => ({ ...prev, current_value: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 font-medium text-white">Save goal</button>
        </form>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="card p-6 text-slate-300">No goals yet.</div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
            return (
              <div key={goal.id} className="card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                  <span className="text-sm text-violet-300">{progress}%</span>
                </div>
                <p className="mb-3 text-sm text-slate-400">{goal.goal_type}</p>
                <div className="progress-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>{goal.current_value} / {goal.target_value} {goal.unit || ''}</span>
                  <span>{goal.end_date ? 'On track' : 'Flexible'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
