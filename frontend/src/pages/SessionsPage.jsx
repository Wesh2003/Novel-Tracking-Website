import { useEffect, useState } from 'react';
import { api } from '../api';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ novel_id: 1, session_date: new Date().toISOString().slice(0, 10), start_page: 0, end_page: 50, duration_minutes: 30, notes: '' });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.getSessions();
        setSessions(response.sessions || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSessions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createSession(form);
      setSessions((prev) => [response.session, ...prev]);
      setForm({ novel_id: 1, session_date: new Date().toISOString().slice(0, 10), start_page: 0, end_page: 50, duration_minutes: 30, notes: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">Add reading session</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Novel ID</label>
            <input type="number" value={form.novel_id} onChange={(e) => setForm((prev) => ({ ...prev, novel_id: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Start page</label>
              <input type="number" value={form.start_page} onChange={(e) => setForm((prev) => ({ ...prev, start_page: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">End page</label>
              <input type="number" value={form.end_page} onChange={(e) => setForm((prev) => ({ ...prev, end_page: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Date</label>
              <input type="date" value={form.session_date} onChange={(e) => setForm((prev) => ({ ...prev, session_date: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Minutes</label>
              <input type="number" value={form.duration_minutes} onChange={(e) => setForm((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Notes</label>
            <textarea rows="3" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 font-medium text-white">Save session</button>
        </form>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="card p-6 text-slate-300">No reading sessions logged yet.</div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Novel #{session.novel_id}</h3>
                <span className="text-sm text-violet-300">{session.pages_read} pages</span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                <span>Date: {new Date(session.session_date).toLocaleDateString()}</span>
                <span>Duration: {session.duration_minutes || 0} min</span>
                <span>Start page: {session.start_page || 0}</span>
                <span>End page: {session.end_page || 0}</span>
              </div>
              {session.notes && <p className="mt-3 text-sm text-slate-400">{session.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
