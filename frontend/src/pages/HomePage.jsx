
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { logoutUser } from "../authSlice";
import axiosClient from "../utility/axiosClient";

const difficultyStyles = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Hard: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

function HomePage() {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("All");
    const [problems, setProblems] = useState([]);
    const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser()).unwrap();
        navigate("/login");
    };

    useEffect(() => {
        let isMounted = true;

        const loadHomePage = async () => {
            setIsLoading(true);
            setError("");

            try {
                const [problemsResponse, solvedResponse] = await Promise.all([
                    axiosClient.get("/problem/getAllProblem"),
                    axiosClient.get("/problem/problemSolvedByUser"),
                ]);

                if (!isMounted) return;

                setProblems(problemsResponse.data);
                setSolvedProblemIds(new Set(
                    (solvedResponse.data?.problemSolved ?? []).map((problem) => problem._id),
                ));
            } catch (requestError) {
                if (!isMounted) return;

                setError(requestError.response?.data || "Unable to load problems. Please try again.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadHomePage();

        return () => {
            isMounted = false;
        };
    }, []);

    const normalizedProblems = useMemo(() => problems.map((problem) => ({
        ...problem,
        difficulty: `${problem.difficulty.charAt(0).toUpperCase()}${problem.difficulty.slice(1)}`,
        tags: Array.isArray(problem.tags) ? problem.tags : [problem.tags],
        status: solvedProblemIds.has(problem._id) ? "Solved" : "Todo",
    })), [problems, solvedProblemIds]);

    const visibleProblems = normalizedProblems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(query.toLowerCase());
        return matchesSearch && (filter === "All" || problem.difficulty === filter);
    });

    return (
        <main className="min-h-screen bg-[#0b1018] text-slate-100 selection:bg-cyan-400/30">
            <header className="relative z-50 border-b border-slate-800 bg-[#0d141f]/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <a className="flex items-center gap-2.5" href="/">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-black text-slate-950">&lt;/&gt;</span>
                        <span className="text-xl font-bold tracking-tight">Code<span className="text-cyan-400">Nova</span></span>
                    </a>
                    <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
                        <a className="text-white" href="#problems">Problems</a>
                        <a className="hover:text-white" href="#study-plan">Study plan</a>
                        <a className="hover:text-white" href="#contests">Contests</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 sm:block">Premium</button>
                        <div className="relative">
                            <button
                                type="button"
                                aria-label="User profile"
                                aria-expanded={isProfileMenuOpen}
                                onClick={() => {
                                    if (isProfileMenuOpen) {
                                        setIsProfileMenuOpen(false);
                                        navigate("/profile");
                                    } else {
                                        setIsProfileMenuOpen(true);
                                    }
                                }}
                                className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400"
                            >
                                {user?.firstName?.charAt(0).toUpperCase() || "A"}
                            </button>
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-700 bg-[#101722] p-2 shadow-xl">
                                    <p className="truncate px-3 py-2 text-sm font-medium text-slate-200">{user?.firstName || "User"}</p>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-400 transition hover:bg-slate-800"
                                    >
                                        Logout
                                    </button>
                                    {user?.role === "admin" && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                navigate("/admin");
                                            }}
                                            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-cyan-300 transition hover:bg-slate-800"
                                        >
                                            Admin Panel
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-[#11283b] via-[#101b2b] to-[#0d1420] px-6 py-8 sm:px-10">
                    <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="relative grid gap-8 lg:grid-cols-[1.35fr_.85fr] lg:items-center">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Your coding arena</p>
                            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Sharpen your skills, one problem at a time.</h1>
                            <p className="mt-3 max-w-xl text-slate-400">Pick up where you left off or discover your next challenge from a growing collection of interview-ready problems.</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a href="#problems" className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">Start solving</a>
                                <button className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800">Resume: Two Sum</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[['Solved', String(solvedProblemIds.size)], ['Available', String(problems.length)], ['Progress', `${problems.length ? Math.round((solvedProblemIds.size / problems.length) * 100) : 0}%`]].map(([label, value]) => (
                                <div key={label} className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4">
                                    <p className="text-xs text-slate-500">{label}</p>
                                    <p className="mt-2 text-lg font-bold text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_280px]" id="problems">
                <div>
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-cyan-400">Problem set</p>
                            <h2 className="mt-1 text-2xl font-bold">Explore challenges</h2>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <span className="pointer-events-none absolute left-3 top-2.5 text-slate-500">🔍</span>
                            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#111925] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Search problems" />
                        </div>
                    </div>
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                        {["All", "Easy", "Medium", "Hard"].map((option) => (
                            <button key={option} onClick={() => setFilter(option)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === option ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{option}</button>
                        ))}
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101722]">
                        <div className="hidden grid-cols-[44px_1fr_105px_90px] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid"><span></span><span>Title</span><span>Difficulty</span><span>Acceptance</span></div>
                        {isLoading && <p className="px-5 py-12 text-center text-sm text-slate-500">Loading problems…</p>}
                        {!isLoading && error && <p role="alert" className="px-5 py-12 text-center text-sm text-rose-400">{error}</p>}
                        {!isLoading && !error && visibleProblems.map((problem, index) => (
                            <Link to={`/problemPage/${problem._id}`} key={problem._id} className="grid grid-cols-[34px_1fr] gap-3 border-b border-slate-800 px-5 py-4 transition last:border-0 hover:bg-slate-800/50 sm:grid-cols-[44px_1fr_105px_90px] sm:items-center sm:gap-4">
                                <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${problem.status === "Solved" ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-600 text-slate-600"}`}>{problem.status === "Solved" ? "✓" : index + 1}</span>
                                <div><p className="font-medium text-slate-100">{problem.title}</p><div className="mt-1 flex flex-wrap gap-1.5">{problem.tags.map((tag) => <span key={tag} className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">{tag}</span>)}</div></div>
                                <span className={`mt-2 w-fit rounded-md border px-2 py-1 text-xs font-semibold sm:mt-0 ${difficultyStyles[problem.difficulty]}`}>{problem.difficulty}</span>
                                <span className="hidden text-sm text-slate-400 sm:block">—</span>
                            </Link>
                        ))}
                        {!isLoading && !error && visibleProblems.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No problems match your search.</p>}
                    </div>
                </div>

                <aside className="space-y-5">
                    <div className="rounded-2xl border border-slate-800 bg-[#101722] p-5" id="study-plan">
                        <p className="text-sm font-semibold text-white">Today&apos;s progress</p>
                        <div className="mt-5 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full border-4 border-cyan-400 text-sm font-bold">{solvedProblemIds.size}/{problems.length}</div><p className="text-sm leading-6 text-slate-400">{solvedProblemIds.size ? "Keep building on your solved problems." : "Solve your first problem to start your progress."}</p></div>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${problems.length ? (solvedProblemIds.size / problems.length) * 100 : 0}%` }} /></div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-[#101722] p-5" id="contests">
                        <p className="text-sm font-semibold text-white">Next contest</p>
                        <p className="mt-3 text-lg font-bold">Weekly Contest 412</p>
                        <p className="mt-1 text-sm text-slate-400">Starts in 2 days, 6 hours</p>
                        <button className="mt-5 w-full rounded-xl border border-cyan-400/50 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10">View contest</button>
                    </div>
                </aside>
            </section>
        </main>
    );
}

export default HomePage;
