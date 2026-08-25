import { displayName, lineOrders, lines, transferConnections } from './data.js';

export const VIEWBOX = { width: 1280, height: 720, padding: 72 };
const redIndex = (stationId) => lineOrders.red.indexOf(stationId);
const blueIndex = (stationId) => lineOrders.blue.indexOf(stationId);
const redPoint = (index) => index <= 10 ? [120 + index * 47, 350] : [590 + (index - 10) * 37.5, 350];
const bluePoint = (index) => [590, 90 + index * 20];
const greenPoint = (index) => {
  const start = [1000, 90];
  const end = redPoint(redIndex('mg-bus-station'));
  const ratio = index / (lineOrders.green.length - 1);
  return [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio];
};

const labelIndices = {
  en: { red: new Set([0, 10, 24]), blue: new Set([0, 8, 13, 22]), green: new Set([0, 8]) },
  te: { red: new Set(), blue: new Set(), green: new Set() },
};
const patternByLine = { solid: '', dash: '16 10', dot: '3 10' };

export function mapPointFor(lineId, stationId) {
  const index = lineOrders[lineId]?.indexOf(stationId) ?? -1;
  if (index < 0) return null;
  if (lineId === 'red') return redPoint(index);
  if (lineId === 'blue') return bluePoint(index);
  return greenPoint(index);
}

function stationLabel(stationId, locale = 'en') {
  return displayName(stationId, locale);
}

function linePath(lineId) {
  return lineOrders[lineId].map((stationId) => mapPointFor(lineId, stationId).join(',')).join(' ');
}

function labelPlacement(lineId, index, [x, y]) {
  if (lineId === 'red') return { x, y: y + (index % 4 < 2 ? -19 : 35), anchor: 'middle' };
  if (lineId === 'blue') return { x: x + 17, y: y + 5, anchor: 'start' };
  if (index === 8) return { x: x - 17, y: y - 5, anchor: 'end' };
  return { x: x - 17, y: y + (index % 2 ? 23 : 5), anchor: 'end' };
}

export function mapStationPoints() {
  return Object.entries(lineOrders).flatMap(([lineId, order]) => order.map((stationId) => ({ lineId, stationId, point: mapPointFor(lineId, stationId) })));
}

export function renderMap({ highlightedIds = [], selectedStationId = null, locale = 'en' } = {}) {
  const highlighted = new Set(highlightedIds);
  const parts = [`<svg class="network-map" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" role="img" aria-labelledby="map-title map-desc">`, '<title id="map-title">Hyderabad Metro schematic network map</title>', '<desc id="map-desc">Line geometry is derived from the official network map. Line codes and dash patterns distinguish Red (R), Blue (B), and Green (G). Ameerpet: Red/Blue interchange. MG Bus Station: Red/Green interchange. Parade Ground (Blue) and JBS Parade Ground (Green) form a connected interchange complex; they are separate stations linked by a transfer connector.</desc>', '<g class="map-legend" aria-label="Line legend">'];
  Object.entries(lines).forEach(([lineId, line], index) => {
    const legendX = VIEWBOX.padding;
    const y = 90 + index * 32;
    parts.push(`<line x1="${legendX}" y1="${y}" x2="${legendX + 42}" y2="${y}" stroke="${line.color}" stroke-width="7" stroke-dasharray="${patternByLine[line.pattern]}" />`);
    parts.push(`<text x="${legendX + 54}" y="${y + 5}" class="map-legend-label">${escapeXml(line.code)} · ${escapeXml(line.name)}</text>`);
  });
  parts.push('</g>');
  const labelsForLocale = labelIndices[locale] || labelIndices.en;
  Object.entries(lineOrders).forEach(([lineId, order]) => {
    const line = lines[lineId];
    parts.push(`<polyline data-line-code="${escapeXml(line.code)}" points="${linePath(lineId)}" fill="none" stroke="${line.color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${patternByLine[line.pattern]}" />`);
    order.forEach((stationId, index) => {
      const point = mapPointFor(lineId, stationId);
      const [x, y] = point;
      const active = highlighted.has(stationId);
      const selected = selectedStationId === stationId;
      const shared = stationId === 'ameerpet' || stationId === 'mg-bus-station' || stationId === 'parade-ground' || stationId === 'jbs-parade-ground';
      parts.push(`<circle data-line-id="${lineId}" data-station-id="${stationId}" cx="${x}" cy="${y}" r="${active || selected || shared ? 11 : 7}" fill="#fff" stroke="${line.color}" stroke-width="${active || selected || shared ? 5 : 3}" />`);
      if (labelsForLocale[lineId].has(index)) {
        const placement = labelPlacement(lineId, index, point);
        parts.push(`<text x="${placement.x}" y="${placement.y}" text-anchor="${placement.anchor}" class="map-label">${escapeXml(stationLabel(stationId, locale))}</text>`);
      }
    });
  });
  const pgPoint = mapPointFor('blue', 'parade-ground');
  const jbsPoint = mapPointFor('green', 'jbs-parade-ground');
  if (pgPoint && jbsPoint) {
    parts.push(`<line class="transfer-connector" x1="${pgPoint[0]}" y1="${pgPoint[1]}" x2="${jbsPoint[0]}" y2="${jbsPoint[1]}" stroke="#666" stroke-width="3" stroke-dasharray="6 4" opacity="0.7" />`);    parts.push(`<text x="${(pgPoint[0] + jbsPoint[0]) / 2 + 12}" y="${(pgPoint[1] + jbsPoint[1]) / 2}" class="transfer-label" font-size="9" fill="#666">⇆</text>`);
  }
  parts.push('</svg>');
  return parts.join('');
}

function escapeXml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export function textMapAlternative(locale = 'en') {
  const lineDescriptions = Object.entries(lineOrders).map(([lineId, order]) => `<p><strong>${escapeXml(lines[lineId].name)} (${lines[lineId].code})</strong>: ${order.map((stationId) => escapeXml(stationLabel(stationId, locale))).join(' \u2192 ')}</p>`).join('');
  const interchangeDescriptions = '<p><strong>Interchanges</strong>: Ameerpet (Red \u2194 Blue); MG Bus Station (Red \u2194 Green); Parade Ground (Blue) \u2194 JBS Parade Ground (Green) \u2014 connected interchange complex, walking path and duration unavailable.</p>';
  return lineDescriptions + interchangeDescriptions;
}

export function routeStationIds(route) {
  if (!route) return [];
  return [...new Set(route.edges.flatMap((edge) => [edge.from.split(':')[1], edge.to.split(':')[1]]))];
}
