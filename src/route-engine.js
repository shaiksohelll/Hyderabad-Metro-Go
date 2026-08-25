import { DATA_VERSION, lineName, lineOrders, lines, stations, transferConnections } from './data.js';

function nodeId(lineId, stationId) {
  return `${lineId}:${stationId}`;
}

function parseNode(id) {
  const [lineId, stationId] = id.split(':');
  return { lineId, stationId };
}

function edgeBase(type, from, to, extra = {}) {
  return {
    id: `${type}:${from}:${to}`,
    type,
    from,
    to,
    status: 'official-static-topology',
    durationStatus: 'unavailable',
    accessibility: 'unknown',
    ...extra,
  };
}

export function buildGraph() {
  const graph = new Map();
  Object.entries(lineOrders).forEach(([lineId, order]) => {
    order.forEach((stationId, index) => {
      const node = nodeId(lineId, stationId);
      if (!graph.has(node)) graph.set(node, []);
      const neighbors = [];
      if (index > 0) neighbors.push(edgeBase('ride', node, nodeId(lineId, order[index - 1]), { lineId, direction: 'toward-start', cost: 1 }));
      if (index < order.length - 1) neighbors.push(edgeBase('ride', node, nodeId(lineId, order[index + 1]), { lineId, direction: 'toward-end', cost: 1 }));
      graph.get(node).push(...neighbors);
    });
  });

  transferConnections.forEach((connection) => {
    const left = nodeId(connection.fromLine, connection.fromStation);
    const right = nodeId(connection.toLine, connection.toStation);
    const transfer = (from, to) => edgeBase('transfer', from, to, {
      stationId: connection.transferStationId,
      crossStation: connection.crossStation || false,
      fromStationId: connection.fromStationId,
      toStationId: connection.toStationId,
      cost: 1,
      transferStatus: connection.provenance.status,
      provenance: connection.provenance,
      notes: connection.provenance.notes,
    });
    graph.get(left)?.push(transfer(left, right));
    graph.get(right)?.push(transfer(right, left));
  });

  graph.forEach((edges) => edges.sort((a, b) => a.id.localeCompare(b.id)));
  return graph;
}

function compareCost(a, b) {
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] < b[index]) return -1;
    if (a[index] > b[index]) return 1;
  }
  return 0;
}

function routeSignature(edges) {
  return edges.map((edge) => edge.id).join('|');
}

function routeCost(edges, objective) {
  const transfers = edges.filter((edge) => edge.type === 'transfer').length;
  const rides = edges.filter((edge) => edge.type === 'ride').length;
  const walking = transfers;
  const signature = routeSignature(edges);
  if (objective === 'fewest-changes') return [transfers, rides, walking, signature];
  return [rides + transfers, transfers, walking, signature];
}

function search(graph, starts, destinations, objective, blockedEdgeIds = new Set(), penalties = new Set()) {
  const queue = starts.map((start) => ({ node: start, edges: [], cost: routeCost([], objective) }));
  const best = new Map();
  starts.forEach((start) => best.set(start, queue.find((item) => item.node === start).cost));
  let found = null;

  while (queue.length) {
    queue.sort((a, b) => compareCost(a.cost, b.cost));
    const current = queue.shift();
    if (destinations.has(current.node)) {
      found = current;
      break;
    }
    const outgoing = graph.get(current.node) || [];
    outgoing.forEach((edge) => {
      if (blockedEdgeIds.has(edge.id)) return;
      const edges = [...current.edges, edge];
      const penalty = penalties.has(edge.id) ? 1 : 0;
      const cost = routeCost(edges, objective);
      cost[0] += penalty;
      const existing = best.get(edge.to);
      if (!existing || compareCost(cost, existing) < 0) {
        best.set(edge.to, cost);
        queue.push({ node: edge.to, edges, cost });
      }
    });
  }
  return found;
}

function buildLegs(edges) {
  const legs = [];
  let current = null;
  edges.forEach((edge) => {
    if (edge.type === 'transfer') return;
    const { lineId, stationId: fromStation } = parseNode(edge.from);
    const { stationId: toStation } = parseNode(edge.to);
    if (!current || current.lineId !== lineId) {
      current = { lineId, lineName: lineName(lineId), stationIds: [fromStation, toStation], edgeIds: [edge.id], direction: edge.direction };
      legs.push(current);
    } else {
      current.stationIds.push(toStation);
      current.edgeIds.push(edge.id);
    }
  });
  return legs;
}

function directionTerminal(lineId, direction) {
  const order = lineOrders[lineId];
  return stations[direction === 'toward-end' ? order[order.length - 1] : order[0]].name;
}

