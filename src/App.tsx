import { useMemo, useState } from 'react'
import { CodeEditorPanel } from './components/CodeEditorPanel'
import { GraphEditorPanel, useGraphEditorState } from './features/graph-editor'
import { algorithmTemplates, graphPresets } from './features/mvp-content'
import type { RuntimeCallFrame } from './features/runtime-bridge'
import { useRuntimeBridge } from './features/runtime-bridge'
import { WorkspaceLayout } from './components/WorkspaceLayout'

function App() {
  const defaultTemplateId = 'dfs'
  const defaultPresetId = 'undirected-small'
  const [selectedTemplateId, setSelectedTemplateId] = useState('dfs')
  const [selectedPresetId, setSelectedPresetId] = useState('undirected-small')
  const [algorithmCode, setAlgorithmCode] = useState(
    algorithmTemplates[0]?.code ?? '',
  )
  const graphEditor = useGraphEditorState()
  const runtimeBridge = useRuntimeBridge()

  const resolvedCode = algorithmCode

  const templateOptions = useMemo(
    () =>
      algorithmTemplates.map((template) => ({
        id: template.id,
        name: template.name,
      })),
    [],
  )

  const presetOptions = useMemo(
    () =>
      graphPresets.map((preset) => ({
        id: preset.id,
        name: preset.name,
      })),
    [],
  )

  const handleRun = () => {
    runtimeBridge.execute({
      code: resolvedCode,
      graph: graphEditor.state,
    })
  }

  const handleTemplateChange = (templateId: string) => {
    const template = algorithmTemplates.find((item) => item.id === templateId)
    if (!template) {
      return
    }

    setSelectedTemplateId(templateId)
    setAlgorithmCode(template.code)
    runtimeBridge.resetTimeline()
    runtimeBridge.resetPlayback()
  }

  const handlePresetChange = (presetId: string) => {
    const preset = graphPresets.find((item) => item.id === presetId)
    if (!preset) {
      return
    }

    setSelectedPresetId(presetId)
    graphEditor.actions.loadGraph(preset.graph)
    runtimeBridge.resetTimeline()
    runtimeBridge.resetPlayback()
  }

  const handleLoadDemo = () => {
    const demoTemplate = algorithmTemplates.find(
      (item) => item.id === defaultTemplateId,
    )
    const demoPreset = graphPresets.find((item) => item.id === defaultPresetId)

    if (!demoTemplate || !demoPreset) {
      return
    }

    setSelectedTemplateId(defaultTemplateId)
    setSelectedPresetId(defaultPresetId)
    setAlgorithmCode(demoTemplate.code)
    graphEditor.actions.loadGraph(demoPreset.graph)
    runtimeBridge.resetTimeline()
    runtimeBridge.resetPlayback()
  }

  const inspectorState = useMemo(() => {
    let highlightedNodeId: string | undefined
    let highlightedEdge: { sourceId: string; targetId: string } | undefined
    const frameStack: RuntimeCallFrame[] = []

    for (const event of runtimeBridge.syncedEvents) {
      if (event.type === 'visit' && event.nodeId) {
        highlightedNodeId = event.nodeId
      }

      if (event.type === 'highlight-edge' && event.sourceId && event.targetId) {
        highlightedEdge = {
          sourceId: event.sourceId,
          targetId: event.targetId,
        }
      }

      if (event.type === 'frame-enter' && event.frameId) {
        frameStack.push({
          id: event.frameId,
          name: event.frameName || 'anonymous',
          locals: event.locals || {},
        })
      }

      if (event.type === 'locals-update' && event.frameId) {
        const frame = frameStack.find((entry) => entry.id === event.frameId)
        if (frame) {
          frame.locals = event.locals || {}
        }
      }

      if (event.type === 'frame-exit' && event.frameId) {
        const index = frameStack.findIndex((entry) => entry.id === event.frameId)
        if (index >= 0) {
          frameStack.splice(index, 1)
        }
      }
    }

    return {
      highlightedNodeId,
      highlightedEdge,
      callFrames: frameStack,
    }
  }, [runtimeBridge.syncedEvents])

  return (
    <WorkspaceLayout
      leftPane={
        <CodeEditorPanel
          code={resolvedCode}
          onCodeChange={setAlgorithmCode}
          runtimeState={runtimeBridge.state}
          onLoadDemo={handleLoadDemo}
          templateOptions={templateOptions}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={handleTemplateChange}
          presetOptions={presetOptions}
          selectedPresetId={selectedPresetId}
          onPresetChange={handlePresetChange}
          onRun={handleRun}
          onStop={runtimeBridge.stop}
          onResetTimeline={runtimeBridge.resetTimeline}
          onTimeLimitChange={runtimeBridge.setTimeLimitMs}
        />
      }
      rightPane={
        <GraphEditorPanel
          state={graphEditor.state}
          actions={graphEditor.actions}
          runtimeStatus={runtimeBridge.state.status}
          currentStepIndex={runtimeBridge.currentStepIndex}
          totalSteps={runtimeBridge.state.events.length}
          isPlaybackRunning={runtimeBridge.isPlaybackRunning}
          callFrames={inspectorState.callFrames}
          syncedEvents={runtimeBridge.syncedEvents}
          highlightedNodeId={inspectorState.highlightedNodeId}
          highlightedEdge={inspectorState.highlightedEdge}
          onRunPlayback={runtimeBridge.runPlayback}
          onPausePlayback={runtimeBridge.pausePlayback}
          onStepPlayback={runtimeBridge.stepPlayback}
          onResetPlayback={runtimeBridge.resetPlayback}
        />
      }
    />
  )
}

export default App
