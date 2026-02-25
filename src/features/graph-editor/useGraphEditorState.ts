import { useEffect, useMemo, useState } from 'react'
import type {
  EditorEdge,
  EditorNode,
  GraphEditorState,
  GraphMode,
  PersistedGraphEditorState,
} from './types'

const STORAGE_KEY = 'algovisuals.graph-editor.v1'

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

const defaultState: GraphEditorState = {
  mode: 'graph',
  directedEdges: false,
  nodes: [
    { id: 'n1', label: 'A', x: 220, y: 180 },
    { id: 'n2', label: 'B', x: 440, y: 320 },
  ],
  edges: [{ id: 'e1', source: 'n1', target: 'n2', directed: false }],
  selectedNodeId: 'n1',
}

const reviveState = (): GraphEditorState => {
  if (typeof window === 'undefined') {
    return defaultState
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return defaultState
  }

  try {
    const parsed = JSON.parse(raw) as PersistedGraphEditorState
    return {
      ...defaultState,
      ...parsed,
      selectedNodeId: parsed.nodes[0]?.id,
    }
  } catch {
    return defaultState
  }
}

export function useGraphEditorState() {
  const [state, setState] = useState<GraphEditorState>(() => reviveState())

  useEffect(() => {
    const persisted: PersistedGraphEditorState = {
      mode: state.mode,
      directedEdges: state.directedEdges,
      nodes: state.nodes,
      edges: state.edges,
      rootNodeId: state.rootNodeId,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  }, [state])

  const selectedNode = useMemo(
    () => state.nodes.find((node) => node.id === state.selectedNodeId),
    [state.nodes, state.selectedNodeId],
  )

  const setMode = (mode: GraphMode) => {
    setState((prev) => {
      const rootNodeId =
        mode === 'tree'
          ? prev.rootNodeId ?? prev.nodes[0]?.id
          : undefined

      return {
        ...prev,
        mode,
        rootNodeId,
      }
    })
  }

  const setDirectedEdges = (directed: boolean) => {
    setState((prev) => ({
      ...prev,
      directedEdges: directed,
      edges: prev.edges.map((edge) => ({ ...edge, directed })),
    }))
  }

  const addNode = (x: number, y: number) => {
    setState((prev) => {
      const id = createId('n')
      const nextNode: EditorNode = {
        id,
        label: `N${prev.nodes.length + 1}`,
        x,
        y,
      }

      return {
        ...prev,
        nodes: [...prev.nodes, nextNode],
        selectedNodeId: id,
        rootNodeId: prev.mode === 'tree' ? prev.rootNodeId ?? id : undefined,
      }
    })
  }

  const selectNode = (nodeId?: string) => {
    setState((prev) => ({ ...prev, selectedNodeId: nodeId }))
  }

  const updateNodeLabel = (nodeId: string, label: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId ? { ...node, label } : node,
      ),
    }))
  }

  const deleteNode = (nodeId: string) => {
    setState((prev) => {
      const nodes = prev.nodes.filter((node) => node.id !== nodeId)
      const edges = prev.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      )

      return {
        ...prev,
        nodes,
        edges,
        selectedNodeId:
          prev.selectedNodeId === nodeId ? nodes[0]?.id : prev.selectedNodeId,
        rootNodeId:
          prev.rootNodeId === nodeId
            ? prev.mode === 'tree'
              ? nodes[0]?.id
              : undefined
            : prev.rootNodeId,
      }
    })
  }

  const addEdge = (source: string, target: string) => {
    if (!source || !target || source === target) {
      return
    }

    setState((prev) => {
      const alreadyExists = prev.edges.some(
        (edge) => edge.source === source && edge.target === target,
      )

      if (alreadyExists) {
        return prev
      }

      const edge: EditorEdge = {
        id: createId('e'),
        source,
        target,
        directed: prev.directedEdges,
      }

      return {
        ...prev,
        edges: [...prev.edges, edge],
      }
    })
  }

  const deleteEdge = (edgeId: string) => {
    setState((prev) => ({
      ...prev,
      edges: prev.edges.filter((edge) => edge.id !== edgeId),
    }))
  }

  const setRootNodeId = (rootNodeId?: string) => {
    setState((prev) => ({
      ...prev,
      rootNodeId: prev.mode === 'tree' ? rootNodeId : undefined,
    }))
  }

  const resetGraph = () => {
    setState(defaultState)
  }

  return {
    state,
    selectedNode,
    actions: {
      setMode,
      setDirectedEdges,
      addNode,
      selectNode,
      updateNodeLabel,
      deleteNode,
      addEdge,
      deleteEdge,
      setRootNodeId,
      resetGraph,
    },
  }
}
