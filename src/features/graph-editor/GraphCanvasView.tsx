import type { MouseEvent } from 'react'
import type { EditorEdge, EditorNode } from './types'

type GraphCanvasViewProps = {
  nodes: EditorNode[]
  edges: EditorEdge[]
  rootNodeId?: string
  selectedNodeId?: string
  highlightedNodeId?: string
  highlightedEdge?: { sourceId: string; targetId: string }
  directedEdges: boolean
  onCanvasClick: (x: number, y: number) => void
  onNodeClick: (nodeId: string) => void
}

const VIEWBOX_WIDTH = 960
const VIEWBOX_HEIGHT = 640

export function GraphCanvasView({
  nodes,
  edges,
  rootNodeId,
  selectedNodeId,
  highlightedNodeId,
  highlightedEdge,
  directedEdges,
  onCanvasClick,
  onNodeClick,
}: GraphCanvasViewProps) {
  const handleCanvasClick = (event: MouseEvent<SVGSVGElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH
    const y = ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT

    onCanvasClick(x, y)
  }

  return (
    <svg
      className="h-full w-full rounded-md bg-slate-900"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      onClick={handleCanvasClick}
      role="img"
      aria-label="Graph editor canvas"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>

      {edges.map((edge) => {
        const source = nodes.find((node) => node.id === edge.source)
        const target = nodes.find((node) => node.id === edge.target)
        const isHighlighted =
          highlightedEdge?.sourceId === edge.source &&
          highlightedEdge?.targetId === edge.target

        if (!source || !target) {
          return null
        }

        return (
          <line
            key={edge.id}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={isHighlighted ? '#22d3ee' : '#94a3b8'}
            strokeWidth={isHighlighted ? '4' : '2.5'}
            markerEnd={directedEdges ? 'url(#arrowhead)' : undefined}
          />
        )
      })}

      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId
        const isRoot = node.id === rootNodeId
        const isHighlighted = node.id === highlightedNodeId

        return (
          <g
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            className="cursor-pointer"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={isSelected || isHighlighted ? 26 : 22}
              fill={
                isSelected
                  ? '#38bdf8'
                  : isHighlighted
                    ? '#0f766e'
                    : '#334155'
              }
              stroke={isRoot ? '#f59e0b' : '#e2e8f0'}
              strokeWidth={isRoot ? 3 : 2}
            />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="13"
              fontWeight="700"
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
