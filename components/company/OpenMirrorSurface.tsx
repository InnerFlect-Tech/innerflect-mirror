import {
  gradeCensus,
  openMirrorBoundaries,
  openMirrorDomains,
  provenanceLabel,
  provenanceNote,
  selfBuilderLadder,
  stepCount,
  unverifiedShare,
  type OpenMirrorDomain,
  type Provenance,
} from '@/data/open-mirror';
import { ECOSYSTEM_NODES } from '@/lib/design/ecosystem';
import styles from './OpenMirrorSurface.module.css';

/**
 * Server component. Nothing here is interactive yet on purpose — the first
 * thing the free edition has to get right is what it *claims*, and a claim is
 * legible without a click. Interaction (connect a source, re-grade, swap a
 * guessed step for a pattern) is the next slice, not this one.
 */

const nodeName = (id: string): string =>
  ECOSYSTEM_NODES.find((node) => node.id === id)?.name ?? id;

/**
 * Provenance is not state, so it must not borrow the state palette (`AGENTS.md`
 * rule 1: state decides colour, never category). It is drawn as weight and
 * fill instead — an observed step reads solid, a declared one reads hollow.
 */
function Grade({ provenance }: { provenance: Provenance }) {
  return (
    <span className={styles.grade} data-grade={provenance} title={provenanceNote[provenance]}>
      {provenanceLabel[provenance]}
    </span>
  );
}

function DomainCard({ domain }: { domain: OpenMirrorDomain }) {
  const unverified = domain.steps.filter((s) => s.provenance !== 'observed').length;
  return (
    <article className={styles.domain} data-state={domain.state}>
      <header>
        <h3>{domain.label}</h3>
        <p>{domain.question}</p>
      </header>
      <ol className={styles.steps}>
        {domain.steps.map((step) => (
          <li key={step.id} data-grade={step.provenance}>
            <b>{step.label}</b>
            <Grade provenance={step.provenance} />
          </li>
        ))}
      </ol>
      <footer>
        {unverified} of {domain.steps.length} steps are unverified
      </footer>
    </article>
  );
}

export function OpenMirrorSurface() {
  const census = gradeCensus();
  const total = stepCount();
  const gap = unverifiedShare();

  return (
    <div className={styles.surface}>
      <section className={styles.block} aria-labelledby="om-gap">
        <h2 id="om-gap">The number this edition exists to show you</h2>
        <div className={styles.gauge}>
          <strong>{gap}%</strong>
          <p>
            of your reconstructed company is <em>unverified</em> — {census.declared} steps
            you declared and {census.inferred} Open Mirror inferred, out of {total}. Only{' '}
            {census.observed} were reported by something that could have disagreed with you.
          </p>
        </div>
        <p className={styles.note}>
          A free twin cannot promise measurement, so it promises honesty about measurement
          instead. Every claim below carries the grade of evidence underneath it. Nothing is
          drawn in the ink of a fact until something observed it.
        </p>
      </section>

      <section className={styles.block} aria-labelledby="om-path">
        <h2 id="om-path">The path a euro takes through your company</h2>
        <p className={styles.note}>
          The same four domains as the paid Mirror — an edition that reorganised them would
          teach you a model you would have to unlearn on the way in.
        </p>
        <div className={styles.domains}>
          {openMirrorDomains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="om-ladder">
        <h2 id="om-ladder">Where this goes next</h2>
        <ol className={styles.ladder}>
          {selfBuilderLadder.map((step, i) => (
            <li key={step.id}>
              <span className={styles.rung}>{i + 1}</span>
              <div>
                <b>{step.label}</b>
                <small>in {nodeName(step.surface)}</small>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.block} aria-labelledby="om-boundary">
        <h2 id="om-boundary">What Open Mirror will not do</h2>
        <p className={styles.note}>
          Stated up front rather than discovered at the point of failure. Each limit names
          the registered part of the environment where that capability actually lives.
        </p>
        <ul className={styles.boundaries}>
          {openMirrorBoundaries.map((b) => (
            <li key={b.id}>
              <b>{b.limit}</b>
              <p>{b.because}</p>
              <small>Lives in: {nodeName(b.livesIn)}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
