'use client';

/**
 * `/design/lab` — the grammar route.
 *
 * `/design/elements` proves the vocabulary (every element alone, in every
 * state); `/design/floor` proves reality (the production world from real
 * records). This proves **grammar**: that the elements compose — that they can
 * be placed, connected and inspected without the rules drifting away from
 * `lib/design/composition.ts` (WORLD_ELEMENTS.md request 13).
 *
 * The rules are never restated here. Every placement goes through
 * `validatePlacement()` and every palette entry comes from `paletteByFamily()`,
 * so this component cannot quietly disagree with the contract those functions
 * enforce — if it tries, the rejection reason it renders is the contract's own
 * words, not a second copy of them.
 *
 * Built on `@xyflow/react` per the decision recorded in `docs/DECISIONS.md`:
 * pan/zoom/drag/connect and — the reason that outweighed the dependency —
 * keyboard and screen-reader operation of a node graph, which criterion 7
 * requires and a hand-rolled pointer-events canvas would have to reimplement.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ELEMENTS_BY_ID, type ElementDef } from '@/lib/design/elements';
import { paletteByFamily, validatePlacement, type PlacementTarget } from '@/lib/design/composition';
import { stateColors } from '@/lib/tokens/state';
import type { SceneState } from '@/lib/model/state';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementSymbol2D } from './ElementSymbol2D';
import { LabScene3D, type Projected } from './LabScene3D';
import styles from './Lab.module.css';

const STATES: readonly SceneState[] = ['neutral', 'active', 'attention', 'critical'];

/** What a lab node carries beyond position. Draft-only: see `DRAFT_PREFIX`. */
type LabNodeData = {
  elementId: string;
  state: SceneState;
  /** Set while a palette drag is in flight and this node would accept it. */
  droppable?: boolean;
  [key: string]: unknown;
};
type LabNode = Node<LabNodeData, 'element'>;

/**
 * Criterion 8: fixtures are explicitly design-only draft records. Every id a
 * lab node carries is prefixed, so a lab id can never be mistaken for — or
 * accidentally matched against — a real record id from `data/**`.
 */
const DRAFT_PREFIX = 'draft:';
/** Matches `.node` in Lab.module.css; see `mk()` for why this is declared. */
const NODE_W = 176;
const NODE_H = 56;
/**
 * Ids for nodes a person places. Not used for the seed graph.
 *
 * A module-level counter is fine for user placements, which only ever happen on
 * the client. It is NOT fine for the seed: the server renders the seed once and
 * the client renders it again, so a counter gives the same three nodes different
 * ids on each side, React sees mismatched `data-id` attributes, and hydration
 * fails. The visible symptom was that the first click on the page did nothing —
 * every later click worked, which is what made it look like a flaky test rather
 * than the real SSR bug it was.
 */
let seq = 0;
const draftId = (elementId: string) => `${DRAFT_PREFIX}${elementId}:${++seq}`;

/**
 * First free slot on a coarse grid.
 *
 * The keyboard path has no cursor to take a position from, and placing at a
 * random x on a fixed y stacked nodes on top of each other the moment you added
 * a second one — which made the keyboard route visibly worse than the pointer
 * route for no reason. Scanning for a free cell keeps them legible.
 */
function freeSlot(taken: readonly LabNode[]): { x: number; y: number } {
  const col = NODE_W + 30;
  const row = NODE_H + 30;
  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 4; c++) {
      const x = 40 + c * col;
      const y = 250 + r * row;
      const clash = taken.some(
        (n) => Math.abs(n.position.x - x) < col - 10 && Math.abs(n.position.y - y) < row - 10,
      );
      if (!clash) return { x, y };
    }
  }
  return { x: 40, y: 250 };
}

/**
 * A node's position on the canvas, with a docked child resolved against its
 * parent. React Flow stores a child's position relative to its parent, so any
 * geometry done in canvas space has to rebase first or a docked node appears to
 * be sitting at the top-left corner of the world.
 */
