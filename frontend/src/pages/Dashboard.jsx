import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, CheckCircle2, MessageSquare, Trophy, Star } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserCard from '../components/UserCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recs, setRecs] = useState([]);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users/me/stats'), api.get('/ai/recommendations')])
      .then(([s, r]) => {
        setStats(s.data.stats);
        setRecs(r.data.recommendations);
        setHint(r.data.hint || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const tiles = stats && [
    { label: 'Pending requests', value: stats.pending, icon: Clock, to: '/mentorship' },
    { label: 'Active sessions', value: stats.active, icon: Users, to: '/mentorship' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, to: '/mentorship' },
    { label: 'Unread messages', value: stats.unread, icon: MessageSquare, to: '/messages' },
    { label: 'Points', value: stats.points, icon: Trophy },
    { label: 'Rating', value: stats.reviewCount ? stats.rating.toFixed(1) : '—', icon: Star },
  ];

  const profileIncomplete = !user.skillsOffered?.length || !user.skillsWanted?.length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-dark">Hi {user.name.split(' ')[0]} 👋</h1>
      <p className="text-sm text-slate-500">Here's what's happening on SkillSphere.</p>

      {profileIncomplete && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span>Add the skills you offer and want to learn to get matched with peers.</span>
          <Link to="/profile/edit" className="btn-secondary">Complete profile</Link>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {tiles.map(({ label, value, icon: Icon, to }) => {
              const body = (
                <>
                  <Icon size={18} className="text-primary-500" />
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </>
              );
              return to ? (
                <Link key={label} to={to} className="card card-hover">{body}</Link>
              ) : (
                <div key={label} className="card">{body}</div>
              );
            })}
          </div>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recommended for you</h2>
              <Link to="/explore" className="text-sm font-semibold text-primary-600">Browse all</Link>
            </div>
            {recs.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recs.map((r) => (
                  <UserCard
                    key={r.user._id}
                    user={r.user}
                    note={`Teaches ${r.matchedSkills.join(', ')}${r.skillSwap ? ' · wants a skill you offer — swap!' : ''}`}
                  />
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">{hint || 'No matches yet — check back as more students join.'}</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
