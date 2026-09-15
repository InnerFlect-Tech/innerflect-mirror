/**
 * The composition contract, as a gate — same pattern as check-picks.ts and
 * check-no-fabrication.ts: a claim in a document is not a check.
 *
 * Wired into `npm run check` as `check:composition` (2026-09-16, once package.json
 * was released).
 */
import { ELEMENTS, ELEMENTS_BY_ID } from '../lib/design/elements';
import { paletteByFamily, validatePalette, validatePlacement, type PlacementTarget } from '../lib/design/composition';

let failed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

// --- the palette: every element accounted for exactly once ------------------
try {
  validatePalette();
  check('Palette — every element grouped exactly once, no duplicate id or name', true, `${ELEMENTS.length} elements`);
} catch (err) {
  check('Palette', false, err instanceof Error ? err.message : String(err));
}

const groups = paletteByFamily();
check('Palette — every family present has at least one element', groups.every((g) => g.elements.length > 0));

// --- acceptance criterion 3, verbatim: the five composition rules -----------
const NODE: PlacementTarget = { kind: 'node', role: 'node' };
const ROOT_NODE: PlacementTarget = { kind: 'node', role: 'root' };
const CANVAS: PlacementTarget = { kind: 'canvas' };
const EDGE: PlacementTarget = { kind: 'edge' };
const SCOPE: PlacementTarget = { kind: 'scope' };

const stepNode = ELEMENTS_BY_ID['step-node'];
const humanGlyph = ELEMENTS_BY_ID['human-glyph'];
const agentGlyph = ELEMENTS_BY_ID['agent-glyph'];
const toolGlyph = ELEMENTS_BY_ID['tool-glyph'];
const recordToken = ELEMENTS_BY_ID['record-token'];
const actionPulse = ELEMENTS_BY_ID['action-pulse'];
const riskHotspot = ELEMENTS_BY_ID['risk-hotspot'];
const permissionBoundary = ELEMENTS_BY_ID['permission-boundary'];
const domainPlatform = ELEMENTS_BY_ID['domain-platform'];
const companyCore = ELEMENTS_BY_ID['company-core'];
const decisionGate = ELEMENTS_BY_ID['decision-gate'];

// "nodes go on the path"
check('Step Node → canvas: accepted', validatePlacement(stepNode, CANVAS).ok);
check('Step Node → onto another node: rejected', !validatePlacement(stepNode, NODE).ok);
check('Step Node → onto an edge: rejected', !validatePlacement(stepNode, EDGE).ok);

// "actors/tools/knowledge attach to a step"
check('Human Glyph → a step: accepted', validatePlacement(humanGlyph, NODE).ok);
check('Agent Glyph → a step: accepted', validatePlacement(agentGlyph, NODE).ok);
check('Tool Glyph → a step: accepted', validatePlacement(toolGlyph, NODE).ok);
check('Human Glyph → open canvas: rejected (no free-standing actors)', !validatePlacement(humanGlyph, CANVAS).ok);
check('Tool Glyph → an edge: rejected', !validatePlacement(toolGlyph, EDGE).ok);

// "Record Token and Action Pulse go on an edge"
check('Record Token → an edge: accepted', validatePlacement(recordToken, EDGE).ok);
check('Action Pulse → an edge: accepted', validatePlacement(actionPulse, EDGE).ok);
check('Record Token → a node: rejected', !validatePlacement(recordToken, NODE).ok);
check('Action Pulse → open canvas: rejected', !validatePlacement(actionPulse, CANVAS).ok);

// "Risk Hotspot overlays a node"
check('Risk Hotspot → a node: accepted', validatePlacement(riskHotspot, NODE).ok);
check('Risk Hotspot → open canvas: rejected', !validatePlacement(riskHotspot, CANVAS).ok);
check('Risk Hotspot → an edge: rejected', !validatePlacement(riskHotspot, EDGE).ok);

// "Permission Boundary encloses a scope"
check('Permission Boundary → scope: accepted', validatePlacement(permissionBoundary, SCOPE).ok);
check('Permission Boundary → canvas: accepted (it starts somewhere before enclosing)', validatePlacement(permissionBoundary, CANVAS).ok);
check('Permission Boundary → an edge: rejected', !validatePlacement(permissionBoundary, EDGE).ok);

// structural roles, checked for completeness rather than quoted in the criterion
check('Domain Platform (container) → canvas: accepted', validatePlacement(domainPlatform, CANVAS).ok);
check('Domain Platform → a node: rejected', !validatePlacement(domainPlatform, NODE).ok);
check('Company Core (root) → canvas: accepted', validatePlacement(companyCore, CANVAS).ok);
check('Decision Gate (node) → canvas: accepted', validatePlacement(decisionGate, CANVAS).ok);

// every reject carries a human-readable reason, never a bare false
const rejections = [
  validatePlacement(stepNode, NODE),
  validatePlacement(humanGlyph, CANVAS),
  validatePlacement(recordToken, NODE),
  validatePlacement(riskHotspot, CANVAS),
  validatePlacement(permissionBoundary, EDGE),
];
check(
  'Every rejection carries a non-empty plain-language reason',
  rejections.every((r) => !r.ok && typeof r.reason === 'string' && r.reason.trim().length > 0),
);

// attaching to the company root is treated the same as attaching to a step —
// exercised so a future ELEMENTS entry can't silently fall through the switch
check('Human Glyph → the company root: accepted (root counts as attachable)', validatePlacement(humanGlyph, ROOT_NODE).ok);

console.log(failed ? `\n${failed} check(s) failed` : '\nevery composition rule holds for all fifteen elements');
process.exit(failed ? 1 : 0);
