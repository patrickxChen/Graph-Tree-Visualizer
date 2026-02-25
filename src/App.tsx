import { useMemo, useState } from 'react'
import { CodeEditorPanel } from './components/CodeEditorPanel'
import { GraphEditorPanel, useGraphEditorState } from './features/graph-editor'
import { useRuntimeBridge } from './features/runtime-bridge'
import { WorkspaceLayout } from './components/WorkspaceLayout'

function App() {
  const [algorithmCode, setAlgorithmCode] = useState('')
  const graphEditor = useGraphEditorState()
  const runtimeBridge = useRuntimeBridge()

  const defaultCode = useMemo(
    () => `function dfs(node, graph, visited = new Set()) {
  if (!node || visited.has(node.id)) return;
  visited.add(node.id);
  visit(node.id); // visual runtime hook (future phase)

  for (const next of graph.getNeighbors(node.id)) {
    dfs(next, graph, visited);
  }
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
        <GraphEditorPanel state={graphEditor.state} actions={graphEditor.actions} />
      }
    />
  )
}

export default App
