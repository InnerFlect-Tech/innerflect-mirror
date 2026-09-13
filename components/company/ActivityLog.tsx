'use client';

import { Bot, UserCheck } from 'lucide-react';
import type { ActivityEvent } from '@/lib/model/activity';

/**
 * The audit trail as a readable story rather than a ticker.
 *
 * Every entry names who acted — the system, or the person — and carries the
 * reference you would quote when asking why. The one line where a human was
 * required is marked, because that is the line the whole governing rule exists
 * to make visible.
 */
export function ActivityLog({
  events,
  onSelect,
}: {
  events: ActivityEvent[];
  onSelect: (domainId: string) => void;
}) {
  return (
    <section className="activity">
      <div className="activity-head">
        <span className="eyebrow">Live company activity</span>
        <small>{events[0]?.ref} · followed end to end</small>
      </div>
      <ol className="activity-log">
        {events.map((e) => (
          <li key={e.id} data-gate={e.gate ? 'true' : undefined}>
            <button type="button" onClick={() => onSelect(e.domainId)}>
              <time>{e.at}</time>
              <span className="activity-actor" aria-hidden="true">
                {e.actor.kind === 'system' ? <Bot size={12} /> : <UserCheck size={12} />}
              </span>
              <span className="activity-label">{e.label}</span>
              <span className="activity-by">
                {e.actor.kind === 'system' ? 'autonomous' : `by ${e.actor.name}`}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
