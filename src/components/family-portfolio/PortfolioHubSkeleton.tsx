export default function PortfolioHubSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/3 rounded bg-slate-200 animate-pulse" />
              <div className="h-2.5 w-1/3 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
