import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { logoutUser } from '../authSlice';
import axiosClient from '../utility/axiosClient';

function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loadingSolved, setLoadingSolved] = useState(true);

  useEffect(() => {
    let active = true;
    axiosClient.get('/problem/problemSolvedByUser')
      .then(({ data }) => {
        if (active) setSolvedProblems(data?.problemSolved ?? []);
      })
      .catch((error) => {
        console.error('Failed to load solved problem stats:', error);
      })
      .finally(() => {
        if (active) setLoadingSolved(false);
      });

    return () => { active = false; };
  }, []);

  const solvedByTopic = useMemo(() => solvedProblems.reduce((counts, problem) => {
    const topic = (Array.isArray(problem.tags) ? problem.tags : [problem.tags])
      .filter(Boolean)
      .join(', ') || 'Uncategorized';
    counts[topic] = (counts[topic] ?? 0) + 1;
    return counts;
  }, {}), [solvedProblems]);

  const topics = Object.entries(solvedByTopic).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const initial = user?.firstName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <main className="min-h-screen bg-[#0b1018] text-slate-100 selection:bg-cyan-400/30">
      <header className="border-b border-slate-800 bg-[#0d141f]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-black text-slate-950">&lt;/&gt;</span>
            <span className="text-xl font-bold tracking-tight">Code<span className="text-cyan-400">Nova</span></span>
          </Link>
          <Link to="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white">
            Back to problems
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your profile</h1>
          <p className="mt-2 text-slate-400">Your CodeNova account information and settings.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[#101722]">
            <div className="border-b border-slate-800 bg-gradient-to-r from-cyan-400/10 via-blue-500/5 to-transparent px-6 py-8 sm:px-8">
              <div className="flex flex-wrap items-center gap-5">
                <div className="grid h-20 w-20 place-items-center rounded-2xl border border-cyan-400/30 bg-slate-900 text-3xl font-bold text-cyan-300 shadow-lg shadow-cyan-950/30">
                  {initial}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.firstName || 'User'}</h2>
                  <p className="mt-1 text-sm text-slate-400">{user?.emailId || 'No email available'}</p>
                  <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${user?.role === 'admin' ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
                    {user?.role || 'Member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Account details</h3>
              <dl className="mt-4 divide-y divide-slate-800">
                <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-4">
                  <dt className="text-sm text-slate-500">Name</dt>
                  <dd className="text-sm font-medium text-slate-100">{user?.firstName || 'Not provided'}</dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-4">
                  <dt className="text-sm text-slate-500">Email address</dt>
                  <dd className="break-all text-sm font-medium text-slate-100">{user?.emailId || 'Not provided'}</dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-4">
                  <dt className="text-sm text-slate-500">Account type</dt>
                  <dd className="text-sm font-medium capitalize text-slate-100">{user?.role || 'Member'}</dd>
                </div>
              </dl>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-slate-800 bg-[#101722] p-5">
            <h3 className="font-semibold">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-semibold text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-400/5"
              >
                Log out
              </button>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-left text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  Admin Panel
                </button>
              )}
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-[#101722] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">Progress</p>
              <h2 className="mt-1 text-xl font-bold">Problems solved by topic</h2>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-slate-300">
              Total solved: <span className="font-bold text-cyan-300">{loadingSolved ? '…' : solvedProblems.length}</span>
            </div>
          </div>

          {loadingSolved ? (
            <div className="flex justify-center py-10"><span className="loading loading-spinner loading-md text-cyan-400" /></div>
          ) : topics.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {topics.map(([topic, count]) => (
                <li key={topic} className="rounded-2xl border border-slate-800 bg-[#0d141f] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-200">{topic}</span>
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-sm font-semibold text-cyan-300">{count}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max((count / solvedProblems.length) * 100, 6)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
              No solved problems yet. Solve a problem and your topic progress will appear here.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default Profile;
