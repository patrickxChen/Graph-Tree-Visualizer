export type NodeType = 'graph' | 'tree'

export type GraphNode = {
  id: string
  label: string
  x: number
  y: number
  metadata?: Record<string, unknown>
  nodeType?: NodeType
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  directed: boolean
  weight?: number
}

export type HighlightState = {
  currentNodeId?: string
  activeEdgeId?: string
  visitedNodeIds: string[]
}

export type CallFrame = {
  functionName: string
  args: Record<string, unknown>
  locals: Record<string, unknown>
  depth: number
}

export type ExecutionStep = {
  step: number
  highlights: HighlightState
  callFrames: CallFrame[]
  eventMessage: string
}

export type GraphSnapshot = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  execution?: ExecutionStep
}
