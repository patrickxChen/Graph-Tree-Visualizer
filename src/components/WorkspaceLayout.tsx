import type { ReactNode } from 'react'

type WorkspaceLayoutProps = {
  leftPane: ReactNode
  rightPane: ReactNode
}

export function WorkspaceLayout({ leftPane, rightPane }: WorkspaceLayoutProps) {
  return (
    <main className="flex h-screen w-full flex-col bg-slate-900 text-slate-200">
      <header className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_4px_rgba(34,211,238,0.55)]" />
          <h1 className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-lg font-extrabold tracking-wider text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]">
            AlgoLize
          </h1>
        </div>

        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Graph Runtime Lab
        </span>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(480px,1fr)_minmax(620px,1.35fr)]">
        <div className="min-h-0 rounded-lg border border-slate-700 bg-slate-950">
          {leftPane}
        </div>
        <div className="min-h-0 rounded-lg border border-slate-700 bg-slate-950">
          {rightPane}
        </div>
      </section>
    </main>
  )
}
