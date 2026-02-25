import { useMemo, useState } from 'react'
import { CodeEditorPanel } from './components/CodeEditorPanel'
import { GraphCanvasPlaceholderPanel } from './components/GraphCanvasPlaceholderPanel'
import { WorkspaceLayout } from './components/WorkspaceLayout'

function App() {
  const [algorithmCode, setAlgorithmCode] = useState('')

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

  return (
    <WorkspaceLayout
      leftPane={
        <CodeEditorPanel
          code={algorithmCode || defaultCode}
          onCodeChange={setAlgorithmCode}
        />
      }
      rightPane={<GraphCanvasPlaceholderPanel />}
    />
  )
}

export default App
