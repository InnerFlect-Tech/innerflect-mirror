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
  REPOSITORY_SCOPE,
  type EcosystemCategoryId,
  type EcosystemNode,
  type EcosystemNodeId,
  type EcosystemPageGroupId,
} from '@/lib/design/ecosystem';
import styles from './EcosystemBoard.module.css';

type ViewMode = 'map' | 'pages' | 'sync';
type CategoryFilter = EcosystemCategoryId | 'all';
type Point = { x: number; y: number };
type DragState = { x: number; y: number; pan: Point };

const CANVAS = { width: 2280, height: 1180 };
const CARD_WIDTH = 292;
const CARD_HEIGHT = 164;
const INITIAL_POSITIONS = Object.fromEntries(
  ECOSYSTEM_NODES.map((node) => [node.id, node.position]),
) as Record<EcosystemNodeId, Point>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function NodeMark({ kind }: { kind: EcosystemNode['kind'] }) {
  return <span className={styles.nodeMark} data-kind={kind} aria-hidden="true" />;
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

export function EcosystemBoard() {
  const [view, setView] = useState<ViewMode>('map');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<EcosystemNodeId>('mirror');
  const [zoom, setZoom] = useState(0.64);
  const [pan, setPan] = useState<Point>({ x: 18, y: 18 });
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [arranged, setArranged] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Nothing changed');

  const drag = useRef<DragState | null>(null);
  const selected = ECOSYSTEM_NODES_BY_ID[selectedId];
  const selectedPages = useMemo(
    () => ECOSYSTEM_PAGES.filter((page) => page.surface === selectedId),
    [selectedId],
  );

  const visibleNodes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ECOSYSTEM_NODES.filter((node) => {
      const matchesCategory = category === 'all' || node.category === category;
      const searchable = [node.name, node.summary, node.detail, node.kind].join(' ').toLowerCase();
      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );
  const visibleRelations = useMemo(
    () =>
      ECOSYSTEM_RELATIONS.filter(
        (relation) => visibleIds.has(relation.from) && visibleIds.has(relation.to),
      ),
    [visibleIds],
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

  const arrangeBoard = useCallback(() => {
    const next = { ...positions };
    ECOSYSTEM_NODES.forEach((node, index) => {
      next[node.id] = {
        x: 42 + (index % 4) * 548,
        y: 38 + Math.floor(index / 4) * 216,
      };
    });
    setPositions(next);
    setArranged(true);
    setCopyStatus('Draft layout changed');
  }, [positions]);

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
              <div className={styles.mapActions}>
                <button type="button" onClick={() => setZoom((value) => clamp(value - 0.08, 0.42, 1.15))} aria-label="Zoom out">−</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((value) => clamp(value + 0.08, 0.42, 1.15))} aria-label="Zoom in">+</button>
                <button type="button" onClick={fitBoard}>Fit</button>
                <button type="button" onClick={arrangeBoard} aria-pressed={arranged}>Arrange</button>
                <button type="button" onClick={copyProposal}>Copy proposal</button>
                <button type="button" onClick={resetBoard}>Reset</button>
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
                <svg
                  className={styles.relations}
                  viewBox={'0 0 ' + CANVAS.width + ' ' + CANVAS.height}
                  aria-hidden="true"
                >
                  <defs>
                    <marker id="ecosystem-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" />
                    </marker>
                  </defs>
                  {visibleRelations.map((relation) => {
                    const from = positions[relation.from];
                    const to = positions[relation.to];
                    return (
                      <path
                        key={relation.id}
                        d={'M ' + (from.x + CARD_WIDTH / 2) + ' ' + (from.y + CARD_HEIGHT / 2) + ' L ' + (to.x + CARD_WIDTH / 2) + ' ' + (to.y + CARD_HEIGHT / 2)}
                        markerEnd="url(#ecosystem-arrow)"
                        className={styles.relation}
                      />
                    );
                  })}
                </svg>
                {visibleNodes.map((node) => {
                  const position = positions[node.id];
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={styles.card}
                      data-selected={selectedId === node.id}
                      data-state={node.state}
                      style={{ left: position.x, top: position.y }}
                      onClick={() => setSelectedId(node.id)}
                    >
                      <span className={styles.cardTopline}>
                        <NodeMark kind={node.kind} />
                        <span>{node.category}</span>
                        <StateBadge state={node.state} />
                      </span>
                      <strong>{node.name}</strong>
                      <span className={styles.cardSummary}>{node.summary}</span>
                      <span className={styles.cardId}>{node.id}</span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.mapHint}>drag to pan · wheel or +/- to zoom · click a card to inspect</div>
            </div>
          </div>

          <aside className={styles.inspector} aria-live="polite">
            <span className={styles.eyebrow}>Selected concept</span>
            <div className={styles.inspectorTitle}>
              <NodeMark kind={selected.kind} />
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.summary}</p>
              </div>
            </div>
            <dl className={styles.facts}>
              <div><dt>Stable id</dt><dd>{selected.id}</dd></div>
              <div><dt>Kind</dt><dd>{selected.kind}</dd></div>
              <div><dt>State</dt><dd><StateBadge state={selected.state} /></dd></div>
              <div><dt>Authority</dt><dd>{selected.source.authority}</dd></div>
            </dl>
            <p className={styles.detail}>{selected.detail}</p>
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
