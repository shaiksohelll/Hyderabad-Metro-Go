import { displayName, lineOrders, lines, stations } from './data.js';

const geometry = {
  red: [[50, 52], [95, 52], [140, 52], [185, 52], [230, 52], [275, 52], [320, 52], [365, 52], [410, 52], [455, 52], [500, 52], [545, 52], [590, 52], [635, 52], [680, 52], [725, 52], [770, 52], [815, 52], [860, 52], [905, 52], [950, 52], [995, 52], [1040, 52], [1085, 52], [1130, 52], [1175, 52]],
  blue: [[500, 52], [500, 95], [500, 138], [500, 181], [500, 224], [500, 267], [500, 310], [500, 353], [500, 396], [500, 439], [500, 482], [500, 525], [500, 568], [500, 611], [500, 654], [500, 697], [500, 740], [500, 783], [500, 826], [500, 869], [500, 912], [500, 955], [500, 998], [500, 1041], [500, 1084], [500, 1127]],
  green: [[500, 52], [545, 97], [590, 142], [635, 187], [680, 232], [725, 277], [770, 322], [815, 367], [860, 412], [905, 457]],
};

function stationLabel(stationId) {
  return displayName(stationId, document.documentElement.lang === 'te' ? 'te' : 'en');
}

export function renderMap({ highlightedIds = [], selectedStationId = null } = {}) {
  const highlighted = new Set(highlightedIds);
  const parts = ['<svg class="network-map" viewBox="0 0 1230 1180" role="img" aria-labelledby="map-title map-desc">', '<title id="map-title">Hyderabad Metro schematic network map</title>', '<desc id="map-desc">Schematic Red, Blue, and Green line geometry with station labels available in the text alternative below.</desc>'];
  Object.entries(lineOrders).forEach(([lineId, order]) => {
    const points = geometry[lineId];
    const color = lines[lineId].color;
    const path = points.map(([x, y]) => `${x},${y}`).join(' ');
    parts.push(`<polyline points="${path}" fill="none" stroke="${color}" stroke-width="${highlighted.size ? 10 : 7}" stroke-linecap="round" stroke-linejoin="round" opacity="${highlighted.size ? 0.38 : 0.85}" />`);
    order.forEach((stationId, index) => {
      const [x, y] = points[index];
      const active = highlighted.has(stationId);
      const selected = selectedStationId === stationId;
      parts.push(`<circle cx="${x}" cy="${y}" r="${active || selected ? 12 : 8}" fill="#fff" stroke="${color}" stroke-width="${active || selected ? 6 : 4}" />`);
      if (active || selected || index % 4 === 0 || stationId === 'ameerpet' || stationId === 'mg-bus-station') {
        const anchor = lineId === 'blue' ? 'start' : 'middle';
        const labelX = lineId === 'blue' ? x + 18 : x;
        const labelY = lineId === 'blue' ? y + 5 : y - 16;
        parts.push(`<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" class="map-label">${stationLabel(stationId)}</text>`);
      }
    });
  });
  parts.push('</svg>');
  return parts.join('');
}

export function textMapAlternative() {
  return Object.entries(lineOrders).map(([lineId, order]) => `<p><strong>${lines[lineId].name} (${lines[lineId].code})</strong>: ${order.map((stationId) => stationLabel(stationId)).join(' → ')}</p>`).join('');
}

export function routeStationIds(route) {
  if (!route) return [];
  return [...new Set(route.edges.flatMap((edge) => [edge.from.split(':')[1], edge.to.split(':')[1]]))];
}
