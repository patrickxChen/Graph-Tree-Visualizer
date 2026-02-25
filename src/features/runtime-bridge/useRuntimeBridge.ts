import { useEffect, useMemo, useRef, useState } from 'react'
import type { GraphEditorState } from '../graph-editor/types'
import { runtimeWorkerScript } from './runtimeWorkerScript'
import type {
  RuntimeExecutionRequest,
  RuntimeWorkerExecuteMessage,
  RuntimeWorkerGraph,
  RuntimeWorkerMessage,
} from './types'
import { useRuntimeTimelineStore } from './useRuntimeTimelineStore'

const normalizeRuntimeCode = (code: string) =>
  code
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')

const buildSyntaxErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  const hints = [
    'Check for smart quotes/dashes copied from docs.',
    'Remove line numbers or non-code text from the editor.',
    'Use plain JavaScript syntax only (no TypeScript annotations).',
  ]

  return [message, ...hints].join('\n')
}

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
  const playbackTimerRef = useRef<number | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isPlaybackRunning, setIsPlaybackRunning] = useState(false)

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

  const stopPlayback = () => {
    setIsPlaybackRunning(false)

    if (playbackTimerRef.current) {
      window.clearInterval(playbackTimerRef.current)
      playbackTimerRef.current = null
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
    stopPlayback()
    setCurrentStepIndex(-1)

    const preparedCode = normalizeRuntimeCode(code)

    if (!preparedCode.trim()) {
      dispatch({ type: 'reset' })
      dispatch({ type: 'setStatus', status: 'error' })
      dispatch({ type: 'setError', error: 'Editor code is empty.' })
      dispatch({ type: 'markEnded', endedAt: Date.now() })
      return
    }

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      new AsyncFunction(
        'graph',
        'visit',
        'highlightEdge',
        'logEvent',
        'pushFrame',
        'popFrame',
        'setLocals',
        "'use strict';\n" + preparedCode,
      )
    } catch (error) {
      dispatch({ type: 'reset' })
      dispatch({ type: 'setStatus', status: 'error' })
      dispatch({ type: 'setError', error: buildSyntaxErrorMessage(error) })
      dispatch({ type: 'markEnded', endedAt: Date.now() })
      return
    }

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
        code: preparedCode,
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
    stopPlayback()
    setCurrentStepIndex(-1)
    dispatch({ type: 'reset' })
  }

  const runPlayback = () => {
    if (state.events.length === 0) {
      return
    }

    setIsPlaybackRunning(true)
  }

  const pausePlayback = () => {
    stopPlayback()
  }

  const stepPlayback = () => {
    if (state.events.length === 0) {
      return
    }

    stopPlayback()
    setCurrentStepIndex((prev) => Math.min(prev + 1, state.events.length - 1))
  }

  const resetPlayback = () => {
    stopPlayback()
    setCurrentStepIndex(-1)
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
      currentStepIndex,
      currentEvent:
        currentStepIndex >= 0 ? state.events[currentStepIndex] : undefined,
      syncedEvents:
        currentStepIndex >= 0 ? state.events.slice(0, currentStepIndex + 1) : [],
      isPlaybackRunning,
    }),
    [currentStepIndex, isPlaybackRunning, state.events, state.status],
  )

  useEffect(() => {
    if (!isPlaybackRunning) {
      return
    }

    playbackTimerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (state.events.length === 0) {
          return -1
        }

        if (prev >= state.events.length - 1) {
          if (state.status !== 'running') {
            stopPlayback()
          }

          return prev
        }

        return prev + 1
      })
    }, 450)

    return () => {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current)
        playbackTimerRef.current = null
      }
    }
  }, [isPlaybackRunning, state.events.length, state.status])

  useEffect(() => {
    if (state.events.length === 0) {
      setCurrentStepIndex(-1)
      return
    }

    setCurrentStepIndex((prev) => Math.min(prev, state.events.length - 1))
  }, [state.events.length])

  return {
    state,
    execute,
    stop,
    resetTimeline,
    setTimeLimitMs,
    runPlayback,
    pausePlayback,
    stepPlayback,
    resetPlayback,
    ...derived,
  }
}
