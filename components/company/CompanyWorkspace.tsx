'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, Pause, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Domain } from '@/lib/model/domain';
import { toWorldDomain } from '@/lib/model/domain';
import type { RecordRef } from '@/lib/model/record';
import { stateColors } from '@/lib/tokens/state';
import type { decisions as Decisions } from '@/data/company';
import { decisionQueue } from '@/data/decisions-queue';
import { exceptions } from '@/data/exceptions';
import { PracticalTable } from './PracticalTable';
import { DomainInspector } from './DomainInspector';
import { NeedsYou } from './NeedsYou';
import { ActivityLog } from './ActivityLog';
import { activity } from '@/data/activity';
import { listPickableRecords } from '@/components/company-world/assets/pickableRecords';
import { worldRecords } from '@/data/world-records';
import { useCockpitStore } from '@/lib/store/cockpit';

/**
 * Resolves a picked `RecordRef` against the collection its type actually lives
 * in — request 10's ask, so a click on a gate pylon or an agent names the
 * record it is, not just the island it sits on. `domain` stays the mechanism
 * that drives camera focus and the domain-controls row; this is additive.
 */
function resolvePicked(domains: Domain[], ref: RecordRef | null): { ref: RecordRef; label: string } | null {
  if (!ref) return null;
  switch (ref.type) {
    case 'domain': {
      const d = domains.find((x) => x.id === ref.id);
      return d ? { ref, label: d.label } : null;
    }
    case 'workflow': {
      for (const d of domains) {
        const w = d.workflows.find((x) => x.id === ref.id);
        if (w) return { ref, label: w.name };
      }
      return null;
    }
    case 'agent': {
      for (const d of domains) {
        const a = d.agents.find((x) => x.id === ref.id);
        if (a) return { ref, label: a.name };
      }
      return null;
    }
    case 'decision': {
      const d = decisionQueue.find((x) => x.id === ref.id);
      return d ? { ref, label: d.title } : null;
    }
    case 'exception': {
      const e = exceptions.find((x) => x.id === ref.id);
      return e ? { ref, label: e.summary } : null;
    }
    default:
      return null;
  }
}

const CompanyWorld = dynamic(
  () => import('@/components/company-world').then((m) => m.CompanyWorld),
  { ssr: false, loading: () => <div className="world-loading">Building the living model…</div> },
);

/**
 * The client island. Everything that needs interactivity lives here and nowhere
 * else — the rail, top bar, hero and impact panel around it are server
 * components that ship no JavaScript.
 *
 * `impact` arrives as a slot so a server component can render inside this
 * client subtree without being pulled across the boundary.
 */