function absolutePosition(nodes: readonly LabNode[], node: LabNode): { x: number; y: number } {
  const parent = node.parentId ? nodes.find((n) => n.id === node.parentId) : undefined;
  return parent
    ? { x: node.position.x + parent.position.x, y: node.position.y + parent.position.y }
    : { x: node.position.x, y: node.position.y };
}

/** How far outside a node still counts as aiming at it. */
const SNAP_PX = 26;

/**
 * The node a drop is aiming at, decided by geometry rather than by whichever
 * DOM element happened to be under the cursor.
 *
 * Hit-testing the drop target through `event.target` meant a drop had to land
 * inside a 176×56 box exactly, and every near miss came back as "drop it onto a
 * Step Node" — an instruction where the person had just expressed the intent
 * plainly enough. This contains-then-nearest test accepts the obvious aim, and
 * still returns undefined for a drop that genuinely means the open canvas.
 */
function nodeAtPoint(
  nodes: readonly LabNode[],
  at: { x: number; y: number },
): LabNode | undefined {
  let nearest: { node: LabNode; distance: number } | undefined;
  // Later nodes render on top, so walk backwards and take the first container.
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const p = absolutePosition(nodes, node);
    const w = node.width ?? NODE_W;
    const h = node.height ?? NODE_H;
    if (at.x >= p.x && at.x <= p.x + w && at.y >= p.y && at.y <= p.y + h) return node;
    const dx = Math.max(p.x - at.x, 0, at.x - (p.x + w));
    const dy = Math.max(p.y - at.y, 0, at.y - (p.y + h));
    const distance = Math.hypot(dx, dy);
    if (distance <= SNAP_PX && (!nearest || distance < nearest.distance)) {
      nearest = { node, distance };
    }
  }
  return nearest?.node;
}

/** How many attachments already dock to this node, so they stack rather than pile up. */
function attachedCount(nodes: readonly LabNode[], parentId: string): number {
  return nodes.filter((n) => n.parentId === parentId).length;
}

/** The colour an element shows in a given state. */
function colorFor(element: ElementDef, state: SceneState) {
  // Criterion 6, and rule 4 in AGENTS.md: a person is never recoloured by
  // state. This reads `takesState` rather than branching on the id, because
  // the contract forbids the renderer asking `id === 'human-glyph'`.
  return element.takesState ? stateColors[state] : stateColors.neutral;
}

