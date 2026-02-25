# AlgoLize

AlgoLize is a graph/tree algorithm visualizer I built to make traversal logic easier to understand step-by-step.

The app combines:
- a code editor for writing algorithms,
- an interactive graph/tree canvas,
- and a runtime playback + inspector panel to replay execution events.

## What I built so far

### Phase 1 — Graph/Tree Editor
- Add/delete nodes by interacting with the canvas and controls.
- Add/delete edges.
- Toggle directed/undirected edges.
- Switch between graph and tree mode.
- Select a root node in tree mode.
- Persist graph state in localStorage.

### Phase 2 — Runtime Bridge
- Execute user algorithm code in an isolated Web Worker.
- Provide a restricted runtime API (`graph`, `visit`, `highlightEdge`, `logEvent`).
- Add execution controls (`Execute`, `Cancel`, `Reset`) and timeout handling.
- Stream runtime events into an in-memory timeline.

### Phase 3 — Visual Playback + Inspector
- Add timeline playback controls (`Run`, `Pause`, `Step`, `Reset`).
- Sync canvas highlighting to the current step (active node + edge).
- Add call frame inspector with locals (via `pushFrame`, `setLocals`, `popFrame`).
- Add step-synced event log.

## Tech stack
- React + TypeScript + Vite
- Tailwind CSS
- Monaco Editor (`@monaco-editor/react`)
- Web Worker sandbox for runtime execution

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project goal

I’m building AlgoLize as an MVP focused on clarity and interactive learning for graph/tree algorithms (starting with DFS/BFS-style workflows and runtime introspection).
