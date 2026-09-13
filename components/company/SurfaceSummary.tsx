import Link from 'next/link';

/**
 * Tier one of the Summary → Context → Details hierarchy: the three to five
 * numbers that decide whether you need to look further at all.
 *
 * Capped at five deliberately. Past that, a summary stops summarising and the
 * reader has to do the triage the interface was supposed to do for them.
 */
export type SummaryStat = {
  value: string;
  label: string;
  /** `attention` and `critical` are the only things allowed to break the calm. */
  tone?: 'neutral' | 'good' | 'attention' | 'critical';
  /** Where this number is explained in full. */
  href?: string;
};

export function SurfaceSummary({ stats }: { stats: SummaryStat[] }) {
  return (
    <ul className="summary-strip">
      {stats.slice(0, 5).map((s) => {
        const body = (
          <>
            <b data-tone={s.tone ?? 'neutral'}>{s.value}</b>
            <small>{s.label}</small>
          </>
        );
        return (
          <li key={s.label} data-tone={s.tone ?? 'neutral'}>
            {s.href ? <Link href={s.href}>{body}</Link> : body}
          </li>
        );
      })}
    </ul>
  );
}
