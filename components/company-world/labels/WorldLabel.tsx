'use client';

import { Html } from '@react-three/drei';
import {
  Banknote,
  Boxes,
  Headphones,
  Megaphone,
  Settings,
  Users,
  Workflow,
} from 'lucide-react';
import type { WorldDomain } from '@/lib/model/domain';

/**
 * Labels are real HTML, never TextGeometry — sharper, accessible, and styled
 * from the same stylesheet as the rest of the product. They stay upright
 * regardless of camera.
 *
 * The icon is resolved from a key on the domain record, so adding a domain is a
 * data change and the renderer still never branches on an id.
 */
const ICONS: Record<WorldDomain['icon'], React.ReactNode> = {
  market: <Megaphone size={13} />,
  sales: <Users size={13} />,
  delivery: <Settings size={13} />,
  finance: <Banknote size={13} />,
  people: <Users size={13} />,
  supply: <Boxes size={13} />,
  support: <Headphones size={13} />,
};

export function WorldLabel({
  position,
  title,
  processes,
  autonomy,
  icon,
  accent,
  subdued,
  onSelect,
}: {
  position: [number, number, number];
  title: string;
  processes: number;
  autonomy: number;
  icon?: WorldDomain['icon'];
  accent: string;
  subdued: boolean;
  onSelect?: () => void;
}) {
  const body = (
    <>
      <span className="world-chip-icon" aria-hidden="true">
        {icon ? ICONS[icon] : <Workflow size={13} />}
      </span>
      <span className="world-chip-text">
        <b>{title}</b>
        <small>{processes} processes</small>
      </span>
      <span className="world-chip-score" style={{ color: accent, borderColor: accent }}>
        {autonomy}%
      </span>
    </>
  );

  const className = `world-chip${subdued ? ' is-subdued' : ''}`;

  return (
    <Html position={position} center zIndexRange={[6, 0]} style={{ pointerEvents: onSelect ? 'auto' : 'none' }}>
      {onSelect ? (
        <button
          type="button"
          className={className}
          onClick={onSelect}
          aria-label={`${title} — ${processes} processes, ${autonomy}% autonomous`}
        >
          {body}
        </button>
      ) : (
        <span className={className}>{body}</span>
      )}
    </Html>
  );
}

/** The company core names the world rather than acting on it. */
export function CompanyLabel({
  position,
  title,
  state,
  accent,
  subdued,
}: {
  position: [number, number, number];
  title: string;
  state: string;
  accent: string;
  subdued: boolean;
}) {
  return (
    <Html position={position} center zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
      <span className={`world-company${subdued ? ' is-subdued' : ''}`}>
        <b>{title}</b>
        <small style={{ color: accent }}>{state}</small>
      </span>
    </Html>
  );
}
