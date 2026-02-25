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

### Phase 4 — MVP Algorithms + Presets
- Added built-in templates: DFS, BFS, preorder.
- Added built-in presets: undirected graph, directed DAG, balanced tree.
- Wired template + preset selectors for one-click runnable demos.

### Phase 5 — Quality + Polish (In Progress)
- Added unit tests (Vitest) for runtime timeline transitions.
- Added e2e smoke test (Playwright) for app load + selector behavior.
- Added runtime error-line highlight in the editor when stack info is available.

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

Run test suite:

```bash
npm run test
npm run test:e2e
```

## Quick working demo (website)

Use this exact flow to verify everything is running:

1. Start the app with `npm run dev`.
2. In the editor toolbar, set Template to `Depth-First Search (DFS)`.
3. Set Preset to `Undirected Demo Graph`.
4. Click `Execute`.
5. In the right pane timeline controls, click `Run` or `Step`.

Expected result:
- Node and edge highlights advance over time.
- Event log updates by step.
- Call frame panel shows traversal frame + locals.

## Troubleshooting: "Invalid or unexpected token"

This error usually means the code in the editor contains invalid JavaScript syntax.

Common causes:
- Pasted line numbers or extra text inside the code editor.
- Smart quotes (`“ ”`) or non-standard dash characters (`—`) from rich-text copy/paste.
- TypeScript-only syntax inside JS runtime code.

Fast fix:
1. Click `Reset` (runtime controls).
2. Re-select a built-in template from the Template dropdown (this reloads known-good code).
3. Click `Execute` again.

If needed, use templates directly from `src/features/mvp-content/catalog.ts` as known-safe examples.

## Project goal

I’m building AlgoLize as an MVP focused on clarity and interactive learning for graph/tree algorithms (starting with DFS/BFS-style workflows and runtime introspection).
