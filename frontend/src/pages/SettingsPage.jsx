export default function SettingsPage() {
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-white">Settings</h2>
      <div className="mt-6 space-y-4 text-slate-300">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
          <p className="font-medium text-white">Reading preferences</p>
          <p className="mt-2 text-sm text-slate-400">Theme, reminders, and goal defaults.</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
          <p className="font-medium text-white">Notifications</p>
          <p className="mt-2 text-sm text-slate-400">Email reminders and weekly reading summaries.</p>
        </div>
      </div>
    </div>
  );
}
