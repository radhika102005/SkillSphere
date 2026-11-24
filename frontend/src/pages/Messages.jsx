import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';

const POLL_MS = 5000;

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const loadConversations = () =>
    api.get('/messages/conversations').then((r) => setConversations(r.data.conversations)).catch(() => {});

  const loadThread = () =>
    api.get(`/messages/${userId}`).then((r) => setMessages(r.data.messages)).catch(() => {});

  // Conversation list (poll)
  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, POLL_MS);
    return () => clearInterval(t);
  }, []);

  // Open thread (poll)
  useEffect(() => {
    if (!userId) {
      setPartner(null);
      setMessages([]);
      return undefined;
    }
    api.get(`/users/${userId}`).then((r) => setPartner(r.data.user)).catch(() => setPartner(null));
    loadThread();
    const t = setInterval(loadThread, POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    try {
      const { data } = await api.post('/messages', { receiver: userId, text });
      setMessages((m) => [...m, data.message]);
      setText('');
      loadConversations();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="card flex h-[calc(100vh-8rem)] min-h-[420px] overflow-hidden !p-0">
        {/* Conversation list */}
        <aside className={`w-full shrink-0 border-r border-primary-100 md:block md:w-80 ${userId ? 'hidden' : 'block'}`}>
          <div className="border-b border-primary-100 px-4 py-3 font-bold text-slate-900">Messages</div>
          <ul className="max-h-full overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.user._id}>
                <Link
                  to={`/messages/${c.user._id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-primary-50 ${c.user._id === userId ? 'bg-primary-50' : ''}`}
                >
                  <Avatar name={c.user.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.user.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">{c.unread}</span>
                  )}
                </Link>
              </li>
            ))}
            {!conversations.length && (
              <li className="p-6 text-center text-sm text-slate-400">
                No conversations yet. Open someone's profile in <Link to="/explore" className="font-semibold text-primary-600">Explore</Link> to say hi.
              </li>
            )}
          </ul>
        </aside>

        {/* Thread */}
        <section className={`min-w-0 flex-1 flex-col ${userId ? 'flex' : 'hidden md:flex'}`}>
          {userId ? (
            <>
              <header className="flex items-center gap-3 border-b border-primary-100 px-4 py-3">
                <Link to="/messages" className="md:hidden" aria-label="Back"><ArrowLeft size={20} /></Link>
                {partner && (
                  <>
                    <Avatar name={partner.name} size="sm" />
                    <Link to={`/profile/${partner._id}`} className="font-semibold text-slate-900 hover:text-primary-600">{partner.name}</Link>
                  </>
                )}
              </header>

              <div className="flex-1 space-y-2 overflow-y-auto bg-surface px-4 py-4">
                {messages.map((m) => {
                  const mine = String(m.sender) === String(user._id);
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-sm bg-primary-600 text-white' : 'rounded-bl-sm bg-white text-slate-800 shadow-card'}`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {!messages.length && <p className="pt-10 text-center text-sm text-slate-400">Say hello 👋</p>}
                <div ref={bottomRef} />
              </div>

              {error && <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
              <form onSubmit={send} className="flex gap-2 border-t border-primary-100 p-3">
                <input className="input" placeholder="Type a message…" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
                <button className="btn-primary shrink-0" aria-label="Send"><Send size={16} /></button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Select a conversation</div>
          )}
        </section>
      </div>
    </main>
  );
}
