import { EXPLICIT_TRANSFERS, LINE_STATIONS, getPoint, getStation } from "../data/network.js";

const nodeId = (lineId, stationId) => `${lineId}::${stationId}`;
const parseNode = (id) => {
  const [lineId, stationId] = id.split("::");
  return { lineId, stationId };
};

const addDirectedEdge = (graph, from, edge) => {
  if (!graph.has(from)) graph.set(from, []);
  graph.get(from).push(edge);
};

const addTwoWayEdge = (graph, from, to, edge) => {
  addDirectedEdge(graph, from, { to, ...edge });
  addDirectedEdge(graph, to, { to: from, ...edge });
};

export const buildGraph = () => {
  const graph = new Map();
  const stationLines = new Map();

  Object.entries(LINE_STATIONS).forEach(([lineId, stations]) => {
    stations.forEach(([stationId]) => {
      const id = nodeId(lineId, stationId);
      if (!graph.has(id)) graph.set(id, []);
      if (!stationLines.has(stationId)) stationLines.set(stationId, []);
      stationLines.get(stationId).push(lineId);
    });

    for (let index = 0; index < stations.length - 1; index += 1) {
      const from = nodeId(lineId, stations[index][0]);
      const to = nodeId(lineId, stations[index + 1][0]);
      addTwoWayEdge(graph, from, to, {
        kind: "ride",
        lineId,
        minutes: 2.15,
        stops: 1,
      });
    }
  });

  stationLines.forEach((lineIds, stationId) => {
    if (lineIds.length < 2) return;
    for (let a = 0; a < lineIds.length; a += 1) {
      for (let b = a + 1; b < lineIds.length; b += 1) {
        addTwoWayEdge(graph, nodeId(lineIds[a], stationId), nodeId(lineIds[b], stationId), {
          kind: "transfer",
          label: getStation(stationId)?.name || stationId,
          minutes: 5,
          stops: 0,
        });
      }
    }
  });

  EXPLICIT_TRANSFERS.forEach((transfer) => {
    addTwoWayEdge(
      graph,
      nodeId(transfer.from.lineId, transfer.from.stationId),
      nodeId(transfer.to.lineId, transfer.to.stationId),
      { kind: "transfer", label: transfer.label, minutes: transfer.minutes, stops: 0 },
    );
  });

  return { graph, stationLines };
};

const scoreEdge = (edge, priority) => {
  if (edge.kind === "ride") return edge.minutes;
  return edge.minutes + (priority === "fewest" ? 16 : 3);
};

export const planRoute = (fromStationId, toStationId, priority = "fastest") => {
  if (!fromStationId || !toStationId || fromStationId === toStationId) return null;

  const { graph, stationLines } = buildGraph();
  const startLines = stationLines.get(fromStationId) || [];
  const endLines = stationLines.get(toStationId) || [];
  if (!startLines.length || !endLines.length) return null;

  const endNodes = new Set(endLines.map((lineId) => nodeId(lineId, toStationId)));
  const distance = new Map();
  const previous = new Map();
  const queue = [];

  startLines.forEach((lineId) => {
    const id = nodeId(lineId, fromStationId);
    distance.set(id, 0);
    queue.push({ id, score: 0 });
  });

  let destinationNode = null;
  while (queue.length) {
    queue.sort((a, b) => a.score - b.score);
    const current = queue.shift();
    if (current.score !== distance.get(current.id)) continue;
    if (endNodes.has(current.id)) {
      destinationNode = current.id;
      break;
    }

    (graph.get(current.id) || []).forEach((edge) => {
      const nextScore = current.score + scoreEdge(edge, priority);
      if (nextScore < (distance.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
        distance.set(edge.to, nextScore);
        previous.set(edge.to, { from: current.id, edge });
        queue.push({ id: edge.to, score: nextScore });
      }
    });
  }

  if (!destinationNode) return null;

  const nodes = [];
  const edges = [];
  let cursor = destinationNode;
  while (cursor) {
    nodes.push(cursor);
    const prev = previous.get(cursor);
    if (!prev) break;
    edges.push(prev.edge);
    cursor = prev.from;
  }
  nodes.reverse();
  edges.reverse();

  const transfers = edges.filter((edge) => edge.kind === "transfer");
  const stopCount = edges.reduce((sum, edge) => sum + (edge.stops || 0), 0);
  const estimatedMinutes = Math.max(1, Math.round(edges.reduce((sum, edge) => sum + edge.minutes, 0)));
  const steps = [];

  nodes.forEach((id, index) => {
    const node = parseNode(id);
    const station = getStation(node.stationId);
    const incoming = index > 0 ? edges[index - 1] : null;
    const existing = steps.at(-1);

    if (incoming?.kind === "transfer" && existing?.stationId === node.stationId) {
      existing.transfer = incoming.label;
      existing.continueLineId = node.lineId;
      return;
    }

    steps.push({
      stationId: node.stationId,
      stationName: station?.name || node.stationId,
      lineId: node.lineId,
      transfer: incoming?.kind === "transfer" ? incoming.label : null,
      continueLineId: node.lineId,
    });
  });

  const coordinates = nodes
    .map((id) => {
      const node = parseNode(id);
      return getPoint(node.lineId, node.stationId);
    })
    .filter(Boolean)
    .map(({ x, y }) => ({ x, y }));

  return {
    from: getStation(fromStationId),
    to: getStation(toStationId),
    priority,
    nodes,
    edges,
    steps,
    coordinates,
    stopCount,
    transferCount: transfers.length,
    transferLabels: transfers.map((edge) => edge.label),
    estimatedMinutes,
  };
};

export const getGraphDiagnostics = () => {
  const { graph, stationLines } = buildGraph();
  return {
    nodeCount: graph.size,
    stationCount: stationLines.size,
    directedEdgeCount: [...graph.values()].reduce((sum, edges) => sum + edges.length, 0),
  };
};
