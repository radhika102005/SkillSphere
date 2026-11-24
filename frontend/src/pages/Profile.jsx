import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, Star, MessageSquare, Users, Trophy } from 'lucide-react';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [req, setReq] = useState({ skill: '', message: '' });
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [flash, setFlash] = useState({ type: '', text: '' });

  const isMe = me._id === id;

  const load = () =>
    Promise.all([api.get(`/users/${id}`), api.get(`/reviews/user/${id}`)])
      .then(([u, r]) => {
        setPerson(u.data.user);
        setReviews(r.data.reviews);
        setReq((s) => ({ ...s, skill: s.skill || u.data.user.skillsOffered?.[0]?.name || '' }));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Spinner />;
  if (notFound || !person) return <p className="py-20 text-center text-slate-500">User not found.</p>;

  const say = (type, text) => setFlash({ type, text });

  const sendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mentorship', { recipient: id, skill: req.skill, message: req.message });
      say('ok', 'Request sent! You can track it on the Mentorship page.');
      setReq({ ...req, message: '' });
    } catch (err) {
      say('err', errMsg(err));
    }
  };

  const sendReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { reviewee: id, ...review });
      say('ok', 'Thanks for your review!');
      setReview({ rating: 5, comment: '' });
      load();
    } catch (err) {
      say('err', errMsg(err));
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={person.name} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-dark">{person.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <GraduationCap size={15} />
              {[person.major, person.year && `${person.year} year`, person.university].filter(Boolean).join(' · ') || 'Student'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star size={15} className="fill-amber-400 text-amber-400" />
                {person.reviewCount ? `${person.rating.toFixed(1)} (${person.reviewCount})` : 'No reviews yet'}
              </span>
              <span className="flex items-center gap-1 text-slate-600"><Trophy size={15} /> {person.points} pts</span>
              <span className="tag capitalize">{person.role}</span>
            </div>
          </div>
          {isMe ? (
            <Link to="/profile/edit" className="btn-secondary">Edit profile</Link>
          ) : (
            <button onClick={() => navigate(`/messages/${id}`)} className="btn-secondary">
              <MessageSquare size={16} /> Message
            </button>
          )}
        </div>
        {person.bio && <p className="mt-5 text-sm leading-relaxed text-slate-700">{person.bio}</p>}
      </div>

      {flash.text && (
        <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${flash.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {flash.text}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="font-bold text-slate-900">Can teach</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.skillsOffered?.length ? (
              person.skillsOffered.map((s) => (
                <span key={s.name} className="tag">{s.name} · {s.level}</span>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nothing listed yet.</p>
            )}
          </div>
          <h2 className="mt-6 font-bold text-slate-900">Wants to learn</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.skillsWanted?.length ? (
              person.skillsWanted.map((s) => (
                <span key={s} className="inline-flex rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-medium text-secondary-700">{s}</span>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nothing listed yet.</p>
            )}
          </div>
        </section>

        {!isMe && (
          <section className="card">
            <h2 className="flex items-center gap-2 font-bold text-slate-900"><Users size={17} /> Request a session</h2>
            <form onSubmit={sendRequest} className="mt-3 space-y-3">
              <div>
                <label className="label">Skill</label>
                <input className="input" required list="skills" value={req.skill} onChange={(e) => setReq({ ...req, skill: e.target.value })} />
                <datalist id="skills">
                  {person.skillsOffered?.map((s) => <option key={s.name} value={s.name} />)}
                </datalist>
              </div>
              <div>
                <label className="label">Message (optional)</label>
                <textarea className="input" rows={3} maxLength={500} value={req.message} onChange={(e) => setReq({ ...req, message: e.target.value })} placeholder="What would you like help with?" />
              </div>
              <button className="btn-primary w-full">Send request</button>
            </form>
          </section>
        )}
      </div>

      <section className="card mt-6">
        <h2 className="font-bold text-slate-900">Reviews</h2>
        {reviews.length ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {reviews.map((r) => (
              <li key={r._id} className="py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{r.reviewer?.name || 'Student'}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} className="fill-amber-400" />)}
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No reviews yet.</p>
        )}

        {!isMe && (
          <form onSubmit={sendReview} className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            <p className="text-sm font-semibold text-slate-700">Leave a review <span className="font-normal text-slate-400">(after a completed session)</span></p>
            <div className="flex gap-3">
              <select className="input w-32" value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
              <input className="input" maxLength={500} placeholder="Share your experience" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              <button className="btn-secondary shrink-0">Submit</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
