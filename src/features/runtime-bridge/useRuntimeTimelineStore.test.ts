import { describe, expect, it } from 'vitest'
import type { RuntimeEvent } from './types'
import {
  initialRuntimeBridgeState,
  runtimeTimelineReducer,
} from './useRuntimeTimelineStore'

const sampleEvent: RuntimeEvent = {
  id: 'evt_1',
  timestamp: Date.now(),
  type: 'visit',
  message: 'Visited node n1',
  nodeId: 'n1',
}

describe('runtimeTimelineReducer', () => {
  it('appends runtime events in order', () => {
    const next = runtimeTimelineReducer(initialRuntimeBridgeState, {
      type: 'appendEvent',
      event: sampleEvent,
    })

    expect(next.events).toHaveLength(1)
    expect(next.events[0]).toEqual(sampleEvent)
  })

  it('preserves time limit when resetting timeline', () => {
    const withCustomLimit = runtimeTimelineReducer(initialRuntimeBridgeState, {
      type: 'setTimeLimit',
      timeLimitMs: 7000,
    })

    const reset = runtimeTimelineReducer(withCustomLimit, { type: 'reset' })

    expect(reset.timeLimitMs).toBe(7000)
    expect(reset.events).toEqual([])
    expect(reset.status).toBe('idle')
  })

  it('tracks status and runtime boundaries', () => {
    const startedAt = 1000
    const endedAt = 2000

    const running = runtimeTimelineReducer(initialRuntimeBridgeState, {
      type: 'setStatus',
      status: 'running',
    })
    const started = runtimeTimelineReducer(running, {
      type: 'markStarted',
      startedAt,
    })
    const completed = runtimeTimelineReducer(started, {
      type: 'setStatus',
      status: 'completed',
    })
    const ended = runtimeTimelineReducer(completed, {
      type: 'markEnded',
      endedAt,
    })

    expect(ended.status).toBe('completed')
    expect(ended.startedAt).toBe(startedAt)
    expect(ended.endedAt).toBe(endedAt)
  })
})