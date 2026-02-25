export type GraphMode = 'graph' | 'tree'

export type EditorNode = {
  id: string
  label: string
  x: number
  y: number
}

export type EditorEdge = {
  id: string
  source: string
  target: string
  directed: boolean
}

export type GraphEditorState = {
  mode: GraphMode
  directedEdges: boolean
  nodes: EditorNode[]
  edges: EditorEdge[]
  rootNodeId?: string
  selectedNodeId?: string
}

export type PersistedGraphEditorState = Omit<GraphEditorState, 'selectedNodeId'>
