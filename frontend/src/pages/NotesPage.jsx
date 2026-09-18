import { useEffect, useState } from 'react';
import { api } from '../api';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.getNotes();
        setNotes(response.notes || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createNote(form);
      setNotes((prev) => [response.note, ...prev]);
      setForm({ title: '', content: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">Add note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Title</label>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Content</label>
            <textarea rows="5" value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-violet-500" required />
          </div>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 font-medium text-white">Save note</button>
        </form>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="card p-6 text-slate-300">No notes saved yet.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="card p-5">
              <h3 className="text-lg font-semibold text-white">{note.title || 'Untitled note'}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
