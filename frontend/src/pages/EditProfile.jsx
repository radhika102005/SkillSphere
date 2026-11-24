import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    university: user.university || '',
    major: user.major || '',
    year: user.year || '',
    role: user.role || 'both',
  });
  const [offered, setOffered] = useState(user.skillsOffered || []);
  const [wanted, setWanted] = useState(user.skillsWanted || []);
  const [newOffered, setNewOffered] = useState({ name: '', level: 'Intermediate' });
  const [newWanted, setNewWanted] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addOffered = () => {
    const name = newOffered.name.trim();
    if (!name || offered.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setOffered([...offered, { name, level: newOffered.level }]);
    setNewOffered({ ...newOffered, name: '' });
  };

  const addWanted = () => {
    const name = newWanted.trim();
    if (!name || wanted.some((s) => s.toLowerCase() === name.toLowerCase())) return;
    setWanted([...wanted, name]);
    setNewWanted('');
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.put('/users/me', { ...form, skillsOffered: offered, skillsWanted: wanted });
      setUser(data.user);
      navigate(`/profile/${data.user._id}`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const onEnter = (fn) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-dark">Edit your profile</h1>

      <form onSubmit={save} className="mt-6 space-y-6">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <section className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="student">Learner</option>
                <option value="mentor">Mentor</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="label">University</label>
              <input className="input" value={form.university} onChange={set('university')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Major</label>
                <input className="input" value={form.major} onChange={set('major')} />
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year} onChange={set('year')}>
                  <option value="">—</option>
                  {['1st', '2nd', '3rd', '4th', 'Grad'].map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input" rows={3} maxLength={500} value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself" />
          </div>
        </section>

        <section className="card">
          <h2 className="font-bold text-slate-900">Skills I can teach</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {offered.map((s) => (
              <span key={s.name} className="tag gap-1.5">
                {s.name} · {s.level}
                <button type="button" onClick={() => setOffered(offered.filter((x) => x.name !== s.name))} aria-label={`Remove ${s.name}`}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="input" placeholder="e.g. React" value={newOffered.name} onChange={(e) => setNewOffered({ ...newOffered, name: e.target.value })} onKeyDown={onEnter(addOffered)} />
            <select className="input w-40" value={newOffered.level} onChange={(e) => setNewOffered({ ...newOffered, level: e.target.value })}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button type="button" onClick={addOffered} className="btn-secondary shrink-0"><Plus size={16} /> Add</button>
          </div>
        </section>

        <section className="card">
          <h2 className="font-bold text-slate-900">Skills I want to learn</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {wanted.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-medium text-secondary-700">
                {s}
                <button type="button" onClick={() => setWanted(wanted.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="input" placeholder="e.g. Public Speaking" value={newWanted} onChange={(e) => setNewWanted(e.target.value)} onKeyDown={onEnter(addWanted)} />
            <button type="button" onClick={addWanted} className="btn-secondary shrink-0"><Plus size={16} /> Add</button>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>
    </main>
  );
}
