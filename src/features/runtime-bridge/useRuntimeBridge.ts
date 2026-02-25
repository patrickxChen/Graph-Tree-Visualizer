import { useMemo, useRef } from 'react'
import type { GraphEditorState } from '../graph-editor/types'
import { runtimeWorkerScript } from './runtimeWorkerScript'
import type {
  RuntimeExecutionRequest,
  RuntimeWorkerExecuteMessage,
  RuntimeWorkerGraph,
  RuntimeWorkerMessage,
} from './types'
import { useRuntimeTimelineStore } from './useRuntimeTimelineStore'

const mapGraphToWorkerPayload = (graph: GraphEditorState): RuntimeWorkerGraph => ({
  nodes: graph.nodes.map((node) => ({ id: node.id, label: node.label })),
  edges: graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    directed: edge.directed,
  })),
  rootNodeId: graph.rootNodeId,
})

export function useRuntimeBridge() {
  const { state, dispatch } = useRuntimeTimelineStore()
  const workerRef = useRef<Worker | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const cleanupExecution = () => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const stopExecution = (nextStatus: 'stopped' | 'timeout') => {
    if (state.status !== 'running') {
      return
    }

    cleanupExecution()
    dispatch({ type: 'setStatus', status: nextStatus })
    dispatch({ type: 'markEnded', endedAt: Date.now() })

    if (nextStatus === 'timeout') {
      dispatch({
        type: 'setError',
        error: `Execution timed out after ${state.timeLimitMs}ms`,
      })
    }
  }

  const execute = ({ code, graph }: RuntimeExecutionRequest) => {
    cleanupExecution()

    dispatch({ type: 'reset' })
    dispatch({ type: 'setStatus', status: 'running' })
    dispatch({ type: 'markStarted', startedAt: Date.now() })

    const workerBlob = new Blob([runtimeWorkerScript], {
      type: 'application/javascript',
    })

    const worker = new Worker(URL.createObjectURL(workerBlob))
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<RuntimeWorkerMessage>) => {
      const message = event.data

      if (message.type === 'event') {
        dispatch({ type: 'appendEvent', event: message.event })
        return
      }

      if (message.type === 'completed') {
        cleanupExecution()
        dispatch({ type: 'setStatus', status: 'completed' })
        dispatch({ type: 'markEnded', endedAt: Date.now() })
        return
      }

      if (message.type === 'error') {
        cleanupExecution()
        dispatch({ type: 'setStatus', status: 'error' })
        dispatch({ type: 'setError', error: message.error })
        dispatch({ type: 'markEnded', endedAt: Date.now() })
      }
    }

    worker.onerror = () => {
      cleanupExecution()
      dispatch({ type: 'setStatus', status: 'error' })
      dispatch({
        type: 'setError',
        error: 'Runtime worker encountered an unexpected error.',
      })
      dispatch({ type: 'markEnded', endedAt: Date.now() })
    }

    timeoutRef.current = window.setTimeout(() => {
      stopExecution('timeout')
    }, state.timeLimitMs)

    const message: RuntimeWorkerExecuteMessage = {
      type: 'execute',
      payload: {
        code,
        graph: mapGraphToWorkerPayload(graph),
      },
    }

    worker.postMessage(message)
  }

  const stop = () => {
    stopExecution('stopped')
  }

  const resetTimeline = () => {
    cleanupExecution()
    dispatch({ type: 'reset' })
  }

  const setTimeLimitMs = (next: number) => {
    const normalized = Number.isFinite(next)
      ? Math.min(Math.max(Math.round(next), 500), 20000)
      : 3000

    dispatch({ type: 'setTimeLimit', timeLimitMs: normalized })
  }

  const derived = useMemo(
    () => ({
      isRunning: state.status === 'running',
      latestEvent: state.events[state.events.length - 1],
    }),
    [state.events, state.status],
  )

  return {
    state,
    execute,
    stop,
    resetTimeline,
    setTimeLimitMs,
    ...derived,
  }
}
