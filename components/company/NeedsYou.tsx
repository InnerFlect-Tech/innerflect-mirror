import Link from 'next/link';
import { ChevronRight, CircleAlert, FileCheck2 } from 'lucide-react';
import type { decisions as Decisions } from '@/data/company';

export function NeedsYou({
  decisions,
  waiting,
}: {
  decisions: typeof Decisions;
  waiting: number;
}) {
  return (
    <article className="needs-you">
      <div className="section-head">
        <div>
          <span className="eyebrow">Needs you</span>
          <h3>{waiting} decisions. Everything else is running.</h3>
        </div>
        <Link href="/approvals" className="urgent-dot" aria-label={`${waiting} waiting, open approvals`}>{waiting}</Link>
      </div>
      <ul>
        {decisions.map((d) => (
          <li key={d.id}>
            <Link href="/approvals">
              <span className={`need-icon ${d.tone}`} aria-hidden="true">
                {d.tone === 'red' ? <CircleAlert size={17} /> : <FileCheck2 size={17} />}
              </span>
              <span><b>{d.title}</b><small>{d.detail}</small></span>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
