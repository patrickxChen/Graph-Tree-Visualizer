export function GraphCanvasPlaceholderPanel() {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Interactive Graph/Tree Canvas
        </h2>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center p-4">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-600 bg-slate-900/60 text-center">
          <p className="text-sm font-medium text-slate-200">2D Canvas Placeholder</p>
          <p className="mt-2 max-w-md text-xs text-slate-400">
            Step 1 foundation is complete. Step 2 will add node/edge insert-delete
            interactions and graph/tree editing controls.
          </p>
        </div>
      </div>
    </section>
  )
}
