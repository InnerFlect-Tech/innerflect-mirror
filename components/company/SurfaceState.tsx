import { AlertTriangle, CloudOff, LockKeyhole, SearchX } from 'lucide-react';

export type SurfaceStatus =
  | 'loading'
  | 'empty'
  | 'filtered-empty'
  | 'unavailable'
  | 'stale'
  | 'permission-denied'
  | 'degraded-3d'
  | 'offline';

const copy: Record<
  Exclude<SurfaceStatus, 'loading'>,
  { title: string; detail: string }
> = {
  empty: {
    title: 'Nothing here yet',
    detail: 'This surface will populate when the company records exist.',
  },
  'filtered-empty': {
    title: 'No matching records',
    detail: 'Change or clear the active filters to see the full set.',
  },
  unavailable: {
    title: 'Surface unavailable',
    detail:
      'The source could not be reached. Existing operations remain unchanged.',
  },
  stale: {
    title: 'Showing older evidence',
    detail: 'The latest synchronisation has not completed yet.',
  },
  'permission-denied': {
    title: 'Authority required',
    detail: 'Your current role cannot access these records.',
  },
  'degraded-3d': {
    title: 'Practical view is active',
    detail: '3D is unavailable; the same records remain accessible below.',
  },
  offline: {
    title: 'You are offline',
    detail:
      'Read-only information may be stale. Actions resume after reconnection.',
  },
};

export function SurfaceState({ status }: { status: SurfaceStatus }) {
  if (status === 'loading')
    return (
      <output className="surface-state is-loading" aria-label="Loading">
        <i />
        <i />
        <i />
      </output>
    );
  const Icon =
    status === 'permission-denied'
      ? LockKeyhole
      : status === 'offline'
        ? CloudOff
        : status === 'filtered-empty'
          ? SearchX
          : AlertTriangle;
  return (
    <output className="surface-state">
      <Icon aria-hidden="true" />
      <h2>{copy[status].title}</h2>
      <p>{copy[status].detail}</p>
    </output>
  );
}
