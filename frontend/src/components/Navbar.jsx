import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, Users, MessageSquare, BookOpen, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/mentorship', label: 'Mentorship', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/learning', label: 'Learning', icon: BookOpen },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-primary-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 text-lg font-extrabold text-dark">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="h-3 w-3 rounded-full border-2 border-white" />
          </span>
          SkillSphere
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-1 lg:flex">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Link to="/profile/edit" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Avatar name={user.name} size="sm" />
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Log out">
                <LogOut size={18} />
              </button>
            </div>

            <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary">Log in</Link>
            <Link to="/register" className="btn-primary">Sign up</Link>
          </div>
        )}
      </div>

      {user && open && (
        <nav className="space-y-1 border-t border-primary-100 bg-white px-4 py-3 lg:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <NavLink to="/profile/edit" className={linkClass} onClick={() => setOpen(false)}>
            <Avatar name={user.name} size="sm" />
            My profile
          </NavLink>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={16} />
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
