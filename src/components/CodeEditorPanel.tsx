import Editor, { type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
import type { RuntimeBridgeState } from '../features/runtime-bridge'

type SelectOption = {
  id: string
  name: string
}

type CodeEditorPanelProps = {
  code: string
  onCodeChange: (value: string) => void
  runtimeState: RuntimeBridgeState
  onLoadDemo: () => void
  templateOptions: SelectOption[]
  selectedTemplateId: string
  onTemplateChange: (templateId: string) => void
  presetOptions: SelectOption[]
  selectedPresetId: string
  onPresetChange: (presetId: string) => void
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
  onLoadDemo,
  templateOptions,
  selectedTemplateId,
  onTemplateChange,
  presetOptions,
  selectedPresetId,
  onPresetChange,
  onRun,
  onStop,
  onResetTimeline,
  onTimeLimitChange,
}: CodeEditorPanelProps) {
  const isRunning = runtimeState.status === 'running'
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null)
  const decorationIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return
    }

    const lineMatch = runtimeState.error?.match(/<anonymous>:(\d+):(\d+)/)
    const runtimeLine = lineMatch ? Number(lineMatch[1]) - 1 : undefined

    if (!runtimeLine || runtimeLine < 1) {
      decorationIdsRef.current = editorRef.current.deltaDecorations(
        decorationIdsRef.current,
        [],
      )
      return
    }

    decorationIdsRef.current = editorRef.current.deltaDecorations(
      decorationIdsRef.current,
      [
        {
          range: new monacoRef.current.Range(runtimeLine, 1, runtimeLine, 1),
          options: {
            isWholeLine: true,
            className: 'runtime-error-line',
            glyphMarginClassName: 'runtime-error-glyph',
            glyphMarginHoverMessage: [{ value: 'Runtime error reported here' }],
          },
        },
      ],
    )
  }, [runtimeState.error])

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editor.updateOptions({ glyphMargin: true })
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-700 px-3 py-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Algorithm Editor
        </h2>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <label className="flex items-center gap-1 text-xs text-slate-400">
            Template
            <select
              className="w-44 rounded bg-slate-800 px-2 py-1 text-slate-100"
              value={selectedTemplateId}
              onChange={(event) => onTemplateChange(event.target.value)}
            >
              {templateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1 text-xs text-slate-400">
            Preset
            <select
              className="w-44 rounded bg-slate-800 px-2 py-1 text-slate-100"
              value={selectedPresetId}
              onChange={(event) => onPresetChange(event.target.value)}
            >
              {presetOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1 text-xs text-slate-400">
            Timeout
            <input
              type="number"
              min={500}
              max={20000}
              step={100}
              className="w-24 rounded bg-slate-800 px-2 py-1 text-slate-100"
              value={runtimeState.timeLimitMs}
              onChange={(event) =>
                onTimeLimitChange(Number(event.target.value || 3000))
              }
            />
            ms
          </label>

          <button
            type="button"
            className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            onClick={onRun}
            disabled={isRunning}
          >
            Execute
          </button>

          <button
            type="button"
            className="rounded bg-amber-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            onClick={onStop}
            disabled={!isRunning}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100"
            onClick={onLoadDemo}
          >
            Load Demo
          </button>

          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100"
            onClick={onResetTimeline}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="border-b border-slate-700 px-3 py-2 text-xs">
        <p className={`${statusColorMap[runtimeState.status]} font-semibold`}>
          Runtime: {runtimeState.status}
        </p>
        {runtimeState.error ? (
          <p className="mt-1 rounded bg-rose-900/40 px-2 py-1 text-xs text-rose-300">
            {runtimeState.error}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onMount={handleEditorMount}
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
    </section>
  )
}
