'use client';

import Image from 'next/image';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import {
  ECOSYSTEM_CATEGORIES,
  ECOSYSTEM_CHANGE_CONTRACT,
  ECOSYSTEM_NODES,
  ECOSYSTEM_NODES_BY_ID,
  ECOSYSTEM_RELATIONS,
  ECOSYSTEM_PAGE_GROUPS,
  ECOSYSTEM_PAGES,
  ECOSYSTEM_JOURNEYS,
  ECOSYSTEM_RELATION_FAMILIES,
  ECOSYSTEM_SHAPES,
  REPOSITORY_SCOPE,
  nodeShape,
  relationFamily,
  type EcosystemCategoryId,
  type EcosystemJourneyId,
  type EcosystemNode,
  type EcosystemNodeId,
  type EcosystemNodeShape,
  type EcosystemPageGroupId,
} from '@/lib/design/ecosystem';
import styles from './EcosystemBoard.module.css';

type ViewMode = 'map' | 'pages' | 'sync';
type CategoryFilter = EcosystemCategoryId | 'all';
type Point = { x: number; y: number };
type DragState = { x: number; y: number; pan: Point };
type NodeDragState = { id: EcosystemNodeId; x: number; y: number; origin: Point; moved: boolean };

const CANVAS = { width: 2700, height: 1100 };
const CARD_WIDTH = 292;
const CARD_HEIGHT = 164;

/**
 * The column/row pitch the registry's own positions are laid out on. `Tidy`
 * snaps dragged cards back onto it; the half-row step is what lets a short
 * column sit centred against a tall one.
 */
const GRID = { x0: 56, dx: 374 / 2, y0: 80, dy: 248 };

/** A drag that never left the pointer's starting pixel was a click. */
const DRAG_THRESHOLD = 3;
const INITIAL_POSITIONS = Object.fromEntries(
  ECOSYSTEM_NODES.map((node) => [node.id, node.position]),
) as Record<EcosystemNodeId, Point>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function NodeMark({ category }: { category: EcosystemNode['category'] }) {
  return <span className={styles.nodeMark} data-category={category} aria-hidden="true" />;
}

const PAGES_BY_SURFACE = ECOSYSTEM_PAGES.reduce<Record<string, typeof ECOSYSTEM_PAGES[number][]>>(
  (acc, page) => {
    (acc[page.surface] ??= []).push(page);
    return acc;
  },
  {},
);

/** `https://studio.innerflect.tech` → `studio.innerflect.tech`; `/mirror` stays. */
function displayHref(href: string) {
  return href.replace(/^https?:\/\//, '');
}

/**
 * The strip that makes a `surface` node read as a website rather than a box.
 * It shows the node's own first registered entry point, so the chrome is not
 * decoration — it is the address you would actually open.
 */
function Chrome({ href }: { href: string }) {
  return (
    <span className={styles.chrome} aria-hidden="true">
      <span className={styles.chromeDots}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.chromeHref}>{displayHref(href)}</span>
    </span>
  );
}

function StateBadge({ state }: { state: EcosystemNode['state'] }) {
  return (
    <span className={styles.stateBadge} data-state={state}>
      {state}
    </span>
  );
}

function groupPages(group: EcosystemPageGroupId) {
  return ECOSYSTEM_PAGES.filter((page) => page.group === group);
}

function sourceHref(path: string) {
  return 'https://github.com/InnerFlect-Tech/innerflect-mirror/blob/mirror/core-four-world/' + path;
}

/** Thumbnails are captured ahead of time by scripts/capture-ecosystem-thumbnails.ts
 * to public/ecosystem-thumbnails/<page id>.png — looked up by naming convention,
 * no registry field needed. Hidden on load failure rather than showing a broken image. */
function thumbnailSrc(pageId: string) {
  return `/ecosystem-thumbnails/${pageId}.png`;
}

