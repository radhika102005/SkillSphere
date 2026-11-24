import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api/client.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '', major: '', role: 'both' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/profile/edit', { replace: true });
    } catch (err) {
      setError(errMsg(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-extrabold text-dark">Join SkillSphere</h1>
        <p className="mt-1 text-sm text-slate-500">Create your free account in under a minute.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">University</label>
              <input className="input" value={form.university} onChange={set('university')} />
            </div>
            <div>
              <label className="label">Major</label>
              <input className="input" value={form.major} onChange={set('major')} />
            </div>
          </div>
          <div>
            <label className="label">I want to</label>
            <select className="input" value={form.role} onChange={set('role')}>
              <option value="student">Learn (student)</option>
              <option value="mentor">Teach (mentor)</option>
              <option value="both">Both learn and teach</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered? <Link to="/login" className="font-semibold text-primary-600">Log in</Link>
        </p>
      </div>
    </main>
  );
}
