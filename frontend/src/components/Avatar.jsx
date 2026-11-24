const COLORS = ['bg-primary-500', 'bg-secondary-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];

export default function Avatar({ name = '?', size = 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  const color = COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-2xl' };
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color} ${sizes[size]}`}>
      {initials || '?'}
    </div>
  );
}
