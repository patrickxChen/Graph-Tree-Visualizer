import Editor from '@monaco-editor/react'
import type { RuntimeBridgeState } from '../features/runtime-bridge'

type CodeEditorPanelProps = {
  code: string
  onCodeChange: (value: string) => void
  runtimeState: RuntimeBridgeState
  onRun: () => void
  onStop: () => void
  onResetTimeline: () => void
  onTimeLimitChange: (timeLimitMs: number) => void
}

const statusColorMap: Record<RuntimeBridgeState['status'], string> = {
  idle: 'text-slate-400',
  running: 'text-emerald-300',
  completed: 'text-cyan-300',
  stopped: 'text-amber-300',
  error: 'text-rose-300',
  timeout: 'text-rose-300',
}

export function CodeEditorPanel({
  code,
  onCodeChange,
  runtimeState,
  onRun,
  onStop,
  onResetTimeline,
  onTimeLimitChange,
}: CodeEditorPanelProps) {
  const isRunning = runtimeState.status === 'running'

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Algorithm Editor
        </h2>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-400">
            Timeout
            <input
              type="number"
              min={500}
              max={20000}
              step={100}
              className="w-20 rounded bg-slate-800 px-2 py-1 text-slate-100"
              value={runtimeState.timeLimitMs}
              onChange={(event) =>
                onTimeLimitChange(Number(event.target.value || 3000))
              }
            />
            ms
          </label>

          <button
            type="button"
            className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
            onClick={onRun}
            disabled={isRunning}
          >
            Run
          </button>

          <button
            type="button"
            className="rounded bg-amber-700 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
            onClick={onStop}
            disabled={!isRunning}
          >
            Stop
          </button>

          <button
            type="button"
            className="rounded bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-100"
            onClick={onResetTimeline}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-[3]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => onCodeChange(value ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            smoothScrolling: true,
          }}
        />
      </div>

      <div className="min-h-0 flex-[1] border-t border-slate-700 p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <p className={`${statusColorMap[runtimeState.status]} font-semibold`}>
            Status: {runtimeState.status}
          </p>
          <p className="text-slate-400">Events: {runtimeState.events.length}</p>
        </div>

        {runtimeState.error ? (
          <p className="mb-2 rounded bg-rose-900/40 px-2 py-1 text-xs text-rose-300">
            {runtimeState.error}
          </p>
        ) : null}

        <div className="h-full max-h-32 overflow-auto rounded border border-slate-700 bg-slate-900/60 p-2 text-xs text-slate-300">
          {runtimeState.events.length === 0 ? (
            <p className="text-slate-500">No runtime events yet.</p>
          ) : (
            runtimeState.events.map((event) => (
              <p key={event.id} className="mb-1">
                [{event.type}] {event.message}
              </p>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
