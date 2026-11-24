import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/client.js';
import UserCard from '../components/UserCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Explore() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounced fetch
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get('/users', { params: { search: search || undefined, role: role || undefined } })
        .then((res) => setUsers(res.data.users))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, role]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-dark">Explore students</h1>
      <p className="text-sm text-slate-500">Find peers by skill, name or university.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input className="input pl-10" placeholder="Search e.g. React, design, Python…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="mentor">Mentors</option>
          <option value="student">Learners</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <UserCard key={u._id} user={u} />
          ))}
        </div>
      ) : (
        <p className="card mt-6 text-center text-sm text-slate-500">No students found. Try a different search.</p>
      )}
    </main>
  );
}
