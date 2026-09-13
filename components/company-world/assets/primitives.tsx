'use client';

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Matrix4,
  SphereGeometry,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Workflow } from '@/lib/model/domain';
import { ref } from '@/lib/model/record';
import { PickBuilder, type PickTable } from './pickTable';
import { massing } from '../tokens/sceneColors';

/**
 * The island builder.
 *
 * These are low-detail *semantic* objects (§8): they represent scale and
 * meaning, not physical reality — a company of 500 people never renders 500
 * people. What each object stands for, and the field that puts it there, is
 * written down in `WORLD_ELEMENTS.md`. Nothing in this file invents a count.
 *
 * Everything static on an island is merged into exactly two BufferGeometries —
 * one opaque body, one emissive accent — so an island costs two draw calls
 * whether it holds seven workflows or twelve. Per-object tone and brightness
 * survive the merge as a vertex `color` attribute, which is what lets a single
 * material still show a bright screen next to a dim partition.
 */

/** Actions/day that a full-height throughput column represents. */
export const THROUGHPUT_FULL_SCALE = 250;

/** Usable floor of the island's illuminated inner surface. */
const FLOOR_W = 1.58;
const FLOOR_D = 1.04;

const COLUMN_MIN = 0.045;
const COLUMN_MAX = 0.44;
const COLUMN_W = 0.076;

// ---------------------------------------------------------------------------
// Geometry helpers. All allocation happens at build time, never in a frame.
// ---------------------------------------------------------------------------

const mat = new Matrix4();
const tint = new Color();

type Piece = { geo: BufferGeometry; color: Color };

function paint(geo: BufferGeometry, color: Color): BufferGeometry {
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  geo.setAttribute('color', new Float32BufferAttribute(arr, 3));
  return geo;
}

function place(geo: BufferGeometry, x: number, y: number, z: number): BufferGeometry {
  mat.makeTranslation(x, y, z);
  geo.applyMatrix4(mat);
  return geo;
}

function box(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  color: Color,
): Piece {
  return { geo: paint(place(new BoxGeometry(w, h, d), x, y, z), color), color };
}

/** A seated or standing figure. Two primitives, ~50 triangles. */
function figure(x: number, y: number, z: number, color: Color, seated: boolean): BufferGeometry[] {
  const bodyH = seated ? 0.055 : 0.085;
  const r = seated ? 0.019 : 0.017;
  return [
    paint(place(new CylinderGeometry(r * 0.8, r, bodyH, 7), x, y + bodyH / 2, z), color),
    paint(place(new SphereGeometry(r * 1.05, 7, 5), x, y + bodyH + r, z), color),
  ];
}

/**
 * Column height from throughput.
 *
 * Deliberately compressive (square root) rather than linear. Throughput across
 * a real company spans an order of magnitude — Market's demand capture moves
 * 240 actions/day against Finance's ownership assignment at 6 — and a linear
 * scale spends almost the whole height range on the top two workflows while
 * every other bay collapses to the floor. That is accurate and unreadable.
 *
 * The square root keeps the ordering and the comparison exactly intact (taller
 * is always more, on one shared scale across all islands) while giving the long
 * tail enough presence to be seen and clicked. It is the same reasoning as a log
 * axis on a chart: the transform is on the *scale*, never on the data.
 */
function columnHeight(throughput: number): number {
  const t = Math.max(0, Math.min(1, throughput / THROUGHPUT_FULL_SCALE));
  return COLUMN_MIN + COLUMN_MAX * Math.sqrt(t);
}

// ---------------------------------------------------------------------------
// Bay grid
// ---------------------------------------------------------------------------

/**
 * How many columns the workflow bays are laid out in. Derived from the count,
 * against the island's aspect ratio, so 7 workflows and 12 workflows both fill
 * the plate instead of one of them rattling around in it.
 */
export function bayGrid(count: number): { cols: number; rows: number } {
  if (count <= 0) return { cols: 0, rows: 0 };
  const cols = Math.max(1, Math.round(Math.sqrt(count * (FLOOR_W / FLOOR_D))));
  return { cols, rows: Math.ceil(count / cols) };
}

