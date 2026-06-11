export default function AdminPageLoader() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-off-white">
      <header className="border-b border-black/10 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="admin-shimmer hidden h-5 w-28 rounded-sm md:block" />
            <div className="flex gap-4">
              <div className="admin-shimmer h-3 w-24 rounded-sm" />
              <div className="admin-shimmer h-3 w-16 rounded-sm opacity-60" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="admin-shimmer hidden h-8 w-44 rounded-sm sm:block" />
            <div className="admin-shimmer h-8 w-20 rounded-sm" />
            <div className="admin-shimmer h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <p className="admin-loader-brand font-serif text-3xl tracking-[0.08em] text-black md:text-4xl">
            YAIRINK
          </p>

          <div className="mt-6 flex w-32 flex-col gap-2">
            <span className="admin-loader-stroke h-px w-full bg-black/80" />
            <span className="admin-loader-stroke admin-loader-stroke-delay-1 h-px w-[80%] bg-black/50" />
            <span className="admin-loader-stroke admin-loader-stroke-delay-2 h-px w-[55%] bg-black/30" />
          </div>

          <p className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.28em] text-black/45">
            CARGANDO PANEL
            <span className="flex gap-1">
              <span className="admin-loader-dot h-1 w-1 rounded-full bg-black/50" />
              <span className="admin-loader-dot admin-loader-dot-delay-1 h-1 w-1 rounded-full bg-black/50" />
              <span className="admin-loader-dot admin-loader-dot-delay-2 h-1 w-1 rounded-full bg-black/50" />
            </span>
          </p>
        </div>

        <div className="mt-16 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="admin-shimmer border border-black/5 bg-white p-4"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="mb-3 aspect-[4/3] bg-black/[0.04]" />
              <div className="mb-2 h-2.5 w-[66%] bg-black/[0.06]" />
              <div className="h-2 w-1/2 bg-black/[0.04]" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
