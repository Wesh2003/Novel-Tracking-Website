import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Star } from 'lucide-react';
import { api } from '../api';

const statusOptions = ['Want to Read', 'Currently Reading', 'Completed', 'On Hold', 'Abandoned'];

export default function LibraryPage() {
  const [novels, setNovels] = useState([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: 'Fantasy',
    status: 'Want to Read',
    page_count: 300,
    current_page: 0,
    rating: 4,
    description: '',
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadNovels = async () => {
    try {
      const response = await api.getNovels({ search, status: filter !== 'all' ? filter : undefined });
      setNovels(response.novels || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNovels();
  }, [search, filter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createNovel({ ...form, page_count: Number(form.page_count), current_page: Number(form.current_page), rating: Number(form.rating) });
      setForm({ title: '', author: '', genre: 'Fantasy', status: 'Want to Read', page_count: 300, current_page: 0, rating: 4, description: '' });
      loadNovels();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="card p-6 text-slate-300">Loading your library…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Personal library</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Your novels</h2>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author"
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {novels.length === 0 ? (
            <div className="card p-8 text-center text-slate-300">
              No novels match this filter yet.
            </div>
          ) : (
            novels.map((novel) => (
              <Link key={novel.id} to={`/novels/${novel.id}`} className="card block overflow-hidden p-3 transition hover:-translate-y-0.5 hover:border-violet-500/40">
                <div className="flex flex-col gap-4 md:flex-row">
                  <img src={novel.cover_image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'} alt={novel.title} className="h-36 w-full rounded-2xl object-cover md:w-28" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{novel.title}</h3>
                        <p className="text-sm text-slate-400">by {novel.author}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">{novel.status}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
                      <span>{novel.genre}</span>
                      <span>•</span>
                      <span>{novel.current_page}/{novel.page_count} pages</span>
                    </div>

                    <div className="mt-3 progress-bar">
                      <span style={{ width: `${novel.percentage || 0}%` }} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{novel.percentage || 0}% complete</span>
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {novel.rating || 'No rating'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Plus size={18} />
            <h3 className="text-lg font-semibold">Add novel</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Title</label>
              <input className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Author</label>
              <input className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="author" value={form.author} onChange={handleChange} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Genre</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="genre" value={form.genre} onChange={handleChange} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Status</label>
                <select className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="status" value={form.status} onChange={handleChange}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Total pages</label>
                <input type="number" min="1" className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="page_count" value={form.page_count} onChange={handleChange} required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Current page</label>
                <input type="number" min="0" className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="current_page" value={form.current_page} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Description</label>
              <textarea rows="3" className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="description" value={form.description} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Rating</label>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" name="rating" value={form.rating} onChange={handleChange}>
                {[1,2,3,4,5].map((rating) => (
                  <option key={rating} value={rating}>{rating} / 5</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition hover:opacity-95">Save novel</button>
          </form>
        </div>
      </div>
    </div>
  );
}
