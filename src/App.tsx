import { useMemo, useState } from 'react'
import { CodeEditorPanel } from './components/CodeEditorPanel'
import { GraphEditorPanel, useGraphEditorState } from './features/graph-editor'
import type { RuntimeCallFrame } from './features/runtime-bridge'
import { useRuntimeBridge } from './features/runtime-bridge'
import { WorkspaceLayout } from './components/WorkspaceLayout'

function App() {
  const [algorithmCode, setAlgorithmCode] = useState('')
  const graphEditor = useGraphEditorState()
  const runtimeBridge = useRuntimeBridge()

  const defaultCode = useMemo(
    () => `function dfs(node, graph, visited = new Set()) {
  if (!node || visited.has(node.id)) return;

  pushFrame('dfs', { node: node.id, visitedCount: visited.size });
  visited.add(node.id);
  setLocals({ node: node.id, visitedCount: visited.size });
  visit(node.id);

  for (const next of graph.getNeighbors(node.id)) {
    highlightEdge(node.id, next.id);
    dfs(next, graph, visited);
  }

  popFrame();
}

dfs(graph.getRoot(), graph);`,
    [],
  )

  const resolvedCode = algorithmCode || defaultCode

  const handleRun = () => {
    runtimeBridge.execute({
      code: resolvedCode,
      graph: graphEditor.state,
    })
  }

  const inspectorState = useMemo(() => {
    let highlightedNodeId: string | undefined
    let highlightedEdge: { sourceId: string; targetId: string } | undefined
    const frameStack: RuntimeCallFrame[] = []

    for (const event of runtimeBridge.syncedEvents) {
      if (event.type === 'visit' && event.nodeId) {
        highlightedNodeId = event.nodeId
      }

      if (event.type === 'highlight-edge' && event.sourceId && event.targetId) {
        highlightedEdge = {
          sourceId: event.sourceId,
          targetId: event.targetId,
        }
      }

      if (event.type === 'frame-enter' && event.frameId) {
        frameStack.push({
          id: event.frameId,
          name: event.frameName || 'anonymous',
          locals: event.locals || {},
        })
      }

      if (event.type === 'locals-update' && event.frameId) {
        const frame = frameStack.find((entry) => entry.id === event.frameId)
        if (frame) {
          frame.locals = event.locals || {}
        }
      }

      if (event.type === 'frame-exit' && event.frameId) {
        const index = frameStack.findIndex((entry) => entry.id === event.frameId)
        if (index >= 0) {
          frameStack.splice(index, 1)
        }
      }
    }

    return {
      highlightedNodeId,
      highlightedEdge,
      callFrames: frameStack,
    }
  }, [runtimeBridge.syncedEvents])

  return (
    <WorkspaceLayout
      leftPane={
        <CodeEditorPanel
          code={resolvedCode}
          onCodeChange={setAlgorithmCode}
          runtimeState={runtimeBridge.state}
          onRun={handleRun}
          onStop={runtimeBridge.stop}
          onResetTimeline={runtimeBridge.resetTimeline}
          onTimeLimitChange={runtimeBridge.setTimeLimitMs}
        />
      }
      rightPane={
        <GraphEditorPanel
          state={graphEditor.state}
          actions={graphEditor.actions}
          runtimeStatus={runtimeBridge.state.status}
          currentStepIndex={runtimeBridge.currentStepIndex}
          totalSteps={runtimeBridge.state.events.length}
          isPlaybackRunning={runtimeBridge.isPlaybackRunning}
          callFrames={inspectorState.callFrames}
          syncedEvents={runtimeBridge.syncedEvents}
          highlightedNodeId={inspectorState.highlightedNodeId}
          highlightedEdge={inspectorState.highlightedEdge}
          onRunPlayback={runtimeBridge.runPlayback}
          onPausePlayback={runtimeBridge.pausePlayback}
          onStepPlayback={runtimeBridge.stepPlayback}
          onResetPlayback={runtimeBridge.resetPlayback}
        />
      }
    />
  )
}

export default App
