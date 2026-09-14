import type { CSSProperties, SVGProps } from 'react';
import { ELEMENTS_BY_ID } from '@/lib/design/elements';
import type { SceneState } from '@/lib/model/state';
import { massing, shell, stateColors } from '@/lib/tokens';
import type { GlyphId } from '../generated/glyphIds';

type Props = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  id: GlyphId;
  state?: SceneState;
  title?: string;
};

const line = {
  fill: 'none',
  stroke: 'var(--element-accent)',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/**
 * The canonical 2D projection of a Mirror element.
 *
 * It deliberately shares ids, state tokens and semantic metadata with the GLB
 * registry. This is not a parallel icon library: it is the light projection of
 * the same object language. Shape identifies kind; only state chooses accent.
 */
export function ElementSymbol2D({
  id,
  state = 'active',
  title,
  style,
  ...props
}: Props) {
  const element = ELEMENTS_BY_ID[id];
  const effectiveState = element.takesState ? state : 'neutral';
  const token = stateColors[effectiveState];
  const variables = {
    '--element-accent': id === 'human-glyph' ? massing.light : token.label,
    '--element-edge': id === 'human-glyph' ? massing.mid : token.edge,
    '--element-surface': id === 'human-glyph' ? shell.platform : token.surface,
    '--element-structure': massing.mid,
    '--element-light': massing.light,
    ...style,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      style={variables}
      {...props}
    >
      {title && <title>{title}</title>}
      <Symbol id={id} />
    </svg>
  );
}

function Tile({ diamond = false }: { diamond?: boolean }) {
  return (
    <g transform={diamond ? 'rotate(45 32 32)' : undefined}>
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="9"
        fill="var(--element-surface)"
        stroke="var(--element-edge)"
        strokeWidth="2"
      />
      <rect
        x="16"
        y="16"
        width="32"
        height="32"
        rx="6"
        fill="none"
        stroke="var(--element-accent)"
        strokeOpacity=".45"
      />
    </g>
  );
}

function Symbol({ id }: { id: GlyphId }) {
  switch (id) {
    case 'company-core':
      return (
        <g>
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="10"
            fill="var(--element-surface)"
            stroke="var(--element-edge)"
            strokeWidth="2"
          />
          <rect
            x="15"
            y="15"
            width="34"
            height="34"
            rx="7"
            fill="none"
            stroke="var(--element-accent)"
            strokeWidth="2"
          />
          <rect
            x="23"
            y="23"
            width="18"
            height="18"
            rx="4"
            fill="var(--element-structure)"
            stroke="var(--element-light)"
          />
          <path d="M13 32h38" {...line} />
          <circle cx="32" cy="32" r="3" fill="var(--element-accent)" />
        </g>
      );
    case 'domain-platform':
      return (
        <g>
          <rect
            x="7"
            y="12"
            width="50"
            height="40"
            rx="9"
            fill="var(--element-surface)"
            stroke="var(--element-edge)"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="18"
            width="38"
            height="27"
            rx="6"
            fill="none"
            stroke="var(--element-structure)"
            strokeWidth="2"
          />
          <path d="M23 48h18" {...line} />
        </g>
      );
    case 'human-glyph':
      return (
        <g fill="var(--element-accent)">
          <circle cx="32" cy="18" r="7" />
          <path d="M20 52c1-13 3-23 12-23s11 10 12 23H20Z" />
        </g>
      );
    case 'agent-glyph':
      return (
        <g>
          <path d="M32 9v7" {...line} />
          <circle cx="32" cy="8" r="3" fill="var(--element-accent)" />
          <rect
            x="14"
            y="16"
            width="36"
            height="31"
            rx="9"
            fill="var(--element-surface)"
            stroke="var(--element-accent)"
            strokeWidth="2.5"
          />
          <circle cx="25" cy="30" r="3.5" fill="var(--element-accent)" />
          <circle cx="39" cy="30" r="3.5" fill="var(--element-accent)" />
          <path d="M24 39h16" {...line} />
          <path d="M21 48v7M43 48v7" {...line} />
        </g>
      );
    case 'tool-glyph':
      return (
        <g>
          <ellipse
            cx="32"
            cy="17"
            rx="15"
            ry="7"
            fill="var(--element-surface)"
            stroke="var(--element-accent)"
            strokeWidth="2"
          />
          <path
            d="M17 17v14c0 4 7 7 15 7s15-3 15-7V17M17 31v14c0 4 7 7 15 7s15-3 15-7V31"
            {...line}
          />
          <path d="M18 30c3 4 9 6 14 6s11-2 14-6" {...line} />
        </g>
      );
    case 'knowledge-object':
      return (
        <g>
          <path
            d="M17 8h22l10 10v38H17V8Z"
            fill="var(--element-surface)"
            stroke="var(--element-edge)"
            strokeWidth="2"
          />
          <path d="M39 8v11h10M24 29h18M24 37h18M24 45h13" {...line} />
        </g>
      );
    case 'workflow-line':
      return (
        <g>
          <path d="M7 32h43" {...line} />
          <path d="m43 23 10 9-10 9" {...line} />
          <circle cx="11" cy="32" r="4" fill="var(--element-accent)" />
        </g>
      );
    case 'decision-gate':
      return (
        <g>
          <Tile diamond />
          <circle cx="32" cy="27" r="3" fill="var(--element-accent)" />
          <path d="M32 30v7M32 37l-8 8M32 37l8 8" {...line} />
        </g>
      );
    case 'action-pulse':
      return (
        <g fill="none" stroke="var(--element-accent)">
          <circle cx="32" cy="32" r="23" strokeOpacity=".25" />
          <circle cx="32" cy="32" r="15" strokeOpacity=".55" strokeWidth="2" />
          <circle
            cx="32"
            cy="32"
            r="6"
            fill="var(--element-accent)"
            strokeWidth="2"
          />
        </g>
      );
    case 'risk-hotspot':
      return (
        <g>
          <path
            d="M32 8 58 54H6L32 8Z"
            fill="var(--element-surface)"
            stroke="var(--element-accent)"
            strokeWidth="2.5"
          />
          <path d="M32 23v15" {...line} />
          <circle cx="32" cy="45" r="2.5" fill="var(--element-accent)" />
        </g>
      );
    case 'step-node':
      return (
        <g>
          <Tile />
          <rect
            x="25"
            y="29"
            width="14"
            height="6"
            rx="3"
            fill="var(--element-accent)"
          />
          <circle cx="7" cy="32" r="3" fill="var(--element-accent)" />
          <circle cx="57" cy="32" r="3" fill="var(--element-accent)" />
          <circle cx="32" cy="57" r="2.5" fill="var(--element-edge)" />
        </g>
      );
    case 'record-token':
      return (
        <g>
          <circle
            cx="32"
            cy="32"
            r="18"
            fill="var(--element-surface)"
            stroke="var(--element-edge)"
            strokeWidth="3"
          />
          <circle cx="32" cy="32" r="11" fill="var(--element-accent)" />
          <path
            d="M27 32h10"
            stroke="var(--element-light)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    case 'verification-marker':
      return (
        <g>
          <circle
            cx="32"
            cy="32"
            r="24"
            fill="var(--element-surface)"
            stroke="var(--element-edge)"
            strokeWidth="2"
          />
          <circle
            cx="32"
            cy="32"
            r="17"
            fill="none"
            stroke="var(--element-accent)"
            strokeWidth="2"
          />
          <path d="m21 32 8 8 15-18" {...line} strokeWidth="4" />
        </g>
      );
    case 'outcome-marker':
      return (
        <g>
          <circle
            cx="32"
            cy="50"
            r="8"
            fill="var(--element-surface)"
            stroke="var(--element-edge)"
            strokeWidth="2"
          />
          <path d="M27 50V10" {...line} />
          <path d="M29 12h22l-7 9 7 9H29V12Z" fill="var(--element-accent)" />
        </g>
      );
    case 'permission-boundary':
      return (
        <g>
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="5"
            fill="var(--element-surface)"
            fillOpacity=".35"
            stroke="var(--element-accent)"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          <path d="M8 20V8h12M44 8h12v12M56 44v12H44M20 56H8V44" {...line} />
        </g>
      );
  }

  const exhaustive: never = id;
  return exhaustive;
}
