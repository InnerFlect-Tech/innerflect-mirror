'use client';

import { ChevronRight, CircleAlert, FileCheck2 } from 'lucide-react';
import type { decisions as Decisions } from '@/data/company';

export function NeedsYou({
  decisions,
  waiting,
  onOpen,
}: {
  decisions: typeof Decisions;
  waiting: number;
  onOpen: (title: string) => void;
}) {
  return (
    <article className="needs-you">
      <div className="section-head">
        <div>
          <span className="eyebrow">Needs you</span>
          <h3>{waiting} decisions. Everything else is running.</h3>
        </div>
        <span className="urgent-dot" aria-label={`${waiting} waiting`}>{waiting}</span>
      </div>
      <ul>
        {decisions.map((d) => (
          <li key={d.id}>
            <button type="button" onClick={() => onOpen(d.title)}>
              <span className={`need-icon ${d.tone}`} aria-hidden="true">
                {d.tone === 'red' ? <CircleAlert size={17} /> : <FileCheck2 size={17} />}
              </span>
              <span><b>{d.title}</b><small>{d.detail}</small></span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
