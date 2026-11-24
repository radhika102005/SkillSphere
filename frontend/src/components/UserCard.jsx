import { Link } from 'react-router-dom';
import { Star, GraduationCap } from 'lucide-react';
import Avatar from './Avatar.jsx';

export default function UserCard({ user, note }) {
  return (
    <Link to={`/profile/${user._id}`} className="card card-hover block">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{user.name}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-slate-500">
            <GraduationCap size={13} />
            {[user.major, user.university].filter(Boolean).join(' · ') || 'Student'}
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          {user.reviewCount ? user.rating.toFixed(1) : 'New'}
        </span>
      </div>

      {user.bio && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{user.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {user.skillsOffered?.slice(0, 4).map((s) => (
          <span key={s.name} className="tag">
            {s.name}
          </span>
        ))}
      </div>

      {note && <p className="mt-3 text-xs font-medium text-emerald-600">{note}</p>}
    </Link>
  );
}
