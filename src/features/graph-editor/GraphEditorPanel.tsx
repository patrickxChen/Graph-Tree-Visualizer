import { GraphCanvasView } from './GraphCanvasView'
import { GraphEditorControls } from './GraphEditorControls'
import type { RuntimeCallFrame, RuntimeEvent, RuntimeStatus } from '../runtime-bridge'
import type {
  GraphEditorActions,
  UseGraphEditorStateResult,
} from './useGraphEditorState'

type GraphEditorPanelProps = {
  state: UseGraphEditorStateResult['state']
  actions: GraphEditorActions
  runtimeStatus: RuntimeStatus
  currentStepIndex: number
  totalSteps: number
  isPlaybackRunning: boolean
  callFrames: RuntimeCallFrame[]
  syncedEvents: RuntimeEvent[]
  highlightedNodeId?: string
  highlightedEdge?: { sourceId: string; targetId: string }
  onRunPlayback: () => void
  onPausePlayback: () => void
  onStepPlayback: () => void
  onResetPlayback: () => void
}

export function GraphEditorPanel({
  state,
  actions,
  runtimeStatus,
  currentStepIndex,
  totalSteps,
  isPlaybackRunning,
  callFrames,
  syncedEvents,
  highlightedNodeId,
  highlightedEdge,
  onRunPlayback,
  onPausePlayback,
  onStepPlayback,
  onResetPlayback,
}: GraphEditorPanelProps) {
  const hasTimeline = totalSteps > 0

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Interactive Graph/Tree Canvas
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="flex w-[22rem] max-w-[44%] min-w-[19rem] flex-col rounded-md border border-slate-800 bg-slate-950/60">
          <div className="min-h-0 flex-1">
            <GraphEditorControls
              mode={state.mode}
              directedEdges={state.directedEdges}
              nodes={state.nodes}
              edges={state.edges}
              selectedNodeId={state.selectedNodeId}
              rootNodeId={state.rootNodeId}
              onModeChange={actions.setMode}
              onDirectedChange={actions.setDirectedEdges}
              onNodeSelect={actions.selectNode}
              onNodeLabelChange={actions.updateNodeLabel}
              onDeleteNode={actions.deleteNode}
              onAddEdge={actions.addEdge}
              onDeleteEdge={actions.deleteEdge}
              onRootChange={actions.setRootNodeId}
              onResetGraph={actions.resetGraph}
            />
          </div>

          <div className="border-t border-slate-800 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Timeline Controls
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Runtime: {runtimeStatus} · Step {Math.max(currentStepIndex + 1, 0)} / {totalSteps}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded bg-cyan-700 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                onClick={onRunPlayback}
                disabled={!hasTimeline || isPlaybackRunning}
              >
                Run
              </button>
              <button
                type="button"
                className="rounded bg-amber-700 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                onClick={onPausePlayback}
                disabled={!isPlaybackRunning}
              >
                Pause
              </button>
              <button
                type="button"
                className="rounded bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-100 disabled:opacity-50"
                onClick={onStepPlayback}
                disabled={!hasTimeline}
              >
                Step
              </button>
              <button
                type="button"
                className="rounded bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-100 disabled:opacity-50"
                onClick={onResetPlayback}
                disabled={!hasTimeline && currentStepIndex < 0}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Call Frames
            </p>
            <div className="mt-2 h-28 overflow-auto rounded border border-slate-700 bg-slate-900/60 p-2 text-xs text-slate-200">
              {callFrames.length === 0 ? (
                <p className="text-slate-500">No active frames for this step.</p>
              ) : (
                callFrames.map((frame) => (
                  <div key={frame.id} className="mb-2 last:mb-0">
                    <p className="font-semibold text-cyan-300">{frame.name}</p>
                    {Object.keys(frame.locals).length === 0 ? (
                      <p className="text-slate-500">No locals</p>
                    ) : (
                      Object.entries(frame.locals).map(([name, value]) => (
                        <p key={name} className="text-slate-300">
                          {name}: {value}
                        </p>
                      ))
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Event Log (Synced)
            </p>
            <div className="mt-2 h-36 overflow-auto rounded border border-slate-700 bg-slate-900/60 p-2 text-xs text-slate-300">
              {syncedEvents.length === 0 ? (
                <p className="text-slate-500">No events at current step.</p>
              ) : (
                syncedEvents.map((event) => (
                  <p key={event.id} className="mb-1 last:mb-0">
                    [{event.type}] {event.message}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 p-3">
          <GraphCanvasView
            nodes={state.nodes}
            edges={state.edges}
            rootNodeId={state.rootNodeId}
            selectedNodeId={state.selectedNodeId}
            highlightedNodeId={highlightedNodeId}
            highlightedEdge={highlightedEdge}
            directedEdges={state.directedEdges}
            onCanvasClick={actions.addNode}
            onNodeClick={actions.selectNode}
          />
        </div>
      </div>
    </section>
  )
}
