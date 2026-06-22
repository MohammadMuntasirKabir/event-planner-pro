export default function NewEventLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse">
      <div className="h-4 w-32 rounded-lg bg-white/5 mb-6" />
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <div className="h-8 w-48 rounded-lg bg-white/5 mb-2" />
        <div className="h-4 w-64 rounded-lg bg-white/5 mb-8" />

        <div className="space-y-6">
          {/* Title field */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-lg bg-white/5" />
            <div className="h-10 w-full rounded-lg bg-white/5" />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-lg bg-white/5" />
            <div className="h-24 w-full rounded-lg bg-white/5" />
          </div>

          {/* Location field */}
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-lg bg-white/5" />
            <div className="h-10 w-full rounded-lg bg-white/5" />
          </div>

          {/* Date field */}
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-lg bg-white/5" />
            <div className="h-10 w-full rounded-lg bg-white/5" />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-36 rounded-lg bg-white/5" />
            <div className="h-10 w-24 rounded-lg bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
