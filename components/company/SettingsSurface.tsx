import { Ban, Check, Database, KeyRound, Plug, ShieldCheck, TriangleAlert, Users } from 'lucide-react';
import {
  auditRetention, authorityLimits, dataScopes, integrations, modelPermissions, roles,
} from '@/data/constitution';

/**
 * Server component. The constitution is a set of limits, so every table names
 * who owns each one — a boundary nobody owns is not a boundary, and the two
 * gaps here (an unfilled Finance owner, a payment authority of zero) are the
 * same gaps that make Finance critical on the Company surface.
 */
export function SettingsSurface() {
  const unowned = authorityLimits.filter((a) => a.owner === 'Unassigned').length;
  const unfilled = roles.filter((r) => r.people === 0).length;

  return (
    <div className="settings-grid">
      {(unowned > 0 || unfilled > 0) && (
        <section className="panel span-all constitution-gap">
          <TriangleAlert size={17} aria-hidden="true" />
          <div>
            <b>{unowned + unfilled} boundaries have no owner.</b>
            <p>
              An authority limit without an accountable person is why Finance cannot progress
              past Decision. This is the same gap, seen from the constitution rather than the world.
            </p>
          </div>
        </section>
      )}

      <section className="panel span-2">
        <div className="panel-head">
          <div><h3><KeyRound size={14} aria-hidden="true" /> Authority and financial limits</h3><small>What the system may do alone, and where a human is required.</small></div>
        </div>
        <table className="settings-table">
          <thead><tr><th scope="col">Action</th><th scope="col">Autonomous up to</th><th scope="col">Requires approval</th><th scope="col">Owner</th></tr></thead>
          <tbody>
            {authorityLimits.map((a) => (
              <tr key={a.id}>
                <th scope="row">{a.action}</th>
                <td>{a.autonomousUpTo}</td>
                <td>{a.requiresApproval}</td>
                <td className={a.owner === 'Unassigned' ? 'has-attention' : undefined}>{a.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div><h3><ShieldCheck size={14} aria-hidden="true" /> Model permissions</h3><small>What the system may never do.</small></div>
        </div>
        <ul className="permission-list">
          {modelPermissions.map((m) => (
            <li key={m.id} className={m.allowed ? 'allowed' : 'denied'}>
              <span aria-hidden="true">{m.allowed ? <Check size={13} /> : <Ban size={13} />}</span>
              <span><b>{m.capability}</b><small>{m.note}</small></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div><h3><Plug size={14} aria-hidden="true" /> Integrations</h3><small>Systems Mirror observes.</small></div>
        </div>
        <ul className="integration-list">
          {integrations.map((i) => (
            <li key={i.id} data-status={i.status}>
              <span className="integration-dot" aria-hidden="true" />
              <span><b>{i.name}</b><small>{i.purpose}</small></span>
              <span className="integration-meta">
                <em>{i.access}</em>
                <small>{i.lastSync}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div><h3><Database size={14} aria-hidden="true" /> Data access</h3><small>What is in scope, and what is deliberately not.</small></div>
        </div>
        <ul className="scope-list">
          {dataScopes.map((d) => (
            <li key={d.id}>
              <b>{d.source}</b>
              <p><span className="eyebrow">In scope</span> {d.includes}</p>
              <p className="excluded"><span className="eyebrow">Excluded</span> {d.excluded}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div><h3><Users size={14} aria-hidden="true" /> Roles</h3><small>Who may approve what.</small></div>
        </div>
        <ul className="role-list">
          {roles.map((r) => (
            <li key={r.id} className={r.people === 0 ? 'unfilled' : undefined}>
              <span><b>{r.role}</b><small>{r.canApprove}</small></span>
              <em>{r.people === 0 ? 'Unfilled' : `${r.people} ${r.people === 1 ? 'person' : 'people'}`}</em>
            </li>
          ))}
        </ul>
        <p className="audit-note"><span className="eyebrow">Audit retention</span> {auditRetention}</p>
      </section>
    </div>
  );
}
