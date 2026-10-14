import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../utility/axiosClient';

const emptyProblem = {
  title: '',
  description: '',
  difficulty: 'easy',
  tags: 'array',
  visibleTestCases: [],
  startCode: [],
  referenceSolution: [],
};

const tagOptions = [
  'array', 'stack', 'linked list', 'graph', 'tree',
  'Dynamic Programming', 'queue',
];

function AdminUpdate() {
  const [problems, setProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [problem, setProblem] = useState(emptyProblem);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    axiosClient.get('/problem/getAllProblem')
      .then(({ data }) => {
        if (active) setProblems(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data || 'Failed to load problems.');
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });

    return () => { active = false; };
  }, []);

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return problems;
    return problems.filter((item) => [item.title, item.difficulty, item.tags]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query));
  }, [problems, searchQuery]);

  const selectProblem = async (id) => {
    setSelectedId(id);
    setProblem(emptyProblem);
    setMessage('');
    setError('');
    setLoadingDetails(true);
    try {
      const { data } = await axiosClient.get(`/problem/problemById/${id}`);
      setProblem({
        ...emptyProblem,
        ...data,
        visibleTestCases: data.visibleTestCases ?? [],
        startCode: data.startCode ?? [],
        referenceSolution: data.referenceSolution ?? [],
      });
    } catch (requestError) {
      setError(requestError.response?.data || 'Failed to load problem details.');
      setSelectedId('');
    } finally {
      setLoadingDetails(false);
    }
  };

  const setField = (field, value) => {
    setProblem((current) => ({ ...current, [field]: value }));
  };

  const setArrayItem = (field, index, key, value) => {
    setProblem((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item),
    }));
  };

  const addArrayItem = (field, value) => {
    setProblem((current) => ({ ...current, [field]: [...current[field], value] }));
  };

  const removeArrayItem = (field, index) => {
    setProblem((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await axiosClient.put(`/problem/update/${selectedId}`, problem);
      setProblems((current) => current.map((item) => item._id === selectedId
        ? { ...item, title: problem.title, difficulty: problem.difficulty, tags: problem.tags }
        : item));
      setMessage('Problem updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data || 'Failed to update problem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="border-b border-base-300 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin workspace</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Update problems</h1>
            <p className="mt-1 text-sm text-base-content/60">Find a problem, make your changes, and save them.</p>
          </div>
          <span className="badge badge-outline badge-lg">{problems.length} problems</span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="card h-fit border border-base-300 bg-base-100 shadow-sm lg:sticky lg:top-4">
        <div className="card-body gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="card-title text-lg">Problem library</h2>
              <p className="text-xs text-base-content/60">Select an item to edit</p>
            </div>
            <span className="badge badge-ghost">{filteredProblems.length}</span>
          </div>
          <label className="sr-only" htmlFor="update-problem-search">Search problems</label>
          <input
            id="update-problem-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, tag, difficulty…"
            className="input input-bordered input-sm w-full"
          />
          {loadingList ? (
            <span className="loading loading-spinner loading-md mx-auto my-6" />
          ) : (
            <ul className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
              {filteredProblems.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => selectProblem(item._id)}
                    aria-current={selectedId === item._id ? 'true' : undefined}
                    className={`w-full rounded-xl border p-3 text-left transition hover:border-primary hover:bg-base-200/60 ${selectedId === item._id ? 'border-primary bg-primary/10 ring-1 ring-primary/20' : 'border-base-300 bg-base-100'}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold leading-snug">{item.title}</span>
                      {selectedId === item._id && <span className="badge badge-primary badge-xs shrink-0">Selected</span>}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <span className="badge badge-ghost badge-sm capitalize">{item.difficulty}</span>
                      <span className="badge badge-outline badge-sm">{item.tags}</span>
                    </span>
                  </button>
                </li>
              ))}
              {filteredProblems.length === 0 && (
                <li className="py-6 text-center text-sm text-base-content/60">No matching problems.</li>
              )}
            </ul>
          )}
        </div>
      </section>

      <section className="min-w-0">
        {error && <div role="alert" className="alert alert-error mb-4 shadow-sm"><span>{String(error)}</span></div>}
        {message && <div role="status" className="alert alert-success mb-4 shadow-sm"><span>{message}</span></div>}
        {!selectedId && !loadingDetails && (
          <div className="card min-h-80 border border-dashed border-base-300 bg-base-100 shadow-sm">
            <div className="card-body items-center justify-center text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-2xl text-primary">✎</span>
              <h2 className="mt-2 text-xl font-semibold">Choose a problem to begin</h2>
              <p className="max-w-sm text-sm text-base-content/60">Select a problem from the library to edit its details, test cases, and code.</p>
            </div>
          </div>
        )}
        {loadingDetails && <div className="card border border-base-300 bg-base-100 shadow-sm"><div className="card-body items-center py-20"><span className="loading loading-spinner loading-lg text-primary" /><span className="mt-2 text-sm text-base-content/60">Loading problem details…</span></div></div>}
        {selectedId && !loadingDetails && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Editing problem</p>
                <h2 className="mt-1 truncate text-xl font-bold">{problem.title || 'Untitled problem'}</h2>
              </div>
              <span className="badge badge-outline capitalize">{problem.difficulty}</span>
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body space-y-5 p-5 sm:p-6">
                <div className="border-b border-base-300 pb-3">
                  <h2 className="card-title">Problem details</h2>
                  <p className="mt-1 text-sm text-base-content/60">Update the title, description, difficulty, and category.</p>
                </div>
                <label className="form-control">
                  <span className="label-text mb-1">Title</span>
                  <input required className="input input-bordered" value={problem.title} onChange={(event) => setField('title', event.target.value)} />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Description</span>
                  <textarea required rows={5} className="textarea textarea-bordered" value={problem.description} onChange={(event) => setField('description', event.target.value)} />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text mb-1">Difficulty</span>
                    <select className="select select-bordered" value={problem.difficulty} onChange={(event) => setField('difficulty', event.target.value)}>
                      {['easy', 'medium', 'hard'].map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-1">Tag</span>
                    <select className="select select-bordered" value={problem.tags} onChange={(event) => setField('tags', event.target.value)}>
                      {!tagOptions.includes(problem.tags) && <option value={problem.tags}>{problem.tags}</option>}
                      {tagOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 border-b border-base-300 pb-3">
                  <div>
                    <h2 className="card-title">Visible test cases</h2>
                    <p className="mt-1 text-sm text-base-content/60">These cases are shown to users with the problem.</p>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addArrayItem('visibleTestCases', { input: '', output: '', explanation: '' })}>Add case</button>
                </div>
                {problem.visibleTestCases.map((testCase, index) => (
                  <div key={`visible-${index}`} className="space-y-3 rounded-xl border border-base-300 bg-base-200/30 p-4">
                    <div className="flex justify-end"><button type="button" className="btn btn-xs btn-error btn-outline" onClick={() => removeArrayItem('visibleTestCases', index)}>Remove</button></div>
                    <input required aria-label={`Visible case ${index + 1} input`} placeholder="Input" className="input input-bordered w-full" value={testCase.input ?? ''} onChange={(event) => setArrayItem('visibleTestCases', index, 'input', event.target.value)} />
                    <input required aria-label={`Visible case ${index + 1} output`} placeholder="Output" className="input input-bordered w-full" value={testCase.output ?? ''} onChange={(event) => setArrayItem('visibleTestCases', index, 'output', event.target.value)} />
                    <textarea required aria-label={`Visible case ${index + 1} explanation`} placeholder="Explanation" className="textarea textarea-bordered w-full" value={testCase.explanation ?? ''} onChange={(event) => setArrayItem('visibleTestCases', index, 'explanation', event.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {['startCode', 'referenceSolution'].map((field) => (
              <div key={field} className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body space-y-4 p-5 sm:p-6">
                  <div className="border-b border-base-300 pb-3">
                    <h2 className="card-title">{field === 'startCode' ? 'Code templates' : 'Reference solutions'}</h2>
                    <p className="mt-1 text-sm text-base-content/60">{field === 'startCode' ? 'Starter code provided to users.' : 'Solutions used to validate the visible test cases.'}</p>
                  </div>
                  {problem[field].map((entry, index) => (
                    <label key={`${field}-${entry.language}-${index}`} className="form-control">
                      <span className="label-text mb-1">{entry.language}</span>
                      <textarea
                        required
                        rows={8}
                        className="textarea textarea-bordered w-full font-mono"
                        value={field === 'startCode' ? entry.initialCode ?? '' : entry.completeCode ?? ''}
                        onChange={(event) => setArrayItem(field, index, field === 'startCode' ? 'initialCode' : 'completeCode', event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button type="submit" disabled={saving} className="btn btn-primary sticky bottom-4 z-10 w-full shadow-lg">
              {saving && <span className="loading loading-spinner loading-sm" />}
              {saving ? 'Saving changes…' : 'Save changes'}
            </button>
          </form>
        )}
      </section>
      </div>
    </main>
  );
}

export default AdminUpdate;
