import { displayName, lineOrders, lines } from './data.js';

const VIEWBOX = { width: 1250, height: 760 };
const redIndex = (stationId) => lineOrders.red.indexOf(stationId);
const blueIndex = (stationId) => lineOrders.blue.indexOf(stationId);
const redPoint = (index) => [80 + index * 45, 300];
const bluePoint = (index) => [530, 300 + (index - blueIndex('ameerpet')) * 34];
const greenPoint = (index) => {
  const start = [700, 70];
  const end = [redPoint(redIndex('mg-bus-station'))[0], 300];
  const ratio = index / (lineOrders.green.length - 1);
  return [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio];
};

export function mapPointFor(lineId, stationId) {
  const index = lineOrders[lineId].indexOf(stationId);
  if (lineId === 'red') return redPoint(index);
  if (lineId === 'blue') return bluePoint(index);
  return greenPoint(index);
}

function stationLabel(stationId) {
  const locale = document.documentElement.lang === 'te' ? 'te' : 'en';
  return displayName(stationId, locale);
}

function linePath(lineId) {
  return lineOrders[lineId].map((stationId) => mapPointFor(lineId, stationId).join(',')).join(' ');
}

export function renderMap({ highlightedIds = [], selectedStationId = null } = {}) {
  const highlighted = new Set(highlightedIds);
  const parts = [`<svg class="network-map" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" role="img" aria-labelledby="map-title map-desc">`, '<title id="map-title">Hyderabad Metro schematic network map</title>', '<desc id="map-desc">Line geometry is derived from the application network model. Red and Blue connect at Ameerpet; Red and Green connect at MG Bus Station. Parade Ground and JBS Parade Ground are separate nodes until their exact transfer edge is verified.</desc>'];
  Object.entries(lineOrders).forEach(([lineId, order]) => {
    const color = lines[lineId].color;
    parts.push(`<polyline points="${linePath(lineId)}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`);
    order.forEach((stationId) => {
      const [x, y] = mapPointFor(lineId, stationId);
      const active = highlighted.has(stationId);
      const selected = selectedStationId === stationId;
      const shared = stationId === 'ameerpet' || stationId === 'mg-bus-station';
      parts.push(`<circle cx="${x}" cy="${y}" r="${active || selected || shared ? 11 : 7}" fill="#fff" stroke="${color}" stroke-width="${active || selected || shared ? 5 : 3}" />`);
      const index = order.indexOf(stationId);
      if (active || selected || shared || index % 4 === 0 || stationId === 'parade-ground' || stationId === 'jbs-parade-ground') {
        const labelX = lineId === 'blue' ? x + 16 : x;
        const labelY = lineId === 'green' ? y + 20 : y - 15;
        const anchor = lineId === 'blue' ? 'start' : 'middle';
        parts.push(`<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" class="map-label">${escapeXml(stationLabel(stationId))}</text>`);
      }
    });
  });
  parts.push('</svg>');
  return parts.join('');
}

function escapeXml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export function textMapAlternative() {
  return Object.entries(lineOrders).map(([lineId, order]) => `<p><strong>${escapeXml(lines[lineId].name)} (${lines[lineId].code})</strong>: ${order.map((stationId) => escapeXml(stationLabel(stationId))).join(' → ')}</p>`).join('');
}

export function routeStationIds(route) {
  if (!route) return [];
  return [...new Set(route.edges.flatMap((edge) => [edge.from.split(':')[1], edge.to.split(':')[1]]))];
}
