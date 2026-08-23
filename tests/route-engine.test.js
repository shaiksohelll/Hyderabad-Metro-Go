import test from "node:test";
import assert from "node:assert/strict";
import { getGraphDiagnostics, planRoute } from "../src/domain/route-engine.js";

test("network keeps Parade Ground and JBS Parade Ground as separate stations", () => {
  const diagnostics = getGraphDiagnostics();
  assert.equal(diagnostics.stationCount, 57);
  assert.equal(diagnostics.nodeCount, 59);
});

test("Red Line end-to-end route is direct", () => {
  const route = planRoute("miyapur", "lb-nagar");
  assert.ok(route);
  assert.equal(route.stopCount, 26);
  assert.equal(route.transferCount, 0);
});

test("Blue Line end-to-end route is direct", () => {
  const route = planRoute("nagole", "raidurg");
  assert.ok(route);
  assert.equal(route.stopCount, 22);
  assert.equal(route.transferCount, 0);
});

test("Red-to-Blue journey changes at Ameerpet", () => {
  const route = planRoute("miyapur", "raidurg");
  assert.ok(route);
  assert.equal(route.transferCount, 1);
  assert.ok(route.transferLabels.includes("Ameerpet"));
});

test("Blue-to-Green transfer uses the connected station pair", () => {
  const route = planRoute("parade-ground", "jbs-parade-ground");
  assert.ok(route);
  assert.equal(route.stopCount, 0);
  assert.equal(route.transferCount, 1);
  assert.ok(route.transferLabels.some((label) => label.includes("Parade Ground")));
});

test("same-station journey is rejected", () => {
  assert.equal(planRoute("ameerpet", "ameerpet"), null);
});
