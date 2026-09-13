'use client';

import { useState } from 'react';
import { ChevronRight, ShieldCheck, TriangleAlert } from 'lucide-react';
import { TRACE_CHAIN, type ImpactClaim, type SafetyRecord } from '@/lib/model/impact';

/**
 * Impact is the proof layer, so every claim opens into its full chain back to a
 * source event. A number you cannot trace is marketing — which is why the
 * unverified claim is shown with the same prominence and labelled as such,
 * rather than quietly left out of the total.
 */
export function ImpactSurface({
  claims,
  safety,
}: {
  claims: ImpactClaim[];
  safety: SafetyRecord;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="impact-surface">
      <ul className="claim-list">
        {claims.map((c) => {
          const open = c.id === openId;
          return (
            <li key={c.id} className={`claim${open ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : c.id)}>
                <span className="claim-value">
                  <b>{c.value}</b>
                  <small>{c.period}</small>
                </span>
                <span className="claim-body">
                  <b>{c.headline}</b>
                  <small>{c.workflowName} · {c.domainLabel} · {c.delta}</small>
                </span>
                <span className={`claim-badge ${c.verified ? 'verified' : 'unverified'}`}>
                  {c.verified ? <ShieldCheck size={12} /> : <TriangleAlert size={12} />}
                  {c.verified ? 'Verified' : 'Unverified'}
                </span>
                <ChevronRight size={15} aria-hidden="true" className="claim-chevron" />
              </button>

              {open && (
                <ol className="trace">
                  {TRACE_CHAIN.map((step) => (
                    <li key={step}>
                      <span className="trace-step">{step}</span>
                      <span className="trace-value">{c.trace[step]}</span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ul>

      <aside className="outcomes-rail">
      <section className="safety-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Safety record</span>
            <h3>Reported whether or not it flatters the system</h3>
          </div>
        </div>
        <dl>
          <div><dt>Verified autonomous work</dt><dd>{safety.verifiedAutonomousWork.toLocaleString()}</dd></div>
          <div><dt>Human correction</dt><dd>{safety.humanCorrection}</dd></div>
          <div><dt>Unsafe actions</dt><dd className={safety.unsafeActions > 0 ? 'has-attention' : undefined}>{safety.unsafeActions}</dd></div>
          <div><dt>Safe recovery</dt><dd>{safety.safeRecovery}</dd></div>
        </dl>
      </section>

      </aside>
    </div>
  );
}
