export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-white/5" />
          <div className="h-4 w-72 rounded-lg bg-white/5" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-white/5" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-6 w-3/4 rounded-lg bg-white/5" />
              <div className="h-7 w-7 rounded-lg bg-white/5" />
            </div>
            <div className="h-4 w-full rounded-lg bg-white/5 mb-2" />
            <div className="h-4 w-2/3 rounded-lg bg-white/5 mb-4" />
            <div className="space-y-2 mb-4">
              <div className="h-3.5 w-1/2 rounded-lg bg-white/5" />
              <div className="h-3.5 w-2/5 rounded-lg bg-white/5" />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="h-3.5 w-24 rounded-lg bg-white/5" />
              <div className="h-3.5 w-20 rounded-lg bg-white/5" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-5 w-16 rounded-md bg-white/5" />
              <div className="h-5 w-14 rounded-md bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
