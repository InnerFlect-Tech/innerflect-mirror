import Link from 'next/link';
import { PublicNav } from '@/components/company/PublicNav';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { EcosystemBoard } from '@/components/company-world/design/EcosystemBoard';
import {
  ECOSYSTEM_JOURNEYS,
  ECOSYSTEM_NODES,
  ECOSYSTEM_NODES_BY_ID,
  ECOSYSTEM_PAGES,
  ECOSYSTEM_PAGE_GROUPS,
} from '@/lib/design/ecosystem';
import styles from './ecosystem.module.css';

export const metadata = {
  title: 'Innerflect environment',
  description: 'Every product, entry point and journey across the Innerflect environment.',
};

/**
 * The public index of the whole environment.
 *
 * `/design/ecosystem` is the conformance board — it exists to prove the registry
 * is real and to inspect it. This is the other audience: someone deciding where
 * to start. It answers "what is there, what can I open, and which of these is
 * actually finished" without asking anyone to read a graph.
 *
 * Every row here comes from `lib/design/ecosystem.ts`. Nothing on this page is
 * hand-maintained, which matters more than it sounds: a public map that listed
 * its own products by hand would be the first thing to go stale, and it would
 * go stale by claiming something ships when it does not. `check:ecosystem-registry`
 * already enforces that a `live` page has a route file and a `planned` one does
 * not, so the states shown below cannot drift from what the repository contains.
 */

const ACCESS_LABEL: Record<string, string> = {
  public: 'Public',
  authenticated: 'Sign-in required',
  internal: 'Innerflect team',
  development: 'Development',
};

const STATE_LABEL: Record<string, string> = {
  live: 'Live',
  building: 'Being built',
  planned: 'Planned',
  external: 'Hosted elsewhere',
};

export default function Page() {
  const open = ECOSYSTEM_PAGES.filter(
    (page) => page.state === 'live' || page.state === 'external',
  );
  const layers = ECOSYSTEM_NODES.filter((node) => node.category === 'layers');

  return (
    <main className={styles.page} data-surface="ecosystem">
      <PublicNav current="/ecosystem" />
      <SurfaceHead
        eyebrow="Innerflect environment · every entry point"
        title="The Innerflect environment"
        pulse="Every product, entry point and journey in one index. Each state below is the one the repository can prove — a page marked live has a route in this codebase, and a planned one deliberately does not yet."
      />
      <SurfaceSummary
        stats={[
          {
            value: `${open.length}/${ECOSYSTEM_PAGES.length}`,
            // Equal today, and that is the claim worth making: nothing is
            // registered here that you cannot actually open.
            label: 'Entry points open',
            tone: open.length === ECOSYSTEM_PAGES.length ? 'good' : 'attention',
          },
          { value: String(layers.length), label: 'Operating layers' },
          { value: String(ECOSYSTEM_JOURNEYS.length), label: 'Ways through' },
          { value: String(ECOSYSTEM_NODES.length), label: 'Parts in the system' },
        ]}
      />

      {/* The same map `/design/ecosystem` draws, in read-only mode.
          Cards below list what exists; only this shows how the parts hold each
          other up — that Mirror is made of the company graph, that a Shop feeds
          the self-builder's own OS. Listing without relating was the gap this
          page shipped with. The authoring half (drag, Tidy, Copy proposal, the
          Pages and Sync-contract views) stays on the design route, which is
          `access: 'development'` for exactly that reason. */}
      <section aria-labelledby="map-heading" className={styles.map}>
        <h2 id="map-heading">How it fits together</h2>
        <p className={styles.note}>
          Every part of the environment and the relationships between them. Drag the background
          to pan, scroll to zoom, select any card to read what it is.
        </p>
        <div className={styles.mapFrame}>
          <EcosystemBoard readOnly />
        </div>
      </section>

      <section aria-labelledby="journeys-heading" className={styles.journeys}>
        <h2 id="journeys-heading">Three ways through</h2>
        <p className={styles.note}>
          A journey is not a product. It is an ordered walk through the ones that already exist.
        </p>
        <ol className={styles.journeyList}>
          {ECOSYSTEM_JOURNEYS.map((journey) => (
            <li key={journey.id}>
              <h3>{journey.name}</h3>
              <p>{journey.summary}</p>
              <ol className={styles.steps}>
                {journey.steps.map((step) => {
                  const node = ECOSYSTEM_NODES_BY_ID[step];
                  return (
                    <li key={step} data-state={node?.state}>
                      {node?.name ?? step}
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {ECOSYSTEM_PAGE_GROUPS.map((group) => {
        const pages = ECOSYSTEM_PAGES.filter((page) => page.group === group.id);
        if (pages.length === 0) return null;
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`} className={styles.group}>
            <h2 id={`group-${group.id}`}>{group.name}</h2>
            <p className={styles.note}>{group.description}</p>
            <ul className={styles.pages}>
              {pages.map((page) => {
                const external = page.href.startsWith('http');
                // Only `live` and `external` are linkable, and that is not a
                // style choice — it is the only claim the repository can back.
                // `check:ecosystem-registry` enforces that a live page has its
                // route file and a planned one does not; `building` is
                // deliberately unconstrained, because it means work exists
                // somewhere and not that a route does.
                //
                // This rule is why both Shops appeared here the moment they
                // were built: they were `building` and unlinked while only a
                // prototype existed, and became linkable when /shops/os and
                // /shops/forge became real routes. Nobody edited this page.
                const openable = external || page.state === 'live';
                return (
                  <li key={page.id} data-state={page.state}>
                    <div className={styles.pageHead}>
                      {openable ? (
                        external ? (
                          <a href={page.href} rel="noreferrer">{page.name}</a>
                        ) : (
                          <Link href={page.href}>{page.name}</Link>
                        )
                      ) : (
                        <span>{page.name}</span>
                      )}
                      <span className={styles.state}>{STATE_LABEL[page.state] ?? page.state}</span>
                    </div>
                    <p>{page.purpose}</p>
                    <p className={styles.meta}>
                      <span>{ACCESS_LABEL[page.access] ?? page.access}</span>
                      <code>{page.href}</code>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
