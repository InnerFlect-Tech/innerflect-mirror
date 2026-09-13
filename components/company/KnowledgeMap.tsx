'use client';

import { useState } from 'react';
import type { MapEdge, MapNode } from '@/lib/model/knowledge';

/**
 * SVG, not WebGL. This is a relationship diagram, not a spatial model — the 3D
 * world earns its cost by representing a place, and a graph of abstractions is
 * not a place. SVG also keeps the labels selectable and the whole thing cheap.
 *
 * Positions are curated (see data/knowledge.ts); nothing is force-directed.
 */
const STRENGTH_STYLE = {
  strong: { stroke: 'var(--state-active-label)', width: 1.4, opacity: 0.7, dash: undefined },
  related: { stroke: '#2f6c64', width: 1, opacity: 0.5, dash: undefined },
  other: { stroke: '#22403c', width: 0.8, opacity: 0.42, dash: '3 4' },
} as const;

export function KnowledgeMap({ nodes, edges }: { nodes: MapNode[]; edges: MapEdge[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const at = (id: string) => nodes.find((n) => n.id === id)!;

  const isDim = (ids: string[]) => hovered !== null && !ids.includes(hovered);

  return (
    <div className="kmap">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <title>Knowledge map: ten kinds of knowledge connected to a central store.</title>
        {edges.map((e) => {
          const a = at(e.from);
          const b = at(e.to);
          const s = STRENGTH_STYLE[e.strength];
          // Sit the label in the gap between the two hexagons rather than at
          // the midpoint, which lands on top of a node on the shorter spokes.
          const t = 0.56;
          const mx = a.x + (b.x - a.x) * t;
          const my = a.y + (b.y - a.y) * t;
          return (
            <g key={`${e.from}-${e.to}`} opacity={isDim([e.from, e.to]) ? 0.18 : 1}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={s.stroke} strokeWidth={s.width} strokeOpacity={s.opacity}
                strokeDasharray={s.dash}
              />
              {e.label && (
                <text x={mx} y={my - 1.6} className="kmap-edge-label" textAnchor="middle">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const r = n.core ? 11 : 7.6;
          const connected = edges
            .filter((e) => e.from === n.id || e.to === n.id)
            .flatMap((e) => [e.from, e.to]);
          return (
            <g
              key={n.id}
              className={`kmap-node${n.core ? ' is-core' : ''}`}
              opacity={isDim([n.id, ...connected]) ? 0.22 : 1}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <polygon points={hexPoints(n.x, n.y, r)} />
              <text x={n.x} y={n.y + r + 4.6} textAnchor="middle" className="kmap-label">{n.label}</text>
              {hovered === n.id && (
                <text x={n.x} y={n.y + r + 9} textAnchor="middle" className="kmap-count">
                  {n.count.toLocaleString()} items
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <ul className="kmap-legend">
        <li><i className="strong" />Strong relationship</li>
        <li><i className="related" />Related knowledge</li>
        <li><i className="other" />Other connection</li>
      </ul>
    </div>
  );
}

/** Flat-top hexagon, so the nodes read as cells rather than circles. */
function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a) * 0.92).toFixed(2)}`;
  }).join(' ');
}
