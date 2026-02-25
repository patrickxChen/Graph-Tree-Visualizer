import { GraphCanvasView } from './GraphCanvasView'
import { GraphEditorControls } from './GraphEditorControls'
import { useGraphEditorState } from './useGraphEditorState'

export function GraphEditorPanel() {
  const { state, actions } = useGraphEditorState()

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Interactive Graph/Tree Canvas
        </h2>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-80 max-w-[42%] min-w-72">
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

        <div className="min-h-0 flex-1 p-3">
          <GraphCanvasView
            nodes={state.nodes}
            edges={state.edges}
            rootNodeId={state.rootNodeId}
            selectedNodeId={state.selectedNodeId}
            directedEdges={state.directedEdges}
            onCanvasClick={actions.addNode}
            onNodeClick={actions.selectNode}
          />
        </div>
      </div>
    </section>
  )
}