export type IslandGeometry = {
  body: BufferGeometry;
  accent: BufferGeometry;
  /** Which record owns which triangles, so the merge stays clickable. */
  bodyPicks: PickTable;
  accentPicks: PickTable;
};

/**
 * The records that justify what gets drawn on an island.
 *
 * A gate pylon exists because a Decision is waiting, and a hotspot because an
 * Exception is open — not because a workflow happens to be coloured. Passed in
 * rather than inferred, which is the whole correction.
 */
export type IslandRecords = {
  /** Workflow id to the decision gating it. */
  decisionByWorkflow: Map<string, string>;
  /** Workflow id to its open exception. */
  exceptionByWorkflow: Map<string, string>;
};

/**
 * Builds one island's static content from its workflow set.
 *
 * Read order matters: workflows arrive sorted by throughput descending, so the
 * skyline runs tall-to-short across the plate and the eye gets volume before
 * it gets detail.
 */
export function buildIslandGeometry(
  workflows: Workflow[],
  accentHex: string,
  records: IslandRecords = { decisionByWorkflow: new Map(), exceptionByWorkflow: new Map() },
): IslandGeometry {
  const body = new PickBuilder();
  const accent_ = new PickBuilder();

  const sorted = [...workflows].sort((a, b) => b.throughput - a.throughput);
  const { cols, rows } = bayGrid(sorted.length);
  if (!cols) {
    return {
      body: paint(new BoxGeometry(0, 0, 0), tint),
      accent: paint(new BoxGeometry(0, 0, 0), tint),
      bodyPicks: [], accentPicks: [],
    };
  }

  const cw = FLOOR_W / cols;
  const cd = FLOOR_D / rows;

  const cPlate = new Color(massing.darkest);
  const cPartition = new Color(massing.dark);
  const cDesk = new Color(massing.mid);
  const cColumn = new Color(massing.dark);
  const cHuman = new Color(massing.light);
  const accent = new Color(accentHex);

  sorted.forEach((w, i) => {
    const wRef = ref('workflow', w.id);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = -FLOOR_W / 2 + cw * (col + 0.5);
    const bz = -FLOOR_D / 2 + cd * (row + 0.5);

    // --- the bay itself ---------------------------------------------------
    body.push(box(cw * 0.86, 0.006, cd * 0.84, bx, 0.003, bz, cPlate).geo, wRef);
    // Partition along the back edge: the boundary between this workflow and
    // the one behind it.
    body.push(box(cw * 0.86, 0.036, 0.007, bx, 0.018, bz - cd * 0.42, cPartition).geo, wRef);

    // --- throughput column ------------------------------------------------
    // Height is volume. Shared world scale, never per-island normalisation:
    // normalising each island against its own busiest workflow would make every
    // domain look equally busy and destroy the cross-domain comparison that is
    // the only reason to draw a skyline.
    const h = columnHeight(w.throughput);
    const colX = bx - cw * 0.28;
    const colZ = bz - cd * 0.2;
    body.push(box(COLUMN_W, h, COLUMN_W, colX, h / 2, colZ, cColumn).geo, wRef);

    // The lit share of the column is the share of that volume the company has
    // genuinely handed over. A tall dark column is work humans still drive.
    const lit = h * (w.autonomy / 100);
    if (lit > 0.004) {
      tint.copy(accent).multiplyScalar(0.6);
      accent_.push(box(COLUMN_W + 0.005, lit, COLUMN_W + 0.005, colX, lit / 2, colZ, tint).geo, wRef);
    }

    // --- desks and the humans at them ------------------------------------
    for (let s = 0; s < w.humans; s++) {
      const dx = bx + cw * 0.12 + s * 0.15;
      const dz = bz + cd * 0.1;
      // Desk: top plus a pedestal, so it reads as furniture and not a floating tile.
      body.push(box(0.125, 0.009, 0.078, dx, 0.056, dz, cDesk).geo, wRef);
      body.push(box(0.016, 0.05, 0.016, dx, 0.028, dz, cPartition).geo, wRef);

      // Screen brightness is how much of this workflow runs itself.
      tint.copy(accent).multiplyScalar(0.3 + 0.65 * (w.autonomy / 100));
      accent_.push(box(0.072, 0.042, 0.005, dx, 0.082, dz - 0.03, tint).geo, wRef);

      // The seated figure, and the chair behind it. One per seat — this is why
      // Delivery has five and Market has two.
      body.pushAll(figure(dx, 0.016, dz + 0.058, cHuman, true), wRef);
      body.push(box(0.044, 0.038, 0.01, dx, 0.035, dz + 0.084, cDesk).geo, wRef);
    }

    // --- gate pylon: a decision is waiting -------------------------------
    // Driven by a Decision RECORD, not by `Workflow.state`. A pylon inferred
    // from a colour is an object standing for nothing: it cannot be opened, and
    // it claims a person is needed without saying what for.
    const decisionId = records.decisionByWorkflow.get(w.id);
    if (decisionId) {
      tint.copy(accent).multiplyScalar(1.5);
      const px = bx + cw * 0.34;
      const pz = bz + cd * 0.3;
      const dRef = ref('decision', decisionId);
      accent_.push(box(0.019, 0.165, 0.019, px, 0.082, pz, tint).geo, dRef);
      accent_.push(box(0.07, 0.006, 0.07, px, 0.005, pz, tint).geo, dRef);
    }

    // --- hotspot: something is wrong ---------------------------------------
    // A separate object for a separate fact. A decision waiting and an exception
    // open are not the same thing, and drawing one shape for both was why the
    // world could not tell you which it was.
    const exceptionId = records.exceptionByWorkflow.get(w.id);
    if (exceptionId) {
      tint.copy(accent).multiplyScalar(1.2);
      const ex = bx - cw * 0.34;
      const ez = bz + cd * 0.3;
      const eRef = ref('exception', exceptionId);
      accent_.push(box(0.052, 0.005, 0.052, ex, 0.004, ez, tint).geo, eRef);
      accent_.push(box(0.03, 0.03, 0.03, ex, 0.055, ez, tint).geo, eRef);
    }
  });

  return {
    body: mergeGeometries(body.parts, false)!,
    accent: accent_.parts.length
      ? mergeGeometries(accent_.parts, false)!
      : paint(new BoxGeometry(0, 0, 0), tint),
    bodyPicks: body.table,
    accentPicks: accent_.table,
  };
}