export function CompanyWorkspace({
  domains,
  decisions,
  decisionsWaiting,
  eventsObserved,
  impact,
}: {
  domains: Domain[];
  decisions: typeof Decisions;
  decisionsWaiting: number;
  eventsObserved: number;
  impact: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const activeModules = useCockpitStore((state) => state.activeModules);
  const selectedView = useCockpitStore((state) => state.view);
  const setView = useCockpitStore((state) => state.setView);
  const visibleDomains = useMemo(() => domains.filter((domain) => activeModules[domain.id] !== false), [domains, activeModules]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pickedRef, setPickedRef] = useState<RecordRef | null>(null);
  const [running, setRunning] = useState(true);
  const [toast, setToast] = useState('');

  // Nothing is focused on arrival: a healthy company shows the whole world.
  // The inspector falls back to whatever most needs a human.
  const needsMost =
    domains.find((d) => d.state === 'critical') ??
    domains.find((d) => d.state === 'attention') ??
    domains[0];
  const selected = visibleDomains.find((d) => d.id === focusedId) ?? visibleDomains[0] ?? needsMost;
  // The exact record a click resolved to, if any — a decision, an exception,
  // an agent or a workflow — distinct from `selected`, which is always the
  // domain the camera is framing. See WORLD_ELEMENTS.md request 10.
  const picked = useMemo(() => resolvePicked(domains, pickedRef), [domains, pickedRef]);

  const notify = useCallback((message: string) => setToast(message), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2300);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Passed straight through as `onSelect` to `<CompanyWorld>`. A 3D click fires
  // `onSelectRecord` immediately before this (see `DomainIsland`'s click
  // handler), so this must never clear `pickedRef` — doing so would erase the
  // very pick this same click just made.
  const toggleFocus = useCallback(
    (id: string) => setFocusedId((current) => (current === id ? null : id)),
    [],
  );

  // For the controls that pick a domain directly rather than through the 3D
  // world — the domain-controls pills, the practical table, the activity log —
  // no record was resolved, so any earlier pylon/agent pick is now stale.
  const focusDomainOnly = useCallback((id: string) => {
    toggleFocus(id);
    setPickedRef(null);
  }, [toggleFocus]);

  // Every record the world actually draws an object for, per domain, as plain
  // data — see `listPickableRecords`. Derived from the same `worldRecords` maps
  // `Scene` hands the islands, so the HTML list below and the 3D scene cannot
  // disagree about which records exist.
  const pickable = useMemo(
    () => visibleDomains.map((d) => ({ domain: d, records: listPickableRecords(d, worldRecords) })),
    [visibleDomains],
  );

  // The keyboard equivalent of clicking a pylon, agent or hotspot. `DomainIsland`
  // fires `onSelectRecord` and then `onSelect` on a 3D click, so a record pick
  // always ends up framing its own domain; this lands in that same state rather
  // than a second one only the keyboard can reach. Unlike `focusDomainOnly` it
  // sets focus instead of toggling it — re-activating a record must not unframe
  // the domain the record lives on.
  const selectRecord = useCallback((domainId: string, target: RecordRef) => {
    setPickedRef(target);
    setFocusedId(domainId);
  }, []);

  return (
    <>
      <section className="command-deck">
        <div className="deck-head">
          <div>
            <span className="eyebrow">Live company floor</span>
            <h2>{selectedView === 'mirror' ? 'See who is working on what' : 'Current operating state'}</h2>
          </div>
          <div className="deck-controls">
            <fieldset className="segmented">
              <legend className="sr-only">View</legend>
              <button
                type="button"
                aria-pressed={selectedView === 'mirror'}
                className={selectedView === 'mirror' ? 'active' : ''}
                onClick={() => setView('mirror')}
              >
                Visual
              </button>
              <button
                type="button"
                aria-pressed={selectedView === 'practical'}
                className={selectedView === 'practical' ? 'active' : ''}
                onClick={() => setView('practical')}
              >
                Practical
              </button>
            </fieldset>
            <button
              type="button"
              className="pause"
              onClick={() => {
                setRunning(!running);
                notify(running ? 'Company view paused' : 'Company view resumed');
              }}
            >
              {running ? <Pause size={13} /> : <Play size={13} />} {running ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {selectedView === 'mirror' ? (
          <div className="floor three-floor">
            {!isMobile && (
              <CompanyWorld
                domains={visibleDomains.map(toWorldDomain)}
                selectedId={focusedId}
                onSelect={toggleFocus}
                onSelectRecord={setPickedRef}
                running={running}
              />
            )}
            <div className="world-hud">
              <span className="hud-state">
                <i aria-hidden="true" />
                {running ? `Live model · ${eventsObserved} events observed` : 'Observation paused'}
              </span>
              <span>
                {focusedId ? 'Select again to see the whole company' : 'Move to inspect · Select a domain to focus'}
              </span>
            </div>
            <fieldset className="domain-controls">
              <legend className="sr-only">Company domains</legend>
              {visibleDomains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={focusedId === d.id}
                  className={focusedId === d.id ? 'active' : ''}
                  onClick={() => focusDomainOnly(d.id)}
                  aria-label={`${d.label} — ${d.mode}, ${d.autonomy}% autonomous`}
                  style={{ '--domain': stateColors[d.state].label } as React.CSSProperties}
                >
                  <i aria-hidden="true" />
                  <span><b>{d.label}</b><small>{d.mode} · {d.autonomy}%</small></span>
                </button>
              ))}
            </fieldset>
            {/* The record-level keyboard path. A pointer can click any pylon,
                agent or hotspot on any island; until this existed the only HTML
                controls were the four domain pills, so a keyboard or screen-reader
                user could reach a domain and nothing inside it (WORLD_ELEMENTS.md
                request 27, second finding). Visually hidden until something in it
                takes focus: the composed scene is the product, and fifteen more
                permanently visible buttons would be a second, worse navigation
                sitting on top of it. */}
            <fieldset className="record-controls">
              <legend className="sr-only">Records inside each domain</legend>
              {pickable.map(({ domain, records }) => (
                <fieldset key={domain.id}>
                  <legend className="sr-only">{domain.label}</legend>
                  {records.map((r) => (
                    <button
                      key={`${r.ref.type}:${r.ref.id}`}
                      type="button"
                      aria-pressed={pickedRef?.type === r.ref.type && pickedRef?.id === r.ref.id}
                      onClick={() => selectRecord(domain.id, r.ref)}
                    >
                      {domain.label} — {r.label}
                    </button>
                  ))}
                </fieldset>
              ))}
            </fieldset>
          </div>
        ) : (
          <PracticalTable
              domains={visibleDomains}
            onSelect={(id) => {
              focusDomainOnly(id);
              setView('mirror');
            }}
          />
        )}

        <ActivityLog events={activity} onSelect={focusDomainOnly} />
      </section>

      <section className="bottom-grid">
        <DomainInspector domain={selected} focused={focusedId !== null} picked={picked} onOpenAgent={(n) => notify(`${n} opened`)} />
        <NeedsYou decisions={decisions} waiting={decisionsWaiting} />
        {impact}
      </section>

      <output className="toast-region" aria-live="polite">
        {toast && <div className="toast"><Check size={14} aria-hidden="true" />{toast}</div>}
      </output>
    </>
  );
}
