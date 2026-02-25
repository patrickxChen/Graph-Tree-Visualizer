import type { ReactNode } from 'react'

type WorkspaceLayoutProps = {
  leftPane: ReactNode
  rightPane: ReactNode
}

export function WorkspaceLayout({ leftPane, rightPane }: WorkspaceLayoutProps) {
  return (
    <main className="flex h-screen w-full flex-col bg-slate-900 text-slate-200">
      <header className="flex h-14 items-center border-b border-slate-700 px-4">
        <h1 className="text-sm font-semibold tracking-wide">
          AlgoVisuals
        </h1>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-2">
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
