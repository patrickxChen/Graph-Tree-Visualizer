import type { GraphEditorState } from '../graph-editor/types'

export type RuntimeEventType =
  | 'visit'
  | 'highlight-edge'
  | 'log'
  | 'system'
  | 'frame-enter'
  | 'frame-exit'
  | 'locals-update'

export type RuntimeLocals = Record<string, string>

export type RuntimeEvent = {
  id: string
  timestamp: number
  type: RuntimeEventType
  message: string
  nodeId?: string
  sourceId?: string
  targetId?: string
  frameId?: string
  frameName?: string
  locals?: RuntimeLocals
}

export type RuntimeCallFrame = {
  id: string
  name: string
  locals: RuntimeLocals
}

export type RuntimeStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'stopped'
  | 'error'
  | 'timeout'

export type RuntimeBridgeState = {
  status: RuntimeStatus
  events: RuntimeEvent[]
  error?: string
  timeLimitMs: number
  startedAt?: number
  endedAt?: number
}

export type RuntimeExecutionRequest = {
  code: string
  graph: GraphEditorState
}

export type RuntimeWorkerNode = {
  id: string
  label: string
}

export type RuntimeWorkerEdge = {
  id: string
  source: string
  target: string
  directed: boolean
}

export type RuntimeWorkerGraph = {
  nodes: RuntimeWorkerNode[]
  edges: RuntimeWorkerEdge[]
  rootNodeId?: string
}

export type RuntimeWorkerExecuteMessage = {
  type: 'execute'
  payload: {
    code: string
    graph: RuntimeWorkerGraph
  }
}

export type RuntimeWorkerEventMessage = {
  type: 'event'
  event: RuntimeEvent
}

export type RuntimeWorkerCompletedMessage = {
  type: 'completed'
}

export type RuntimeWorkerErrorMessage = {
  type: 'error'
  error: string
}

export type RuntimeWorkerMessage =
  | RuntimeWorkerEventMessage
  | RuntimeWorkerCompletedMessage
  | RuntimeWorkerErrorMessage
