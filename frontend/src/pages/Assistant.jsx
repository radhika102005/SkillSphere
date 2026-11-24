import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import api, { errMsg } from '../api/client.js';

const SUGGESTIONS = [
  'Make me a 4-week plan to learn React',
  'How do I prepare for my first mentorship session?',
  'Tips to explain a technical topic simply',
];

export default function Assistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your SkillSphere assistant. Ask me for study plans, session prep or learning tips." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const { data } = await api.post('/ai/chat', { message: q });
      setMessages((m) => [...m, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', text: errMsg(err, 'Sorry, something went wrong.') }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="card flex h-[calc(100vh-8rem)] min-h-[420px] flex-col !p-0">
        <header className="flex items-center gap-2 border-b border-primary-100 px-5 py-3">
          <Sparkles size={18} className="text-primary-500" />
          <h1 className="font-bold text-slate-900">AI Assistant</h1>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-surface px-5 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-primary-600 text-white' : 'rounded-bl-sm bg-white text-slate-800 shadow-card'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {busy && <p className="animate-pulse-soft text-sm text-slate-400">Thinking…</p>}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-primary-100 p-3">
          <input className="input" placeholder="Ask anything about learning…" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn-primary shrink-0" disabled={busy} aria-label="Send"><Send size={16} /></button>
        </form>
      </div>
    </main>
  );
}
