import { ELEMENTS, ELEMENTS_BY_ID, type CompositionRole, type ElementDef, type ElementFamily } from './elements';

/**
 * The composition contract for `/design/lab` (WORLD_ELEMENTS.md request 13).
 *
 * `ElementDef.composition` already says what each glyph is allowed to be —
 * a root, a container, a node on the path, an attachment, a connector, a
 * token that rides an edge, an overlay on a node, or a scope around a
 * region. That field existed before this file and was never read by
 * anything: the lab needs exactly this rule, so it is enforced here rather
 * than re-invented as free-form drag/drop.
 *
 * Nothing here renders anything or owns any state. `validatePlacement()` is
 * a pure function: given the element being placed and what it is being
 * placed onto, it returns either `{ ok: true }` or a plain-language reason a
 * person (not a stack trace) can read. The 2D and 3D lab projections both
 * call this before accepting a drop; neither re-derives the rule.
 */

/** What a drop target actually is. A canvas drop has no target object. */
export type PlacementTarget =
  | { kind: 'canvas' }
  | { kind: 'node'; role: CompositionRole }
  | { kind: 'edge' }
  | { kind: 'scope' };

export type PlacementResult = { ok: true } | { ok: false; reason: string };

const ROLE_NOUN: Record<CompositionRole, string> = {
  root: 'the company root',
  container: 'a domain container',
  node: 'a step on the path',
  attachment: 'an attachment',
  connector: 'a connector',
  'edge-token': 'a token riding an edge',
  'node-overlay': 'an overlay on a node',
  scope: 'an enclosing scope',
};

/**
 * The one rule this file exists to enforce, stated once so every case below
 * is a consequence of it rather than an independent guess:
 *
 *   nodes go on the path; actors/tools/knowledge attach to a step;
 *   Record Token and Action Pulse ride an edge; Risk Hotspot overlays a
 *   node; Permission Boundary encloses a scope.
 *
 * (WORLD_ELEMENTS.md, request 13, acceptance criterion 3 — quoted, not
 * paraphrased, so this file and that document cannot quietly disagree.)
 */
export function validatePlacement(element: ElementDef, target: PlacementTarget): PlacementResult {
  const reject = (reason: string): PlacementResult => ({ ok: false, reason });

  switch (element.composition) {
    case 'root':
      // The company core. Exactly one, and it is the canvas's own origin —
      // it is not something a person drags in, but reject cleanly rather
      // than silently accept a nonsensical drop if one is ever attempted.
      if (target.kind !== 'canvas') {
        return reject(`${element.name} is the company root and cannot attach to ${ROLE_NOUN[target.kind === 'node' ? target.role : 'node']}.`);
      }
      return { ok: true };

    case 'container':
      // A domain platform. Lives on the open canvas; it does not attach to
      // another node, ride an edge, or overlay anything.
      if (target.kind !== 'canvas') {
        return reject(`${element.name} is a domain container and belongs on the open canvas, not attached to another element.`);
      }
      return { ok: true };

    case 'node':
      // A step on the path (Step Node, Decision Gate, Verification Marker,
      // Outcome Marker). Placed on the canvas or inside a container's
      // boundary — never onto another node, an edge, or as an overlay.
      if (target.kind === 'edge') {
        return reject(`${element.name} is a step on the path and cannot ride an edge — that's what Record Token and Action Pulse are for.`);
      }
      if (target.kind === 'node') {
        return reject(`${element.name} is a step on its own; it cannot attach to another step. Place it on the path instead.`);
      }
      return { ok: true };

    case 'attachment':
      // Actors and tools/knowledge. Must attach to a step; dropping one on
      // open canvas or an edge is exactly the "free-standing sculpture"
      // V2.1 retired (docs/DECISIONS.md, 2026-09-14).
      if (target.kind !== 'node') {
        // Names the rule, not two examples of it. The rule is role-based —
        // any `node` accepts an attachment — so listing "a Step Node or
        // Decision Gate" read as exhaustive while Outcome Marker and
        // Verification Marker also qualify. Once the lab started highlighting
        // every valid target during a drag, that message visibly contradicted
        // what the canvas was showing.
        return reject(`${element.name} attaches to a step and cannot stand on its own — drop it onto any step on the path.`);
      }
      if (target.role !== 'node' && target.role !== 'root') {
        return reject(`${element.name} attaches to a step, not to ${ROLE_NOUN[target.role]}.`);
      }
      return { ok: true };

    case 'connector':
      // The workflow line itself. Drawn between two ports, not dropped from
      // the palette onto a target — reject any drop attempt with the real
      // reason rather than a generic one.
      return reject(`${element.name} is drawn by connecting two steps' ports, not dropped from the palette.`);

    case 'edge-token':
      // Record Token, Action Pulse. Ride an edge; never a node or the open
      // canvas.
      if (target.kind !== 'edge') {
        return reject(`${element.name} travels on a connection between steps — drop it on an edge, not ${target.kind === 'node' ? ROLE_NOUN[target.role] : 'the open canvas'}.`);
      }
      return { ok: true };

    case 'node-overlay':
      // Risk Hotspot. Overlays an existing node; it is not a free node and
      // does not ride an edge.
      if (target.kind !== 'node') {
        return reject(`${element.name} overlays a step that already exists — it needs a node to sit on, not ${target.kind === 'edge' ? 'an edge' : 'open canvas'}.`);
      }
      return { ok: true };

    case 'scope':
      // Permission Boundary. Encloses a region, not a single node — the
      // caller is expected to resize/reposition after the drop, so the
      // only thing rejected here is dropping it onto an edge or a token.
      if (target.kind === 'edge') {
        return reject(`${element.name} encloses a scope around one or more steps; it cannot be dropped onto an edge.`);
      }
      return { ok: true };
  }
}

