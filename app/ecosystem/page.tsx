import Link from 'next/link';
import {
  ECOSYSTEM_JOURNEYS,
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
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1>The Innerflect environment</h1>
        <p>
          Every product, entry point and journey in one index. Each state below is the one the
          repository can prove — a page marked live has a route in this codebase, and a planned
          one deliberately does not yet.
        </p>
      </header>

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
                // somewhere (the Shops have a prototype under `prototypes/`)
                // and not that a route does. Treating `building` as openable
                // is exactly the mistake this page exists to avoid: it linked
                // /shops/os and /shops/forge, both of which return 404.
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
