import { Link } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, Sparkles, Star, ArrowRight } from 'lucide-react';

const features = [
  { icon: Users, title: 'Skill exchange', text: 'Teach what you know, learn what you want. Match with peers who complement your skills.' },
  { icon: Star, title: 'Mentorship', text: 'Request sessions, build reputation with reviews and earn points for every session.' },
  { icon: MessageSquare, title: 'Direct messaging', text: 'Chat with your mentors and learning partners to plan sessions.' },
  { icon: BookOpen, title: 'Resource library', text: 'Share and discover curated courses, articles and tools from fellow students.' },
  { icon: Sparkles, title: 'AI assistant', text: 'Get study plans and session prep, plus smart peer recommendations.' },
];

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-hero text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center md:py-28">
          <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
            Peer-to-peer learning for students
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">Learn · Teach · Connect</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            SkillSphere helps students swap skills and find mentors on campus and beyond — no fees, just
            people helping people grow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-extrabold text-dark md:text-3xl">Everything you need to grow together</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card card-hover">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-primary-100 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SkillSphere
      </footer>
    </main>
  );
}
