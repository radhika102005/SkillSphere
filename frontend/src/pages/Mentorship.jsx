import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, CheckCheck } from 'lucide-react';
import api, { errMsg } from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import Spinner from '../components/Spinner.jsx';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  declined: 'bg-slate-100 text-slate-500',
  completed: 'bg-primary-50 text-primary-700',
};

export default function Mentorship() {
  const [tab, setTab] = useState('received');
  const [data, setData] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/mentorship')
      .then((res) => setData({ received: res.data.received, sent: res.data.sent }))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    setError('');
    try {
      await api.put(`/mentorship/${id}`, { status });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const list = data[tab];
  const pendingCount = data.received.filter((m) => m.status === 'pending').length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-dark">Mentorship</h1>
      <p className="text-sm text-slate-500">Manage session requests you've received and sent.</p>

      <div className="mt-5 inline-flex rounded-xl border border-primary-100 bg-white p-1">
        {[
          ['received', `Received${pendingCount ? ` (${pendingCount})` : ''}`],
          ['sent', 'Sent'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${tab === key ? 'bg-primary-600 text-white' : 'text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {loading ? (
        <Spinner />
      ) : list.length ? (
        <ul className="mt-5 space-y-3">
          {list.map((m) => {
            const other = tab === 'received' ? m.requester : m.recipient;
            return (
              <li key={m._id} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar name={other.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/profile/${other._id}`} className="font-semibold text-slate-900 hover:text-primary-600">{other.name}</Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[m.status]}`}>{m.status}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {tab === 'received' ? 'wants to learn' : 'you asked to learn'} <b>{m.skill}</b>
                  </p>
                  {m.message && <p className="mt-1 text-sm italic text-slate-500">“{m.message}”</p>}
                </div>

                <div className="flex gap-2">
                  {tab === 'received' && m.status === 'pending' && (
                    <>
                      <button onClick={() => update(m._id, 'accepted')} className="btn-primary"><Check size={15} /> Accept</button>
                      <button onClick={() => update(m._id, 'declined')} className="btn-danger"><X size={15} /> Decline</button>
                    </>
                  )}
                  {m.status === 'accepted' && (
                    <>
                      <Link to={`/messages/${other._id}`} className="btn-secondary">Message</Link>
                      <button onClick={() => update(m._id, 'completed')} className="btn-primary"><CheckCheck size={15} /> Mark complete</button>
                    </>
                  )}
                  {m.status === 'completed' && (
                    <Link to={`/profile/${other._id}`} className="btn-secondary">Leave review</Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="card mt-5 text-center text-sm text-slate-500">
          {tab === 'received' ? 'No requests yet.' : <>You haven't sent any requests. <Link to="/explore" className="font-semibold text-primary-600">Find a mentor</Link>.</>}
        </p>
      )}
    </main>
  );
}