/**
 * Agent figures, built as a second merged pair so they can carry a different
 * tone from the seated humans.
 *
 * They are posed by activity rather than animated: the scene runs on a demand
 * frame loop and issues zero draw calls when paused, and this layer is not
 * given the `running` / `reducedMotion` signals that would let it animate
 * without breaking that. See request 4 in `WORLD_ELEMENTS.md`.
 */
export function buildAgentGeometry(
  agents: { id: string; activity: string }[],
  accentHex: string,
): IslandGeometry {
  const body = new PickBuilder();
  const accent_ = new PickBuilder();
  const accent = new Color(accentHex);
  const cAgent = new Color(massing.mid);

  agents.forEach(({ id, activity }, i) => {
    // Agents stand on the front apron of the island, clear of the bays, spread
    // across however many there are. Each figure IS its Agent record: identity
    // is the glyph, activity is only the pose.
    const aRef = ref('agent', id);
    const x = (i - (agents.length - 1) / 2) * 0.34;
    const z = FLOOR_D / 2 + 0.12;

    body.pushAll(figure(x, 0.008, z, cAgent, false), aRef);

    // A status mote above the agent. Brightness is how loudly the activity is
    // asking for a person: escalating and waiting read across the room, acting
    // and verifying stay quiet.
    const loudness =
      activity === 'escalating' ? 1.5
      : activity === 'waiting' ? 0.95
      : activity === 'handing-off' ? 0.7
      : activity === 'verifying' ? 0.5
      : activity === 'acting' ? 0.42
      : 0.2;
    tint.copy(accent).multiplyScalar(loudness);
    accent_.push(box(0.026, 0.026, 0.026, x, 0.15, z, tint).geo, aRef);
  });

  return {
    body: body.parts.length ? mergeGeometries(body.parts, false)! : paint(new BoxGeometry(0, 0, 0), tint),
    accent: accent_.parts.length ? mergeGeometries(accent_.parts, false)! : paint(new BoxGeometry(0, 0, 0), tint),
    bodyPicks: body.table,
    accentPicks: accent_.table,
  };
}
