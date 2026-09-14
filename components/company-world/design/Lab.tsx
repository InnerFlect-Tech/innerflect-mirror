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
import styles from './Lab.module.css';

const STATES: readonly SceneState[] = ['neutral', 'active', 'attention', 'critical'];

/** What a lab node carries beyond position. Draft-only: see `DRAFT_PREFIX`. */
type LabNodeData = {
  elementId: string;
  state: SceneState;
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
const NODE_W = 132;
const NODE_H = 47;
let seq = 0;
const draftId = (elementId: string) => `${DRAFT_PREFIX}${elementId}:${++seq}`;

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
        <b>Unknown element</b>
        <small>{data.elementId}</small>
      </div>
    );
  }
  const c = colorFor(element, data.state);
  return (
    <div
      className={styles.node}
      data-selected={selected || undefined}
      style={{ '--edge': c.edge, '--label': c.label, '--surface': c.surface } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className={styles.port} />
      <b>{element.name}</b>
      <small>{element.takesState ? data.state : 'never recoloured'}</small>
      <Handle type="source" position={Position.Right} className={styles.port} />
    </div>
  );
}

const nodeTypes = { element: ElementNode };

/** The seed graph — a minimal, obviously-draft path, not a company. */
function seedGraph(): { nodes: LabNode[]; edges: Edge[] } {
  const mk = (elementId: string, x: number, y: number): LabNode => ({
    id: draftId(elementId),
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

  const selected = nodes.find((n) => n.selected) ?? null;
  const selectedElement = selected
    ? ELEMENTS_BY_ID[selected.data.elementId as keyof typeof ELEMENTS_BY_ID]
    : null;

  /**
   * One placement path for both input methods. The pointer drops onto a target
   * and the keyboard button adds to the canvas; both end here, so a rule can
   * never apply to the mouse and not the keyboard.
   */
  const place = useCallback(
    (element: ElementDef, target: PlacementTarget, at: { x: number; y: number }) => {
      const verdict = validatePlacement(element, target);
      if (!verdict.ok) {
        setRejection(verdict.reason);
        return false;
      }
      setRejection('');
      snapshot();
      setNodes((current) => [
        ...current,
        {
          id: draftId(element.id),
          type: 'element',
          position: at,
          width: NODE_W,
          height: NODE_H,
          data: { elementId: element.id, state: 'neutral' },
        },
      ]);
      return true;
    },
    [setNodes, snapshot],
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
      const at = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      // What was under the cursor decides the target kind, so the same drop can
      // be legal on a node and illegal on empty canvas.
      const over = (event.target as HTMLElement).closest('[data-id]');
      const overNode = over ? nodes.find((n) => n.id === over.getAttribute('data-id')) : undefined;
      const overElement = overNode
        ? ELEMENTS_BY_ID[overNode.data.elementId as keyof typeof ELEMENTS_BY_ID]
        : undefined;
      place(
        element,
        overElement ? { kind: 'node', role: overElement.composition } : { kind: 'canvas' },
        at,
      );
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
                onDragStart={(e) => e.dataTransfer.setData('application/element-id', el.id)}
                onClick={() => place(el, { kind: 'canvas' }, { x: 120 + Math.random() * 260, y: 240 })}
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
        <ReactFlow<LabNode, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setFlow}
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

        <div className={styles.toolbar}>
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
