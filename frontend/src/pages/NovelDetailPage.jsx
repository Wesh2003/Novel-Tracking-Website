import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

export default function NovelDetailPage() {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const response = await api.getNovels();
        const found = (response.novels || []).find((item) => String(item.id) === String(id));
        setNovel(found || null);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNovel();
  }, [id]);

  if (!novel) {
    return <div className="card p-6 text-slate-300">Loading novel details…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden p-0">
        <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
          <img src={novel.cover_image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'} alt={novel.title} className="h-72 w-full rounded-2xl object-cover" />
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-violet-300">{novel.genre}</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{novel.title}</h2>
                <p className="text-lg text-slate-400">by {novel.author}</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">{novel.status}</span>
            </div>

            <p className="mt-4 max-w-2xl text-slate-300">{novel.description || 'No description yet.'}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Progress</p>
                <p className="mt-1 text-2xl font-semibold text-white">{novel.percentage || 0}%</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Pages</p>
                <p className="mt-1 text-2xl font-semibold text-white">{novel.current_page}/{novel.page_count}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Rating</p>
                <p className="mt-1 text-2xl font-semibold text-white">{novel.rating || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-lg font-semibold text-white">Reading history</h3>
        <div className="progress-bar">
          <span style={{ width: `${novel.percentage || 0}%` }} />
        </div>
        <div className="mt-3 text-sm text-slate-300">
          {novel.pagesRemaining ? `Pages remaining: ${novel.pagesRemaining}` : 'Finished'}
        </div>
      </div>
    </div>
  );
}
