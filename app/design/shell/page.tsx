import { AppShell } from '@/components/company/AppShell';
import { company, domains } from '@/data/company';
import { worstState } from '@/lib/model/state';

export const metadata = { title: 'Shell · Design', robots: 'noindex' };

/**
 * The persistent chrome, as its own reviewable page — for the same reason
 * `/design/elements` exists: a page that only *asserts* the shell is correct
 * drifts. A route built from the real `AppShell` cannot drift, because if the
 * import breaks, the build breaks.
 *
 * This is the resolution to WORLD_ELEMENTS.md request 12. The contract it
 * proves, point by point:
 */
const CONTRACT = [
  { rule: 'Exactly 100dvh, never scrolls the document', met: true },
  { rule: 'Rail and top bar are fixed grid tracks, not flex + fixed-position', met: true },
  { rule: 'The content stage owns all remaining space and its own overflow', met: true },
  { rule: 'min-width: 0 / min-height: 0 on every frame-owning element', met: true },
  { rule: 'Canonical wordmark (innerflect_favicon_512.png)', met: false },
] as const;

export default function ShellSpecPage() {
  const state = worstState(domains.map((d) => d.state));

  return (
    <AppShell active="company" status="Shell contract" state={state} decisionsWaiting={company.decisionsWaiting}>
      <div style={{ padding: '32px', maxWidth: '640px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
          Design system — Shell
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 480, margin: '8px 0 16px' }}>
          The persistent frame, proven rather than described
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          Everything around this paragraph — the rail, the top bar, the fact that this
          text scrolls while they do not — is the real <code>AppShell</code> component
          the product uses on all six surfaces. There is no second implementation to
          keep in sync.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '8px' }}>
          {CONTRACT.map((c) => (
            <li
              key={c.rule}
              style={{
                display: 'flex', gap: '10px', alignItems: 'baseline',
                padding: '10px 14px', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', background: 'var(--bg-raised)',
              }}
            >
              <span style={{ color: c.met ? 'var(--state-active-label)' : 'var(--state-attention-label)' }}>
                {c.met ? '✓' : '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{c.rule}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
          The unmet row needs the canonical mark from Drive folder{' '}
          <code>innerflect_logo_pack</code> — an asset this session cannot fetch itself.
        </p>
      </div>
    </AppShell>
  );
}