function Thumbnail({ pageId, label }: { pageId: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={styles.thumbnailMissing}>
        Screenshot not yet captured for {label}
      </div>
    );
  }
  return (
    <div className={styles.thumbnailFrame}>
      <Image
        src={thumbnailSrc(pageId)}
        alt={`Screenshot of ${label}`}
        fill
        unoptimized
        sizes="320px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * `readOnly` is what lets the public index show this same map without shipping
 * the authoring tools with it.
 *
 * The board is two things at once: a picture of how the environment fits
 * together, and the instrument for changing it (drag, Tidy, Copy proposal,
 * Reset, the Pages and Sync-contract views). Only the first belongs on
 * `/ecosystem` — a visitor deciding where to start has no business proposing a
 * layout change, and `/design/ecosystem` stays `access: 'development'` for the
 * half that does.
 *
 * Read-only removes authoring, never navigation. Pan, wheel-zoom, Fit, Detail,
 * the journey filters and the inspector all stay, because a map you cannot move
 * around is a screenshot.
 */
export function EcosystemBoard({ readOnly = false }: { readOnly?: boolean } = {}) {
  const [view, setView] = useState<ViewMode>('map');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<EcosystemNodeId>('mirror');
  const [zoom, setZoom] = useState(0.64);
  const [pan, setPan] = useState<Point>({ x: 18, y: 18 });
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [arranged, setArranged] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Nothing changed');
  const [journeyId, setJourneyId] = useState<EcosystemJourneyId | null>(null);
  const [showDependencies, setShowDependencies] = useState(false);

  const drag = useRef<DragState | null>(null);
  const nodeDrag = useRef<NodeDragState | null>(null);
  /** A pointer drag ends in a click event the card must not treat as a select. */
  const consumedClick = useRef(false);
  const [draggingId, setDraggingId] = useState<EcosystemNodeId | null>(null);
  const selected = ECOSYSTEM_NODES_BY_ID[selectedId];
  const selectedPages = useMemo(
    () => ECOSYSTEM_PAGES.filter((page) => page.surface === selectedId),
    [selectedId],
  );
  const selectedShape: EcosystemNodeShape = nodeShape(selected);

  /**
   * What the selected thing is made of, one level down, and what each of those
   * parts stands on. This is the whole point of the `composed-of` / `runs-on`
   * distinction: an operating system is five layers, and each layer rests on
   * named infrastructure. Derived from relations — nothing is listed here that
   * the map does not also draw.
   */
  const composition = useMemo(() => {
    const partsOf = (id: EcosystemNodeId) =>
      ECOSYSTEM_RELATIONS.filter(
        (relation) => relation.from === id && relationFamily(relation) === 'composition',
      );
    return partsOf(selectedId).map((relation) => ({
      relation,
      node: ECOSYSTEM_NODES_BY_ID[relation.to],
      standsOn: partsOf(relation.to).map((inner) => ({
        relation: inner,
        node: ECOSYSTEM_NODES_BY_ID[inner.to],
      })),
    }));
  }, [selectedId]);

  const visibleNodes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ECOSYSTEM_NODES.filter((node) => {
      const matchesCategory = category === 'all' || node.category === category;
      const searchable = [node.name, node.summary, node.detail, node.category].join(' ').toLowerCase();
      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );
  const journey = ECOSYSTEM_JOURNEYS.find((entry) => entry.id === journeyId) ?? null;

  /** The nodes on the chosen path. Everything else dims rather than disappears. */
  const journeyIds = useMemo(
    () => (journey ? new Set<string>(journey.steps) : null),
    [journey],
  );

  /**
   * The consecutive hops of the chosen journey, drawn as its own path. A
   * journey is an ordered walk, so it is the one set of lines the registry
   * does not already hold as relations.
   */
  const journeyHops = useMemo(() => {
    if (!journey) return [];
    return journey.steps.slice(0, -1).map((from, index) => ({
      id: `${journey.id}-${index}`,
      from,
      to: journey.steps[index + 1],
    }));
  }, [journey]);

  const visibleRelations = useMemo(
    () =>
      ECOSYSTEM_RELATIONS.filter((relation) => {
        if (!visibleIds.has(relation.from) || !visibleIds.has(relation.to)) return false;
        // Structure by default; the rest is detail you ask for.
        if (relationFamily(relation) === 'dependency' && !showDependencies) return false;
        return true;
      }),
    [visibleIds, showDependencies],
  );

  const fitBoard = useCallback(() => {
    setZoom(0.64);
    setPan({ x: 18, y: 18 });
  }, []);

  const resetBoard = useCallback(() => {
    setPositions(INITIAL_POSITIONS);
    setArranged(false);
    setCopyStatus('Nothing changed');
    fitBoard();
  }, [fitBoard]);

  /**
   * Snap every card onto the grid the registry's own layout uses. The old
   * version reflowed the whole board into a four-wide block by array index,
   * which threw away the meaning of the columns; this keeps each node where
   * it was put and only squares it up.
   */
  const tidyBoard = useCallback(() => {
    const snap = (value: number, origin: number, pitch: number) =>
      origin + Math.round((value - origin) / pitch) * pitch;
    setPositions((value) =>
      Object.fromEntries(
        ECOSYSTEM_NODES.map((node) => [
          node.id,
          {
            x: clamp(snap(value[node.id].x, GRID.x0, GRID.dx), 0, CANVAS.width - CARD_WIDTH),
            y: clamp(snap(value[node.id].y, GRID.y0, GRID.dy), 0, CANVAS.height - CARD_HEIGHT),
          },
        ]),
      ) as Record<EcosystemNodeId, Point>,
    );
    setArranged(true);
    setCopyStatus('Snapped to the grid');
  }, []);

  const proposal = useMemo(
    () =>
      JSON.stringify(
        {
          type: 'ecosystem-layout-proposal',
          base: 'lib/design/ecosystem.ts',
          changes: ECOSYSTEM_NODES.filter((node) => {
            const position = positions[node.id];
            return position.x !== node.position.x || position.y !== node.position.y;
          }).map((node) => ({ id: node.id, position: positions[node.id] })),
        },
        null,
        2,
      ),
    [positions],
  );

  const copyProposal = useCallback(() => {
    const write = navigator.clipboard?.writeText(proposal);
    if (!write) {
      setCopyStatus('Copy blocked; use the browser menu');
      return;
    }
    void write
      .then(() => setCopyStatus('Proposal copied'))
      .catch(() => setCopyStatus('Copy blocked; use the browser menu'));
  }, [proposal]);

  /*
   * Dragging a card. Deltas are divided by `zoom` because the board is a
   * scaled element: at 50% a 10px pointer move is a 20px move in board space.
   * The card captures the pointer, so the pan surface underneath never sees it
   * and the board does not slide while a node is being placed.
   */
  const startNodeDrag = (event: PointerEvent<HTMLButtonElement>, id: EcosystemNodeId) => {
    if (event.button !== 0) return;
    nodeDrag.current = {
      id,
      x: event.clientX,
      y: event.clientY,
      origin: positions[id],
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveNodeDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const dragging = nodeDrag.current;
    if (!dragging) return;
    const dx = (event.clientX - dragging.x) / zoom;
    const dy = (event.clientY - dragging.y) / zoom;
    if (!dragging.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!dragging.moved) {
      dragging.moved = true;
      setDraggingId(dragging.id);
    }
    setPositions((value) => ({
      ...value,
      [dragging.id]: {
        x: Math.round(clamp(dragging.origin.x + dx, 0, CANVAS.width - CARD_WIDTH)),
        y: Math.round(clamp(dragging.origin.y + dy, 0, CANVAS.height - CARD_HEIGHT)),
      },
    }));
  };

  const endNodeDrag = () => {
    const dragging = nodeDrag.current;
    nodeDrag.current = null;
    if (!dragging?.moved) return;
    consumedClick.current = true;
    setDraggingId(null);
    setArranged(false);
    setCopyStatus('Draft layout changed');
  };

  /** Keyboard equivalent of the drag, so the board is not pointer-only. */
  const nudgeNode = (event: KeyboardEvent<HTMLButtonElement>, id: EcosystemNodeId) => {
    const step = event.shiftKey ? GRID.dy : 8;
    const delta: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    setPositions((value) => ({
      ...value,
      [id]: {
        x: clamp(value[id].x + move.x, 0, CANVAS.width - CARD_WIDTH),
        y: clamp(value[id].y + move.y, 0, CANVAS.height - CARD_HEIGHT),
      },
    }));
    setArranged(false);
    setCopyStatus('Draft layout changed');
  };

  const startPan = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, pan };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    setPan({
      x: drag.current.pan.x + event.clientX - drag.current.x,
      y: drag.current.pan.y + event.clientY - drag.current.y,
    });
  };

  const endPan = () => {
    drag.current = null;
  };

  const onWheel = (event: WheelEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setZoom((value) => clamp(value - event.deltaY * 0.0008, 0.42, 1.15));
  };

  const onPanKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const handled = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', '0'];
    if (handled.includes(event.key)) event.preventDefault();
    const step = 40;
    if (event.key === 'ArrowLeft') setPan((value) => ({ ...value, x: value.x + step }));
    if (event.key === 'ArrowRight') setPan((value) => ({ ...value, x: value.x - step }));
    if (event.key === 'ArrowUp') setPan((value) => ({ ...value, y: value.y + step }));
    if (event.key === 'ArrowDown') setPan((value) => ({ ...value, y: value.y - step }));
    if (event.key === '+' || event.key === '=') setZoom((value) => clamp(value + 0.08, 0.42, 1.15));
    if (event.key === '-' || event.key === '_') setZoom((value) => clamp(value - 0.08, 0.42, 1.15));
    if (event.key === '0') fitBoard();
  };

  return (
    <main className={styles.root}>
      {!readOnly && (
      <header className={styles.toolbar}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Innerflect environment · shared system map</span>
          <h1>Ecosystem index</h1>
          <p>{REPOSITORY_SCOPE.statement}</p>
        </div>
        <nav className={styles.viewTabs} aria-label="Ecosystem views">
          {[
            ['map', 'Map'],
            ['pages', 'Pages'],
            ['sync', 'Sync contract'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id as ViewMode)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className={styles.saveState} aria-live="polite">
          <i />
          {copyStatus}
        </div>
      </header>
      )}

      {view === 'map' && (
        <section className={styles.mapShell} aria-label="Interactive ecosystem map">
          <div className={styles.mapColumn}>
            <div className={styles.mapControls}>
              <label className={styles.search}>
                <span>Find a concept</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Mirror, Forge, agent..."
                />
              </label>
              <label className={styles.filter}>
                <span>Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CategoryFilter)}
                >
                  <option value="all">All categories</option>
                  {ECOSYSTEM_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className={styles.journeys}>
                <legend>Journey</legend>
                {ECOSYSTEM_JOURNEYS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    title={entry.summary}
                    aria-pressed={journeyId === entry.id}
                    onClick={() => setJourneyId(journeyId === entry.id ? null : entry.id)}
                  >
                    {entry.name}
                  </button>
                ))}
              </fieldset>
              <div className={styles.mapActions}>
                <button
                  type="button"
                  aria-pressed={showDependencies}
                  onClick={() => setShowDependencies((value) => !value)}
                >
                  Detail
                </button>
                <button type="button" onClick={() => setZoom((value) => clamp(value - 0.08, 0.42, 1.15))} aria-label="Zoom out">−</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((value) => clamp(value + 0.08, 0.42, 1.15))} aria-label="Zoom in">+</button>
                <button type="button" onClick={fitBoard}>Fit</button>
                {!readOnly && (
                  <>
                    <button type="button" onClick={tidyBoard} aria-pressed={arranged}>Tidy</button>
                    <button type="button" onClick={copyProposal}>Copy proposal</button>
                    <button type="button" onClick={resetBoard}>Reset</button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.viewport}>
              <button
                type="button"
                className={styles.panSurface}
                aria-label="Pan ecosystem board. Use arrow keys to move and plus or minus to zoom."
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
                onWheel={onWheel}
                onKeyDown={onPanKeyDown}
              />
              <div
                className={styles.board}
                style={{
                  width: CANVAS.width,
                  height: CANVAS.height,
                  transform: 'translate(' + pan.x + 'px, ' + pan.y + 'px) scale(' + zoom + ')',
                }}
              >
                {/* Band headers, so a column's meaning does not live only in the legend. */}
                {ECOSYSTEM_CATEGORIES.map((band, index) => (
                  <span
                    key={band.id}
                    className={styles.band}
                    title={band.description}
                    style={{ top: GRID.y0 + index * GRID.dy - 30, left: GRID.x0 }}
                  >
                    {band.name}
                  </span>
                ))}
                <svg
                  className={styles.relations}
                  viewBox={'0 0 ' + CANVAS.width + ' ' + CANVAS.height}
                  aria-hidden="true"
                >
                  <defs>
                    {[...ECOSYSTEM_RELATION_FAMILIES.map((f) => f.id), 'journeyPath'].map((family) => (
                      <marker
                        key={family}
                        id={`ecosystem-arrow-${family}`}
                        className={styles.arrow}
                        data-family={family}
                        markerWidth="8"
                        markerHeight="8"
                        refX="7"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M0,0 L8,4 L0,8 Z" />
                      </marker>
                    ))}
                  </defs>
                  {visibleRelations.map((relation) => {
                    const from = positions[relation.from];
                    const to = positions[relation.to];
                    return (
                      <path
                        key={relation.id}
                        data-family={relationFamily(relation)}
                        markerEnd={`url(#ecosystem-arrow-${relationFamily(relation)})`}
                        d={'M ' + (from.x + CARD_WIDTH / 2) + ' ' + (from.y + CARD_HEIGHT / 2) + ' L ' + (to.x + CARD_WIDTH / 2) + ' ' + (to.y + CARD_HEIGHT / 2)}
                        className={styles.relation}
                        data-dimmed={
                          journeyIds
                            ? !(journeyIds.has(relation.from) && journeyIds.has(relation.to))
                            : undefined
                        }
                      />
                    );
                  })}
                  {journeyHops.map((hop) => {
                    const from = positions[hop.from];
                    const to = positions[hop.to];
                    return (
                      <path
                        key={hop.id}
                        className={styles.journeyPath}
                        markerEnd="url(#ecosystem-arrow-journeyPath)"
                        d={'M ' + (from.x + CARD_WIDTH / 2) + ' ' + (from.y + CARD_HEIGHT / 2) + ' L ' + (to.x + CARD_WIDTH / 2) + ' ' + (to.y + CARD_HEIGHT / 2)}
                      />
                    );
                  })}
                </svg>
                {visibleNodes.map((node) => {
                  const position = positions[node.id];
                  const shape = nodeShape(node);
                  const pages = PAGES_BY_SURFACE[node.id];
                  // Mirror owns seven pages; `/mirror` names it better than `/`.
                  const entry = pages?.find((page) => page.id === node.id) ?? pages?.[0];
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={styles.card}
                      data-selected={selectedId === node.id}
                      data-state={node.state}
                      data-shape={shape}
                      data-dragging={draggingId === node.id}
                      data-dimmed={journeyIds ? !journeyIds.has(node.id) : undefined}
                      data-step={journey ? journey.steps.indexOf(node.id) + 1 || undefined : undefined}
                      style={{ left: position.x, top: position.y }}
                      onPointerDown={readOnly ? undefined : (event) => startNodeDrag(event, node.id)}
                      onPointerMove={moveNodeDrag}
                      onPointerUp={endNodeDrag}
                      onPointerCancel={endNodeDrag}
                      onKeyDown={(event) => nudgeNode(event, node.id)}
                      onClick={() => {
                        // The click that ends a drag must not also re-select.
                        if (consumedClick.current) {
                          consumedClick.current = false;
                          return;
                        }
                        setSelectedId(node.id);
                      }}
                    >
                      {shape === 'surface' && entry && <Chrome href={entry.href} />}
                      <span className={styles.cardTopline}>
                        <NodeMark category={node.category} />
                        <span>{node.category}</span>
                        <StateBadge state={node.state} />
                      </span>
                      <strong>{node.name}</strong>
                      <span className={styles.cardSummary}>{node.summary}</span>
                      <span className={styles.cardId}>
                        {node.id}
                        {node.advised && <b className={styles.advised}>advised</b>}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.mapHint}>
                {readOnly
                  ? 'drag the background to pan · wheel to zoom · select a card to inspect it'
                  : 'drag a card to move it · drag the background to pan · wheel to zoom · Tidy snaps to the grid'}
              </div>

              <div className={styles.legend}>
                <div>
                  <span className={styles.eyebrow}>Shape = what it is</span>
                  <ul>
                    {ECOSYSTEM_SHAPES.map((entry) => (
                      <li key={entry.id} title={entry.description}>
                        <span className={styles.legendMark} data-shape={entry.id} aria-hidden="true" />
                        {entry.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className={styles.eyebrow}>Line = how they relate</span>
                  <ul>
                    {ECOSYSTEM_RELATION_FAMILIES.map((entry) => (
                      <li key={entry.id} title={entry.description}>
                        <span className={styles.legendLine} data-family={entry.id} aria-hidden="true" />
                        {entry.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <aside className={styles.inspector} aria-live="polite">
            <span className={styles.eyebrow}>Selected concept</span>
            <div className={styles.inspectorTitle}>
              <NodeMark category={selected.category} />
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.summary}</p>
              </div>
            </div>
            <dl className={styles.facts}>
              <div><dt>Stable id</dt><dd>{selected.id}</dd></div>
              <div>
                <dt>Is a</dt>
                <dd className={styles.factShape}>
                  <span className={styles.legendMark} data-shape={selectedShape} aria-hidden="true" />
                  {ECOSYSTEM_SHAPES.find((entry) => entry.id === selectedShape)?.name}
                </dd>
              </div>
              <div><dt>State</dt><dd><StateBadge state={selected.state} /></dd></div>
              <div><dt>Authority</dt><dd>{selected.source.authority}</dd></div>
            </dl>
            <p className={styles.detail}>{selected.detail}</p>
            {selected.advised && (
              <p className={styles.advisedNote}>
                <b>Advised</b>
                {selected.advised}
              </p>
            )}
            {selectedPages.length > 0 && (
              <div className={styles.thumbnails}>
                {selectedPages.map((page) => (
                  <div key={page.id} className={styles.thumbnail}>
                    <Thumbnail pageId={page.id} label={page.name} />
                    <span className={styles.thumbnailCaption}>
                      <span>{page.name}</span>
                      <StateBadge state={page.state} />
                    </span>
                  </div>
                ))}
              </div>
            )}
            <a className={styles.source} href={sourceHref(selected.source.path)} target="_blank" rel="noreferrer">
              Open source: {selected.source.path}
            </a>
            {composition.length > 0 && (
              <div className={styles.composition}>
                <span className={styles.eyebrow}>
                  What {selected.name} is made of
                </span>
                <ol>
                  {composition.map(({ relation, node, standsOn }) => (
                    <li key={relation.id}>
                      <button type="button" onClick={() => setSelectedId(node.id)}>
                        <span
                          className={styles.legendMark}
                          data-shape={nodeShape(node)}
                          aria-hidden="true"
                        />
                        <b>{node.name}</b>
                        {node.advised && <span className={styles.advised}>advised</span>}
                        <StateBadge state={node.state} />
                      </button>
                      <span className={styles.compositionSummary}>{node.summary}</span>
                      {standsOn.length > 0 && (
                        <ul className={styles.standsOn}>
                          {standsOn.map((inner) => (
                            <li key={inner.relation.id}>
                              <i>{inner.relation.label}</i>
                              <button type="button" onClick={() => setSelectedId(inner.node.id)}>
                                {inner.node.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className={styles.relationsList}>
              <span className={styles.eyebrow}>Relations</span>
              {ECOSYSTEM_RELATIONS.filter((relation) => relation.from === selected.id || relation.to === selected.id).map((relation) => {
                const otherId = relation.from === selected.id ? relation.to : relation.from;
                return (
                  <button key={relation.id} type="button" onClick={() => setSelectedId(otherId)}>
                    <b>{relation.label}</b>
                    <span>{ECOSYSTEM_NODES_BY_ID[otherId].name}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      )}

      {view === 'pages' && (
        <section className={styles.catalogue}>
          <div className={styles.catalogueIntro}>
            <span className={styles.eyebrow}>Registered route catalogue</span>
            <h2>Every page has a place in the system.</h2>
            <p>All repository entry points are discovered from ECOSYSTEM_PAGES. A page is not live until its source file, owning surface and registry state agree.</p>
          </div>
          <div className={styles.pageGroups}>
            {ECOSYSTEM_PAGE_GROUPS.map((group) => (
              <section key={group.id} className={styles.pageGroup}>
                <div><span className={styles.eyebrow}>{group.id}</span><h3>{group.name}</h3><p>{group.description}</p></div>
                <div className={styles.pageList}>
                  {groupPages(group.id).map((page) => (
                    <a key={page.id} href={page.href} className={styles.pageRow}>
                      <span><b>{page.name}</b><small>{page.surface} · {page.access} · {page.purpose}</small></span>
                      <code>{page.href}</code>
                      <StateBadge state={page.state} />
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}

      {view === 'sync' && (
        <section className={styles.sync}>
          <div className={styles.catalogueIntro}>
            <span className={styles.eyebrow}>One source, two projections</span>
            <h2>Change the system once.</h2>
            <p>{ECOSYSTEM_CHANGE_CONTRACT.source}</p>
          </div>
          <div className={styles.syncSteps}>
            {[
              ['01', 'Draft', ECOSYSTEM_CHANGE_CONTRACT.draftOnly],
              ['02', 'Validate', 'The registry and the canonical record reject unknown ids, duplicate relations and stale revisions.'],
              ['03', 'Operate', ECOSYSTEM_CHANGE_CONTRACT.write],
              ['04', 'Record', 'The actor, reason, revision, event and observable outcome remain inspectable.'],
              ['05', 'Project', 'The board, 2D language and 3D world refresh from the same records.'],
            ].map(([number, title, body]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
          <div className={styles.forbidden}>
            <span className={styles.eyebrow}>Never canonical</span>
            <p>{ECOSYSTEM_CHANGE_CONTRACT.forbidden}</p>
          </div>
        </section>
      )}
    </main>
  );
}
