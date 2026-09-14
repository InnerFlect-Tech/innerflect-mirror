'use client';

import Link from 'next/link';
import {
  BookOpen,
  Columns2,
  Eye,
  FileCheck2,
  Settings2,
  Target,
  Workflow,
} from 'lucide-react';
import { useCockpitStore } from '@/lib/store/cockpit';

/**
 * Navigation, so it is built from links. These were six <button>s with no
 * handler, which put six dead controls in the tab order and told a keyboard
 * user they could do something they could not.
 *
 * Server component: it renders once and ships no JavaScript.
 */
export type Surface =
  | 'company'
  | 'mirror'
  | 'processes'
  | 'approvals'
  | 'knowledge'
  | 'outcomes'
  | 'settings';

const SURFACES: {
  id: Surface;
  href: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'company', href: '/', label: 'Company', icon: <Eye /> },
  { id: 'mirror', href: '/mirror', label: 'Mirror', icon: <Columns2 /> },
  {
    id: 'processes',
    href: '/processes',
    label: 'Processes',
    icon: <Workflow />,
  },
  {
    id: 'approvals',
    href: '/approvals',
    label: 'Approvals',
    icon: <FileCheck2 />,
  },
  {
    id: 'knowledge',
    href: '/knowledge',
    label: 'Knowledge',
    icon: <BookOpen />,
  },
  { id: 'outcomes', href: '/outcomes', label: 'Outcomes', icon: <Target /> },
];

export function Rail({
  active,
  decisionsWaiting,
}: {
  active: Surface;
  decisionsWaiting: number;
}) {
  const expanded = useCockpitStore((state) => state.navigationOpen);
  return (
    <aside className={`rail${expanded ? ' is-expanded' : ''}`}>
      <div className="brand">
        <span className="mirror-glyph" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <b>Innerflect</b>
        <small>Mirror</small>
      </div>

      <nav aria-label="Product surfaces">
        {SURFACES.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            className={s.id === active ? 'active' : undefined}
            aria-current={s.id === active ? 'page' : undefined}
          >
            {s.icon}
            <span className="rail-label">{s.label}</span>
            {s.id === 'approvals' && decisionsWaiting > 0 && (
              <em aria-label={`${decisionsWaiting} waiting`}>
                {decisionsWaiting}
              </em>
            )}
          </Link>
        ))}
      </nav>

      <p className="rail-tagline">A more capable company, by design.</p>

      <div className="rail-foot">
        <div className="operator">
          <span aria-hidden="true">IF</span>
          <div>
            <b>Indias</b>
            <small>Company owner</small>
          </div>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          aria-current={active === 'settings' ? 'page' : undefined}
          className={active === 'settings' ? 'active' : undefined}
        >
          <Settings2 size={16} />
        </Link>
      </div>
    </aside>
  );
}