function buildSteps(edges, originStationId) {
  const steps = [{ type: 'start', stationId: originStationId, status: 'official-static-topology', text: `Start at ${stations[originStationId].name}.` }];
  let previousLine = null;
  edges.forEach((edge, index) => {
    const from = parseNode(edge.from);
    const to = parseNode(edge.to);
    if (edge.type === 'transfer') {
      const isCrossStation = edge.crossStation;
      const transferText = isCrossStation
        ? `Transfer between ${stations[from.stationId].name} and ${stations[to.stationId].name}.`
        : `Change from ${lineName(from.lineId)} to ${lineName(to.lineId)} at ${stations[from.stationId].name}.`;
      const transferNote = isCrossStation
        ? 'Walking path and transfer duration are unavailable.'
        : 'Transfer path and duration are unavailable.';
      steps.push({ type: 'change', stationId: from.stationId, toStationId: isCrossStation ? to.stationId : undefined, fromLine: lineName(from.lineId), toLine: lineName(to.lineId), edgeId: edge.id, status: edge.transferStatus || 'official-static-topology', crossStation: isCrossStation || false, text: transferText, note: transferNote });
      previousLine = null;
      return;
    }
    if (previousLine !== from.lineId) {
      steps.push({ type: 'ride', stationId: from.stationId, lineId: from.lineId, lineName: lineName(from.lineId), direction: edge.direction, terminal: directionTerminal(from.lineId, edge.direction), edgeId: edge.id, status: edge.status, text: `Take ${lineName(from.lineId)} toward ${directionTerminal(from.lineId, edge.direction)}.` });

      previousLine = from.lineId;
    }
    if (index === edges.length - 1) steps.push({ type: 'arrive', stationId: to.stationId, lineId: to.lineId, status: edge.status, text: `Arrive at ${stations[to.stationId].name}.` });
  });
  return steps;
}

function findStartNodes(stationId) {
  return Object.keys(lines).filter((lineId) => lineOrders[lineId].includes(stationId)).map((lineId) => nodeId(lineId, stationId));
}

export function planJourney({ originStationId, destinationStationId, objective = 'topology', blockedEdgeIds = [] }) {
  if (!stations[originStationId] || !stations[destinationStationId]) return { status: 'invalid', message: 'Select valid origin and destination stations.' };
  if (originStationId === destinationStationId) return { status: 'invalid', message: 'Choose two different stations to plan a journey.' };
  const graph = buildGraph();
  const starts = findStartNodes(originStationId);
  const destinations = new Set(findStartNodes(destinationStationId));
  const safeObjective = objective === 'fewest-changes' ? 'fewest-changes' : 'topology';
  const found = search(graph, starts, destinations, safeObjective, new Set(blockedEdgeIds));
  if (!found) return { status: 'unreachable', message: 'No route is available in this static network snapshot.' };

  const primary = makeResult(found.edges, safeObjective, originStationId, destinationStationId);
  const alternatives = [];
  const seen = new Set([routeSignature(found.edges)]);
  found.edges.forEach((edge) => {
      const candidate = search(graph, starts, destinations, safeObjective, new Set(blockedEdgeIds), new Set([edge.id]));
    if (candidate && !seen.has(routeSignature(candidate.edges))) {
      seen.add(routeSignature(candidate.edges));
      alternatives.push(makeResult(candidate.edges, safeObjective, originStationId, destinationStationId));
    }
  });
  return { status: 'success', route: primary, alternatives: alternatives.slice(0, 2), networkVersion: DATA_VERSION };
}

function makeResult(edges, objective, originStationId, destinationStationId) {
  const transfers = edges.filter((edge) => edge.type === 'transfer').length;
  const rideEdges = edges.filter((edge) => edge.type === 'ride').length;
  const route = {
    id: `route:${originStationId}:${destinationStationId}:${routeSignature(edges)}`,
    originStationId,
    destinationStationId,
    objective,
    legs: buildLegs(edges),
    steps: buildSteps(edges, originStationId),
    edges,
    transfers,
    pendingTransferVerification: edges.filter((edge) => edge.type === 'transfer' && edge.transferStatus === 'pending-verification').length,
    crossStationTransfers: edges.filter((edge) => edge.type === 'transfer' && edge.crossStation).length,
    rideSegments: rideEdges,
    totalDuration: { value: null, status: 'unavailable', label: 'Timing unavailable' },
    walkingDuration: { value: null, status: 'unavailable', label: 'Transfer movement unavailable' },
    fare: { value: null, status: 'unavailable', label: 'Exact fare unavailable' },
    confidence: 'official static topology; accessibility data and operational timing unavailable',
    freshness: 'official static topology; operational data unavailable',
    explanation: objective === 'fewest-changes'
      ? 'Ordered by fewest explicit line changes, then ride segments. Transfer movement is pending verification.'
      : 'Timing is unavailable; ordered by the best available static topology proxy. Transfer paths remain pending verification.',
  };
  return route;
}
