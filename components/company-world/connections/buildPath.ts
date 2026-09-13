import { CubicBezierCurve3, Vector3 } from 'three';

const CORE_HALF_X = 1.12;
const CORE_HALF_Z = 0.95;
const ISLAND_HALF_X = 0.98;
const ISLAND_HALF_Z = 0.72;

/**
 * Infrastructure, not a flowchart connector.
 *
 * The path leaves the platform orthogonally, curves through the middle, and
 * arrives orthogonally at the core face:
 *
 *   NODE
 *     |
 *     '--------.
 *              |
 *           COMPANY
 *
 * rather than NODE ————— COMPANY.
 */
export function buildPath(from: [number, number, number]): CubicBezierCurve3 {
  const y = 0.012;
  const [fx, , fz] = from;
  const alongX = Math.abs(fx) > Math.abs(fz);
  const sx = Math.sign(fx) || 1;
  const sz = Math.sign(fz) || 1;

  const start = alongX
    ? new Vector3(fx - sx * ISLAND_HALF_X, y, fz)
    : new Vector3(fx, y, fz - sz * ISLAND_HALF_Z);

  const end = alongX
    ? new Vector3(sx * CORE_HALF_X, y, 0)
    : new Vector3(0, y, sz * CORE_HALF_Z);

  // Control points stay on the departure/arrival axis so both ends read as
  // orthogonal before the curve takes over.
  const c1 = alongX
    ? new Vector3(start.x - sx * 0.85, y, start.z)
    : new Vector3(start.x, y, start.z - sz * 0.85);

  const c2 = alongX
    ? new Vector3(end.x + sx * 0.7, y, end.z)
    : new Vector3(end.x, y, end.z + sz * 0.7);

  return new CubicBezierCurve3(start, c1, c2, end);
}
