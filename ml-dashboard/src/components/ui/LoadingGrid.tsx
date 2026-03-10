export default function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
        >
          <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
          <div className="aspect-square bg-white/5 rounded-lg mb-3" />
          <div className="h-6 bg-white/10 rounded mb-2 w-1/2" />
          <div className="h-3 bg-white/5 rounded mb-1" />
          <div className="h-3 bg-white/5 rounded w-4/5" />
          <div className="h-8 bg-white/5 rounded mt-4" />
        </div>
      ))}
    </div>
  );
}
