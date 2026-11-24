import { useEffect, useState } from 'react';
import { Heart, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

const TYPES = ['article', 'video', 'course', 'tool', 'other'];
const EMPTY = { title: '', description: '', url: '', category: '', type: 'article' };

export default function Learning() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get('/learning', { params: { search: search || undefined } })
        .then((r) => setResources(r.data.resources))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/learning', form);
      setResources([data.resource, ...resources]);
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const toggleLike = async (id) => {
    const { data } = await api.put(`/learning/${id}/like`);
    setResources((rs) => rs.map((r) => (r._id === id ? { ...r, likes: data.likes } : r)));
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    await api.delete(`/learning/${id}`);
    setResources((rs) => rs.filter((r) => r._id !== id));
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Learning resources</h1>
          <p className="text-sm text-slate-500">Courses, articles and tools shared by students.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Share a resource</button>
      </div>

      {showForm && (
        <form onSubmit={add} className="card mt-5 space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={set('title')} />
            </div>
            <div>
              <label className="label">Link</label>
              <input className="input" type="url" placeholder="https://…" value={form.url} onChange={set('url')} />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="e.g. Web Development" value={form.category} onChange={set('category')} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input capitalize" value={form.type} onChange={set('type')}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} maxLength={600} value={form.description} onChange={set('description')} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary">Publish</button>
          </div>
        </form>
      )}

      <div className="relative mt-5">
        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        <input className="input pl-10" placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <Spinner />
      ) : resources.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {resources.map((r) => {
            const liked = r.likes.some((id) => String(id) === String(user._id));
            return (
              <article key={r._id} className="card card-hover flex flex-col">
                <div className="flex items-center gap-2 text-xs">
                  <span className="tag capitalize">{r.type}</span>
                  <span className="text-slate-400">{r.category}</span>
                </div>
                <h3 className="mt-2 font-bold text-slate-900">{r.title}</h3>
                {r.description && <p className="mt-1 line-clamp-3 text-sm text-slate-600">{r.description}</p>}
                <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                  <span className="text-xs text-slate-400">by {r.author?.name || 'Student'}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleLike(r._id)} className={`flex items-center gap-1 ${liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}>
                      <Heart size={16} className={liked ? 'fill-rose-500' : ''} /> {r.likes.length}
                    </button>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-primary-600">
                        Open <ExternalLink size={14} />
                      </a>
                    )}
                    {r.author?._id === user._id && (
                      <button onClick={() => remove(r._id)} className="text-slate-400 hover:text-red-500" aria-label="Delete"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="card mt-5 text-center text-sm text-slate-500">No resources found. Be the first to share one!</p>
      )}
    </main>
  );
}
