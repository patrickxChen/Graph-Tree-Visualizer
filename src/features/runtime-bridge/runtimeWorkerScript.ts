export const runtimeWorkerScript = String.raw`
let eventCounter = 0;

const postRuntimeEvent = (event) => {
  self.postMessage({ type: 'event', event });
};

const createEvent = (type, message, extras = {}) => ({
  id: 'auto_' + Date.now() + '_' + eventCounter++,
  timestamp: Date.now(),
  type,
  message,
  ...extras,
});

const buildGraphApi = (graphPayload) => {
  const nodeMap = new Map(graphPayload.nodes.map((node) => [node.id, node]));

  const getNeighbors = (nodeId) => {
    const neighborIds = [];

    for (const edge of graphPayload.edges) {
      if (edge.source === nodeId) {
        neighborIds.push(edge.target);
      }

      if (!edge.directed && edge.target === nodeId) {
        neighborIds.push(edge.source);
      }
    }

    return neighborIds
      .map((id) => nodeMap.get(id))
      .filter(Boolean)
      .map((node) => ({ ...node }));
  };

  return {
    getNode: (id) => {
      const node = nodeMap.get(id);
      return node ? { ...node } : null;
    },
    getNodes: () => graphPayload.nodes.map((node) => ({ ...node })),
    getRoot: () => {
      const fallback = graphPayload.nodes[0];
      const root =
        (graphPayload.rootNodeId && nodeMap.get(graphPayload.rootNodeId)) ||
        fallback;
      return root ? { ...root } : null;
    },
    getNeighbors,
  };
};

self.onmessage = async (messageEvent) => {
  const message = messageEvent.data;

  if (!message || message.type !== 'execute') {
    return;
  }

  const { code, graph } = message.payload;
  const graphApi = buildGraphApi(graph);

  const visit = (nodeId) => {
    postRuntimeEvent(
      createEvent('visit', 'Visited node ' + nodeId, { nodeId }),
    );
  };

  const highlightEdge = (sourceId, targetId) => {
    postRuntimeEvent(
      createEvent('highlight-edge', 'Traversed edge ' + sourceId + ' -> ' + targetId, {
        sourceId,
        targetId,
      }),
    );
  };

  const logEvent = (text) => {
    postRuntimeEvent(createEvent('log', String(text)));
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const executable = new AsyncFunction(
      'graph',
      'visit',
      'highlightEdge',
      'logEvent',
      '\'use strict\';\\n' + code,
    );

    await executable(graphApi, visit, highlightEdge, logEvent);
    self.postMessage({ type: 'completed' });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
`;
