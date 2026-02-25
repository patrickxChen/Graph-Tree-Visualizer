import type { GraphEditorState } from '../graph-editor/types'

export type AlgorithmTemplate = {
  id: string
  name: string
  description: string
  code: string
}

export type GraphPreset = {
  id: string
  name: string
  description: string
  graph: GraphEditorState
}

const dfsCode = `function dfs(node, graph, visited = new Set()) {
  if (!node || visited.has(node.id)) {
    return;
  }

  pushFrame('dfs', { node: node.id, visitedCount: visited.size });
  visited.add(node.id);
  setLocals({ node: node.id, visitedCount: visited.size });
  visit(node.id);

  for (const next of graph.getNeighbors(node.id)) {
    highlightEdge(node.id, next.id);
    dfs(next, graph, visited);
  }

  popFrame();
}

dfs(graph.getRoot(), graph);`

const bfsCode = `function bfs(start, graph) {
  if (!start) {
    return;
  }

  const queue = [start];
  const visited = new Set([start.id]);
  pushFrame('bfs', { start: start.id, queueSize: queue.length });

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) {
      continue;
    }

    setLocals({ node: node.id, queueSize: queue.length, visitedCount: visited.size });
    visit(node.id);

    for (const next of graph.getNeighbors(node.id)) {
      if (visited.has(next.id)) {
        continue;
      }

      visited.add(next.id);
      queue.push(next);
      highlightEdge(node.id, next.id);
      setLocals({ node: node.id, queueSize: queue.length, visitedCount: visited.size });
    }
  }

  popFrame();
}

bfs(graph.getRoot(), graph);`

const preorderCode = `function preorder(node, graph, visited = new Set()) {
  if (!node || visited.has(node.id)) {
    return;
  }

  pushFrame('preorder', { node: node.id, visitedCount: visited.size });
  visited.add(node.id);
  setLocals({ node: node.id, visitedCount: visited.size });
  visit(node.id);

  const children = graph
    .getNeighbors(node.id)
    .filter((next) => !visited.has(next.id));

  for (const child of children) {
    highlightEdge(node.id, child.id);
    preorder(child, graph, visited);
  }

  popFrame();
}

preorder(graph.getRoot(), graph);`

export const algorithmTemplates: AlgorithmTemplate[] = [
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    description: 'Recursive traversal for graph/tree structures.',
    code: dfsCode,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    description: 'Queue-based level traversal.',
    code: bfsCode,
  },
  {
    id: 'preorder',
    name: 'Preorder Traversal',
    description: 'Root-first traversal for trees.',
    code: preorderCode,
  },
]

export const graphPresets: GraphPreset[] = [
  {
    id: 'undirected-small',
    name: 'Undirected Demo Graph',
    description: 'Small connected graph for DFS/BFS demos.',
    graph: {
      mode: 'graph',
      directedEdges: false,
      selectedNodeId: 'n1',
      nodes: [
        { id: 'n1', label: 'A', x: 180, y: 160 },
        { id: 'n2', label: 'B', x: 360, y: 120 },
        { id: 'n3', label: 'C', x: 520, y: 230 },
        { id: 'n4', label: 'D', x: 360, y: 360 },
        { id: 'n5', label: 'E', x: 170, y: 330 },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', directed: false },
        { id: 'e2', source: 'n2', target: 'n3', directed: false },
        { id: 'e3', source: 'n3', target: 'n4', directed: false },
        { id: 'e4', source: 'n4', target: 'n5', directed: false },
        { id: 'e5', source: 'n5', target: 'n1', directed: false },
        { id: 'e6', source: 'n2', target: 'n4', directed: false },
      ],
    },
  },
  {
    id: 'directed-dag',
    name: 'Directed DAG',
    description: 'Directed acyclic graph for traversal flow checks.',
    graph: {
      mode: 'graph',
      directedEdges: true,
      selectedNodeId: 'n1',
      nodes: [
        { id: 'n1', label: 'S', x: 140, y: 200 },
        { id: 'n2', label: 'A', x: 320, y: 120 },
        { id: 'n3', label: 'B', x: 320, y: 290 },
        { id: 'n4', label: 'C', x: 520, y: 120 },
        { id: 'n5', label: 'D', x: 520, y: 290 },
        { id: 'n6', label: 'T', x: 720, y: 205 },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', directed: true },
        { id: 'e2', source: 'n1', target: 'n3', directed: true },
        { id: 'e3', source: 'n2', target: 'n4', directed: true },
        { id: 'e4', source: 'n3', target: 'n5', directed: true },
        { id: 'e5', source: 'n4', target: 'n6', directed: true },
        { id: 'e6', source: 'n5', target: 'n6', directed: true },
      ],
    },
  },
  {
    id: 'tree-balanced',
    name: 'Balanced Tree',
    description: 'Binary-like tree for preorder traversal.',
    graph: {
      mode: 'tree',
      directedEdges: true,
      selectedNodeId: 'n1',
      rootNodeId: 'n1',
      nodes: [
        { id: 'n1', label: 'R', x: 420, y: 80 },
        { id: 'n2', label: 'L', x: 260, y: 200 },
        { id: 'n3', label: 'M', x: 580, y: 200 },
        { id: 'n4', label: 'L1', x: 180, y: 340 },
        { id: 'n5', label: 'L2', x: 340, y: 340 },
        { id: 'n6', label: 'R1', x: 500, y: 340 },
        { id: 'n7', label: 'R2', x: 660, y: 340 },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', directed: true },
        { id: 'e2', source: 'n1', target: 'n3', directed: true },
        { id: 'e3', source: 'n2', target: 'n4', directed: true },
        { id: 'e4', source: 'n2', target: 'n5', directed: true },
        { id: 'e5', source: 'n3', target: 'n6', directed: true },
        { id: 'e6', source: 'n3', target: 'n7', directed: true },
      ],
    },
  },
]