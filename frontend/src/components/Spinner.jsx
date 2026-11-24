export default function Spinner({ full = false }) {
  const ring = (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
  );
  if (full) return <div className="flex min-h-screen items-center justify-center">{ring}</div>;
  return <div className="flex justify-center py-12">{ring}</div>;
}
