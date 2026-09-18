import { BookOpen, Gauge, LogOut, NotebookPen, Settings, Sparkles, UserRound, BookMarked, Goal, ChartColumnBig } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/library', label: 'My Library', icon: BookMarked },
  { to: '/sessions', label: 'Reading Sessions', icon: BookOpen },
  { to: '/goals', label: 'Reading Goals', icon: Goal },
  { to: '/statistics', label: 'Statistics', icon: ChartColumnBig },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ user, logout, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow lg:block">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-violet-500 to-cyan-400 text-lg font-bold text-white">
              N
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tracker</p>
              <h1 className="text-xl font-semibold">Novel Nest</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-200">
              <Sparkles size={18} />
              <span className="text-sm font-medium">Reading streak</span>
            </div>
            <p className="text-3xl font-bold">12 days</p>
            <p className="mt-1 text-xs text-slate-300">You’re on a great pace.</p>
          </div>

          <button
            onClick={logout}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-rose-400 hover:text-rose-200"
          >
            <LogOut size={16} />
            Log out
          </button>
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-glow">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
              <h2 className="text-2xl font-semibold text-white">{user?.name || 'Reader'}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 md:block">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-base font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'R'}
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