/** One palette entry, grouped for the lab's element tray. */
export type PaletteGroup = {
  family: ElementFamily;
  elements: readonly ElementDef[];
};

const FAMILY_ORDER: readonly ElementFamily[] = [
  'structure',
  'flow',
  'actor',
  'attachment',
  'control',
  'signal',
  'terminal',
];

/**
 * The lab's palette, generated from `ELEMENTS` and grouped by family — never
 * a hand-maintained second list (acceptance criterion 2). Family order is
 * fixed so the palette does not reshuffle between sessions; within a family,
 * `ELEMENTS`' own authored order is kept.
 */
export function paletteByFamily(): readonly PaletteGroup[] {
  const groups = new Map<ElementFamily, ElementDef[]>();
  for (const el of ELEMENTS) {
    const bucket = groups.get(el.family);
    if (bucket) bucket.push(el);
    else groups.set(el.family, [el]);
  }
  return FAMILY_ORDER.filter((f) => groups.has(f)).map((family) => ({
    family,
    elements: groups.get(family)!,
  }));
}

/**
 * Fails loudly if the palette would ever duplicate an id, a name, or silently
 * drop an element the registry defines — the "does not duplicate ids, labels,
 * colours or icons" half of acceptance criterion 2. Colour is not checked
 * here: colour comes from state, not from the element, so a palette entry
 * has no colour of its own to duplicate.
 */
export function validatePalette(): true {
  const groups = paletteByFamily();
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  let total = 0;

  for (const group of groups) {
    for (const el of group.elements) {
      if (seenIds.has(el.id)) throw new Error(`Palette duplicate id: ${el.id}`);
      seenIds.add(el.id);
      if (seenNames.has(el.name)) throw new Error(`Palette duplicate name: ${el.name}`);
      seenNames.add(el.name);
      total += 1;
    }
  }
  if (total !== ELEMENTS.length) {
    throw new Error(`Palette drift: ${total} entries grouped, ${ELEMENTS.length} in ELEMENTS`);
  }
  for (const el of ELEMENTS) {
    if (!seenIds.has(el.id)) throw new Error(`Palette missing element: ${el.id} (${ELEMENTS_BY_ID[el.id]?.name})`);
  }
  return true;
}
