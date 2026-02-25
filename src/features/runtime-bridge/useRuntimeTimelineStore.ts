import { useReducer } from 'react'
import type { RuntimeBridgeState, RuntimeEvent, RuntimeStatus } from './types'

type RuntimeTimelineAction =
  | { type: 'setStatus'; status: RuntimeStatus }
  | { type: 'appendEvent'; event: RuntimeEvent }
  | { type: 'setError'; error?: string }
  | { type: 'setTimeLimit'; timeLimitMs: number }
  | { type: 'markStarted'; startedAt: number }
  | { type: 'markEnded'; endedAt: number }
  | { type: 'reset' }

const initialRuntimeBridgeState: RuntimeBridgeState = {
  status: 'idle',
  events: [],
  timeLimitMs: 3000,
}

function reducer(
  state: RuntimeBridgeState,
  action: RuntimeTimelineAction,
): RuntimeBridgeState {
  switch (action.type) {
    case 'setStatus':
      return {
        ...state,
        status: action.status,
      }
    case 'appendEvent':
      return {
        ...state,
        events: [...state.events, action.event],
      }
    case 'setError':
      return {
        ...state,
        error: action.error,
      }
    case 'setTimeLimit':
      return {
        ...state,
        timeLimitMs: action.timeLimitMs,
      }
    case 'markStarted':
      return {
        ...state,
        startedAt: action.startedAt,
        endedAt: undefined,
      }
    case 'markEnded':
      return {
        ...state,
        endedAt: action.endedAt,
      }
    case 'reset':
      return {
        ...initialRuntimeBridgeState,
        timeLimitMs: state.timeLimitMs,
      }
    default:
      return state
  }
}

export function useRuntimeTimelineStore() {
  const [state, dispatch] = useReducer(reducer, initialRuntimeBridgeState)

  return {
    state,
    dispatch,
  }
}
