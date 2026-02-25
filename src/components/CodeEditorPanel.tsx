import Editor from '@monaco-editor/react'

type CodeEditorPanelProps = {
  code: string
  onCodeChange: (value: string) => void
}

export function CodeEditorPanel({ code, onCodeChange }: CodeEditorPanelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Algorithm Editor
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white"
          >
            Run
          </button>
          <button
            type="button"
            className="rounded bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-100"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
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
    </section>
  )
}
