import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explore from './pages/Explore.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Mentorship from './pages/Mentorship.jsx';
import Messages from './pages/Messages.jsx';
import Learning from './pages/Learning.jsx';
import Assistant from './pages/Assistant.jsx';

const guarded = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={!loading && user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={guarded(<Dashboard />)} />
        <Route path="/explore" element={guarded(<Explore />)} />
        <Route path="/profile/edit" element={guarded(<EditProfile />)} />
        <Route path="/profile/:id" element={guarded(<Profile />)} />
        <Route path="/mentorship" element={guarded(<Mentorship />)} />
        <Route path="/messages" element={guarded(<Messages />)} />
        <Route path="/messages/:userId" element={guarded(<Messages />)} />
        <Route path="/learning" element={guarded(<Learning />)} />
        <Route path="/assistant" element={guarded(<Assistant />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
