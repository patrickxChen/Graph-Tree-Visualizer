import { useMemo, useState } from 'react'
import type { EditorEdge, EditorNode, GraphMode } from './types'

type GraphEditorControlsProps = {
  mode: GraphMode
  directedEdges: boolean
  nodes: EditorNode[]
  edges: EditorEdge[]
  selectedNodeId?: string
  rootNodeId?: string
  onModeChange: (mode: GraphMode) => void
  onDirectedChange: (directed: boolean) => void
  onNodeSelect: (nodeId?: string) => void
  onNodeLabelChange: (nodeId: string, label: string) => void
  onDeleteNode: (nodeId: string) => void
  onAddEdge: (source: string, target: string) => void
  onDeleteEdge: (edgeId: string) => void
  onRootChange: (nodeId?: string) => void
  onResetGraph: () => void
}

export function GraphEditorControls({
  mode,
  directedEdges,
  nodes,
  edges,
  selectedNodeId,
  rootNodeId,
  onModeChange,
  onDirectedChange,
  onNodeSelect,
  onNodeLabelChange,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onRootChange,
  onResetGraph,
}: GraphEditorControlsProps) {
  const [edgeSource, setEdgeSource] = useState<string>('')
  const [edgeTarget, setEdgeTarget] = useState<string>('')

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  )

  const handleAddEdge = () => {
    onAddEdge(edgeSource, edgeTarget)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/70 p-3 text-xs text-slate-200">
      <h3 className="mb-2 text-sm font-semibold">Graph/Tree Controls</h3>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-slate-400">Mode</span>
          <select
            className="rounded bg-slate-800 px-2 py-1"
            value={mode}
            onChange={(event) => onModeChange(event.target.value as GraphMode)}
          >
            <option value="graph">Graph</option>
            <option value="tree">Tree</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={directedEdges}
            onChange={(event) => onDirectedChange(event.target.checked)}
          />
          Directed edges
        </label>
      </div>

      <p className="mt-3 rounded bg-slate-900 px-2 py-1 text-slate-400">
        Click empty canvas space to add a node. Click a node to select it.
      </p>

      <div className="mt-3 space-y-2 rounded border border-slate-700 p-2">
        <p className="font-medium">Selected Node</p>
        <select
          className="w-full rounded bg-slate-800 px-2 py-1"
          value={selectedNodeId ?? ''}
          onChange={(event) => onNodeSelect(event.target.value || undefined)}
        >
          <option value="">None</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label} ({node.id})
            </option>
          ))}
        </select>

        <input
          className="w-full rounded bg-slate-800 px-2 py-1"
          placeholder="Node label"
          value={selectedNode?.label ?? ''}
          onChange={(event) => {
            if (selectedNode) {
              onNodeLabelChange(selectedNode.id, event.target.value)
            }
          }}
          disabled={!selectedNode}
        />

        <button
          type="button"
          className="w-full rounded bg-rose-700 px-2 py-1 font-medium disabled:opacity-50"
          disabled={!selectedNode}
          onClick={() => {
            if (selectedNode) {
              onDeleteNode(selectedNode.id)
            }
          }}
        >
          Delete selected node
        </button>
      </div>

      <div className="mt-3 space-y-2 rounded border border-slate-700 p-2">
        <p className="font-medium">Add Edge</p>
        <select
          className="w-full rounded bg-slate-800 px-2 py-1"
          value={edgeSource}
          onChange={(event) => setEdgeSource(event.target.value)}
        >
          <option value="">Source node</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded bg-slate-800 px-2 py-1"
          value={edgeTarget}
          onChange={(event) => setEdgeTarget(event.target.value)}
        >
          <option value="">Target node</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="w-full rounded bg-emerald-700 px-2 py-1 font-medium disabled:opacity-50"
          disabled={!edgeSource || !edgeTarget || edgeSource === edgeTarget}
          onClick={handleAddEdge}
        >
          Insert edge
        </button>
      </div>

      {mode === 'tree' ? (
        <div className="mt-3 space-y-2 rounded border border-slate-700 p-2">
          <p className="font-medium">Tree Root</p>
          <select
            className="w-full rounded bg-slate-800 px-2 py-1"
            value={rootNodeId ?? ''}
            onChange={(event) => onRootChange(event.target.value || undefined)}
          >
            <option value="">No root</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="mt-3 min-h-0 flex-1 overflow-auto rounded border border-slate-700 p-2">
        <p className="mb-2 font-medium">Edges ({edges.length})</p>
        <div className="space-y-1">
          {edges.map((edge) => {
            const sourceLabel = nodes.find((node) => node.id === edge.source)?.label
            const targetLabel = nodes.find((node) => node.id === edge.target)?.label
            return (
              <div
                key={edge.id}
                className="flex items-center justify-between rounded bg-slate-800 px-2 py-1"
              >
                <span>
                  {sourceLabel ?? edge.source} {directedEdges ? '→' : '—'}{' '}
                  {targetLabel ?? edge.target}
                </span>
                <button
                  type="button"
                  className="text-rose-300"
                  onClick={() => onDeleteEdge(edge.id)}
                >
                  Delete
                </button>
              </div>
            )
          })}
          {edges.length === 0 ? (
            <p className="text-slate-500">No edges yet.</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="mt-3 rounded bg-slate-700 px-2 py-1 font-medium"
        onClick={onResetGraph}
      >
        Reset demo graph
      </button>
    </div>
  )
}