function ElementNode({ data, selected }: NodeProps<LabNode>) {
  const element = ELEMENTS_BY_ID[data.elementId as keyof typeof ELEMENTS_BY_ID];
  // An id the registry does not define is a bug in whoever placed the node, not
  // something to hide. Rendering null would make the node silently vanish while
  // its edges still pointed at it — the same class of silent loss the
  // no-fabrication rule exists to prevent, so it is made loud instead.
  if (!element) {
    return (
      <div className={styles.node} data-unknown="">
        <span className={styles.meta}>
          <b>Unknown element</b>
          <small>{data.elementId}</small>
        </span>
      </div>
    );
  }
  const c = colorFor(element, data.state);
  return (
    <div
      className={styles.node}
      data-selected={selected || undefined}
      data-droppable={data.droppable ? '' : undefined}
      style={{ '--edge': c.edge, '--label': c.label, '--surface': c.surface } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className={styles.port} />
      {/* The canonical 2D projection from the SSOT — the same component
          `/design/elements` proves, not a lab-local icon. Shape identifies the
          kind (WORLD_ELEMENTS.md rule 2); only state chooses the accent, and
          `ElementSymbol2D` already applies the Human Glyph exemption itself. */}
      <ElementSymbol2D id={element.id} state={data.state} className={styles.glyph} />
      <span className={styles.meta}>
        <b>{element.name}</b>
        <small>{element.takesState ? data.state : 'never recoloured'}</small>
      </span>
      <Handle type="source" position={Position.Right} className={styles.port} />
    </div>
  );
}

const nodeTypes = { element: ElementNode };

/** The seed graph — a minimal, obviously-draft path, not a company. */
function seedGraph(): { nodes: LabNode[]; edges: Edge[] } {
  // Stable ids, identical on server and client — see `draftId` above.
  const mk = (elementId: string, x: number, y: number): LabNode => ({
    id: `${DRAFT_PREFIX}${elementId}:seed`,
    type: 'element',
    position: { x, y },
    // Explicit dimensions rather than letting the library measure. Measurement
    // goes through a ResizeObserver that does not reliably settle in headless
    // chromium — nodes keep `visibility:hidden` and `fitView` never runs, which
    // makes the route untestable by the Playwright suite. Declaring the size
    // the stylesheet already fixes costs nothing and keeps e2e possible.
    width: NODE_W,
    height: NODE_H,
    data: { elementId, state: 'neutral' },
  });
  // Ids come from `ELEMENTS` (lib/design/elements.ts) — `step-node`,
  // `decision-gate`, `outcome-marker`. A seed that names an element the
  // registry does not define renders as "Unknown element" above rather than
  // disappearing, which is how the first version of this seed was caught.
  const step = mk('step-node', 40, 120);
  const decision = mk('decision-gate', 260, 120);
  const outcome = mk('outcome-marker', 480, 120);
  return {
    nodes: [step, decision, outcome],
    edges: [
      { id: `${step.id}->${decision.id}`, source: step.id, target: decision.id },
      { id: `${decision.id}->${outcome.id}`, source: decision.id, target: outcome.id },
    ],
  };
}

export function Lab() {
  const seed = useMemo(() => seedGraph(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<LabNode>(seed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(seed.edges);
  const [rejection, setRejection] = useState('');
  // Selection lives here, not in React Flow's per-node `selected` flag: the 3D
  // projection has no React Flow to read that from, and criterion 1 requires a
  // toggle to preserve the selection. One owner, both projections.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projection, setProjection] = useState<'2d' | '3d'>('2d');
  // Which element is currently being dragged from the palette, so the canvas can
  // show what will accept it. Without this the only way to learn where an
  // attachment may go is to drop it somewhere and read the refusal.
  const [dragging, setDragging] = useState<ElementDef | null>(null);
  const isMobile = useIsMobile();
  const [flow, setFlow] = useState<ReactFlowInstance<LabNode, Edge> | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  // Undo/redo (criterion 7). A plain snapshot stack: the graph is small enough
  // that storing whole states is cheaper to reason about than a diff log, and
  // it cannot drift out of sync with the thing it is supposed to restore.
  //
  // State, not a ref, because the toolbar's disabled buttons are rendered from
  // the stack depth — and a ref read during render is exactly the bug
  // `react-compiler` refuses to let through.
  type Snapshot = { nodes: LabNode[]; edges: Edge[] };
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);

  const snapshot = useCallback(() => {
    setPast((p) => [...p, { nodes: structuredClone(nodes), edges: structuredClone(edges) }]);
    setFuture([]);
  }, [nodes, edges]);

  const step = useCallback(
    (back: boolean) => {
      const from = back ? past : future;
      if (!from.length) return;
      const target = from[from.length - 1];
      const here: Snapshot = { nodes: structuredClone(nodes), edges: structuredClone(edges) };
      if (back) {
        setFuture((f) => [...f, here]);
        setPast((p) => p.slice(0, -1));
      } else {
        setPast((p) => [...p, here]);
        setFuture((f) => f.slice(0, -1));
      }
      setNodes(target.nodes);
      setEdges(target.edges);
    },
    [past, future, nodes, edges, setNodes, setEdges],
  );

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  /**
   * Absolute canvas positions, with docked children resolved against their
   * parent. React Flow stores a child's position relative to its parent; 3D
   * has no parent transform, so the resolution happens once, here, and both
   * projections read the same numbers.
   */
  const projected: Projected[] = useMemo(
    () =>
      nodes.map((n) => {
        const parent = n.parentId ? nodes.find((p) => p.id === n.parentId) : undefined;
        return {
          id: n.id,
          elementId: n.data.elementId,
          state: n.data.state,
          x: n.position.x + (parent?.position.x ?? 0),
          y: n.position.y + (parent?.position.y ?? 0),
        };
      }),
    [nodes],
  );

  // Mobile receives the 2D projection and never creates WebGL (criterion 9).
  const showing: '2d' | '3d' = isMobile ? '2d' : projection;
  const selectedElement = selected
    ? ELEMENTS_BY_ID[selected.data.elementId as keyof typeof ELEMENTS_BY_ID]
    : null;

  /**
   * One placement path for both input methods. The pointer drops onto a target
   * and the keyboard button adds to the canvas; both end here, so a rule can
   * never apply to the mouse and not the keyboard.
   */
  const place = useCallback(
    (
      element: ElementDef,
      target: PlacementTarget,
      at: { x: number; y: number },
      parent?: LabNode,
    ) => {
      const verdict = validatePlacement(element, target);
      if (!verdict.ok) {
        setRejection(verdict.reason);
        return false;
      }
      setRejection('');
      snapshot();
      const node: LabNode = {
        id: draftId(element.id),
        type: 'element',
        // A docked node's position is relative to its parent. It is placed
        // below the step rather than at the raw drop point: dropping *onto* a
        // node rebases to roughly (0,0), which would bury the attachment under
        // the thing it attached to. Successive attachments stack downwards.
        position: parent ? { x: 16, y: NODE_H + 12 + attachedCount(nodes, parent.id) * (NODE_H + 8) } : at,
        width: NODE_W,
        height: NODE_H,
        data: { elementId: element.id, state: 'neutral' },
        ...(parent ? { parentId: parent.id } : {}),
      };
      // React Flow requires a parent to appear before its children in the array.
      setNodes((current) => [...current, node]);
      return true;
    },
    [nodes, setNodes, snapshot],
  );

  const onConnect = useCallback(
    (c: Connection) => {
      const source = nodes.find((n) => n.id === c.source);
      const element = source
        ? ELEMENTS_BY_ID[source.data.elementId as keyof typeof ELEMENTS_BY_ID]
        : undefined;
      // Criterion 4: decisions may branch; ordinary steps may not silently
      // create branches. An existing outgoing edge on a non-decision is the
      // branch this refuses to fabricate.
      if (element && element.id !== 'decision-gate' && edges.some((e) => e.source === c.source)) {
        setRejection(`${element.name} already leads somewhere. Only a Decision Gate may branch.`);
        return;
      }
      setRejection('');
      snapshot();
      setEdges((eds) => addEdge(c, eds));
    },
    [nodes, edges, setEdges, snapshot],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const id = event.dataTransfer.getData('application/element-id');
      const element = ELEMENTS_BY_ID[id as keyof typeof ELEMENTS_BY_ID];
      if (!element || !flow) return;
      setDragging(null);
      const at = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      // Geometry, not DOM hit-testing: see `nodeAtPoint`. A drop that lands on a
      // node — or obviously near one — aims at that node; anything else is the
      // open canvas.
      const overNode = nodeAtPoint(nodes, at);
      const overElement = overNode
        ? ELEMENTS_BY_ID[overNode.data.elementId as keyof typeof ELEMENTS_BY_ID]
        : undefined;
      const target: PlacementTarget = overElement
        ? { kind: 'node', role: overElement.composition }
        : { kind: 'canvas' };
      // An attachment that validated against a node should visibly belong to
      // that node, not float where the cursor happened to be. `parentId` with
      // `extent: 'parent'` makes the relationship the contract just approved
      // the same relationship you can see and drag.
      const docks =
        overNode !== undefined &&
        (element.composition === 'attachment' || element.composition === 'node-overlay');
      place(element, target, at, docks ? overNode : undefined);
    },
    [flow, nodes, place],
  );

  const setSelectedState = useCallback(
    (state: SceneState) => {
      if (!selected) return;
      snapshot();
      setNodes((current) =>
        current.map((n) => (n.id === selected.id ? { ...n, data: { ...n.data, state } } : n)),
      );
    },
    [selected, setNodes, snapshot],
  );

  const reset = useCallback(() => {
    snapshot();
    const fresh = seedGraph();
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    setRejection('');
  }, [setNodes, setEdges, snapshot]);

  const incoming = selected ? edges.filter((e) => e.target === selected.id) : [];
  const outgoing = selected ? edges.filter((e) => e.source === selected.id) : [];

  return (
    <div className={styles.lab}>
      <aside className={styles.palette}>
        <h2>Palette</h2>
        <p className={styles.hint}>
          Drag onto the canvas, or activate to place. Every drop is checked against the
          composition contract.
        </p>
        {paletteByFamily().map((group) => (
          <section key={group.family}>
            <h3>{group.family}</h3>
            {group.elements.map((el) => (
              <button
                key={el.id}
                type="button"
                draggable
                className={styles.chip}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/element-id', el.id);
                  setDragging(el);
                }}
                onDragEnd={() => setDragging(null)}
                onClick={() => place(el, { kind: 'canvas' }, freeSlot(nodes))}
                title={`${el.name} — ${el.composition}, driven by ${el.drivenBy}`}
              >
                {el.name}
                <small>{el.composition}</small>
              </button>
            ))}
          </section>
        ))}
      </aside>

      <div className={styles.canvas} ref={wrapper}>
        {showing === '3d' ? (
          <LabScene3D
            nodes={projected}
            edges={edges}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
        <ReactFlow<LabNode, Edge>
          nodes={nodes.map((n) => {
            const el = ELEMENTS_BY_ID[n.data.elementId as keyof typeof ELEMENTS_BY_ID];
            // Asked of the contract, never guessed: the highlight and the drop
            // are answered by the same function, so the canvas cannot offer a
            // target that the drop would then refuse.
            const droppable =
              dragging && el
                ? validatePlacement(dragging, { kind: 'node', role: el.composition }).ok
                : false;
            return { ...n, selected: n.id === selectedId, data: { ...n.data, droppable } };
          })}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setFlow}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onNodeDragStart={snapshot}
          fitView
          proOptions={{ hideAttribution: false }}
          aria-label="Composition canvas"
        >
          <Background gap={22} color="#16211f" />
          <Controls />
        </ReactFlow>
        )}

        <div className={styles.toolbar}>
          {/* Hidden on mobile rather than disabled: there is no 3D to switch to
              there, and a dead control invites the question of why. */}
          {!isMobile && (
            <fieldset className={styles.projection}>
              <legend className="sr-only">Projection</legend>
              {(['2d', '3d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={projection === p}
                  onClick={() => setProjection(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </fieldset>
          )}
          <button type="button" onClick={() => step(true)} disabled={past.length === 0}>
            Undo
          </button>
          <button type="button" onClick={() => step(false)} disabled={future.length === 0}>
            Redo
          </button>
          <button type="button" onClick={reset}>Reset</button>
        </div>

        {/* The contract's own refusal, shown verbatim. Announced, because a
            rejected drop is otherwise silent for a screen-reader user. */}
        <output className={styles.rejection} aria-live="polite">
          {rejection}
        </output>
      </div>

      <aside className={styles.inspector}>
        <h2>Inspector</h2>
        {!selected || !selectedElement ? (
          <p className={styles.hint}>Select an object to inspect it.</p>
        ) : (
          <dl>
            <dt>Draft id</dt><dd>{selected.id}</dd>
            <dt>Element</dt><dd>{selectedElement.name}</dd>
            <dt>Composition role</dt><dd>{selectedElement.composition}</dd>
            <dt>Driven by</dt><dd>{selectedElement.drivenBy}</dd>
            <dt>Reveals at</dt><dd>{selectedElement.revealAt}</dd>
            <dt>State</dt>
            <dd>
              {selectedElement.takesState ? (
                <span className={styles.states}>
                  {STATES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={selected.data.state === s}
                      onClick={() => setSelectedState(s)}
                    >
                      {s}
                    </button>
                  ))}
                </span>
              ) : (
                'never recoloured — a person is not a state'
              )}
            </dd>
            <dt>Incoming</dt><dd>{incoming.length}</dd>
            <dt>Outgoing</dt><dd>{outgoing.length}</dd>
          </dl>
        )}
      </aside>
    </div>
  );
}
