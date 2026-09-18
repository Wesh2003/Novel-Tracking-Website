export default function ProfilePage({ user }) {
  return (
    <div className="card p-6">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase() || 'R'}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
          <p className="text-slate-400">{user?.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Books added', value: '24' },
          { label: 'Reading streak', value: '12 days' },
          { label: 'Favorite genre', value: 'Fantasy' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
