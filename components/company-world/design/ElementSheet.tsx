'use client';

import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  AgXToneMapping,
  Box3,
  SRGBColorSpace,
  Vector3,
  type Group,
} from 'three';
import { ELEMENTS, type ElementDef } from '@/lib/design/elements';
import type { SceneState } from '@/lib/model/state';
import { GLYPH_MANIFEST, type GlyphId } from '../generated/glyphIds';
import { preloadGlyphs, useGlyph } from '../glyphs/Glyph';
import { SceneEffects } from '../effects/SceneEffects';
import { stateTokens } from '../tokens/sceneStates';
import { StudioEnvironment } from '../world/StudioEnvironment';
import { ElementSymbol2D } from './ElementSymbol2D';
import styles from './ElementSheet.module.css';

/** Every state, worst last, so the sheet reads as a progression. */
const STATES: SceneState[] = [
  'neutral',
  'active',
  'attention',
  'critical',
];
const CELL = 2.6;
type Projection = 'paired' | '3d' | '2d';

/** One glyph, normalised into its cell so the sheet compares shape, not scale. */
function Specimen({
  id,
  state,
  position,
}: {
  id: GlyphId;
  state: SceneState;
  position: [number, number, number];
}) {
  const { group } = useGlyph(id, state);

  const fitted = useMemo(() => {
    const g = group as Group;
    const box = new Box3().setFromObject(g);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const k = 1.7 / Math.max(size.x, size.z, size.y * 0.8, 0.001);
    g.scale.setScalar(k);
    g.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
    return g;
  }, [group]);

  return (
    <group position={position}>
      <primitive object={fitted} />
    </group>
  );
}

function GlyphStage({
  elements,
  state,
}: {
  elements: readonly ElementDef[];
  state: SceneState;
}) {
  const cols = elements.length === 1 ? 1 : 5;
  const rows = Math.ceil(elements.length / cols);

  return (
    <Canvas
      orthographic
      camera={{
        position: [8, 7, 8],
        zoom: elements.length === 1 ? 78 : 42,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = AgXToneMapping;
        gl.toneMappingExposure = 0.9;
        scene.background = null;
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 5]} intensity={1.1} />
      <StudioEnvironment />
      <Suspense fallback={null}>
        {elements.map((element, index) => (
          <Specimen
            key={element.id}
            id={element.id}
            state={state}
            position={[
              ((index % cols) - (cols - 1) / 2) * CELL,
              0,
              (Math.floor(index / cols) - (rows - 1) / 2) * CELL,
            ]}
          />
        ))}
      </Suspense>
      <SceneEffects />
    </Canvas>
  );
}

function ProjectionControl({
  value,
  onChange,
}: {
  value: Projection;
  onChange: (value: Projection) => void;
}) {
  return (
    <div className={styles.segmented} aria-label="Projection">
      {(['paired', '3d', '2d'] as const).map((projection) => (
        <button
          key={projection}
          type="button"
          aria-pressed={value === projection}
          onClick={() => onChange(projection)}
        >
          {projection === 'paired' ? '2D + 3D' : projection.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * Every canonical element in both projections, under the real state pipeline.
 *
 * One registry supplies names, meaning and composition constraints. The 3D side
 * loads the production GLBs through the production conformance layer; the 2D
 * side renders the light symbols from those same ids and tokens. If either side
 * drifts, this route makes the mismatch visible immediately.
 */
export function ElementSheet() {
  const [state, setState] = useState<SceneState>('active');
  const [focus, setFocus] = useState<GlyphId | null>(null);
  const [projection, setProjection] = useState<Projection>('paired');
  const shown = focus
    ? ELEMENTS.filter((element) => element.id === focus)
    : ELEMENTS;

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Design system · same semantics, different projection
          </span>
          <h1>Elements</h1>
        </div>

        <ProjectionControl value={projection} onChange={setProjection} />

        <div className={styles.stateControl}>
          <span className={styles.eyebrow}>State</span>
          <div className={styles.segmented}>
            {STATES.map((candidate) => (
              <button
                key={candidate}
                type="button"
                aria-pressed={candidate === state}
                style={
                  {
                    '--swatch': stateTokens[candidate].label,
                  } as React.CSSProperties
                }
                onClick={() => setState(candidate)}
              >
                <i />
                {candidate}
              </button>
            ))}
          </div>
        </div>

        {focus && (
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setFocus(null)}
          >
            Show all
          </button>
        )}
      </header>

      <section className={styles.comparison} data-projection={projection}>
        {projection !== '2d' && (
          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.eyebrow}>Spatial projection</span>
                <h2>3D language</h2>
              </div>
              <span>GLB · conformed at runtime</span>
            </div>
            <div className={styles.webgl}>
              <GlyphStage elements={shown} state={state} />
            </div>
          </article>
        )}

        {projection !== '3d' && (
          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.eyebrow}>Light projection</span>
                <h2>2D language</h2>
              </div>
              <span>SVG · zero WebGL</span>
            </div>
            <div
              className={styles.symbolGrid}
              data-focused={focus ? 'true' : 'false'}
            >
              {shown.map((element) => (
                <button
                  key={element.id}
                  type="button"
                  aria-current={focus === element.id}
                  onClick={() =>
                    setFocus(focus === element.id ? null : element.id)
                  }
                >
                  <ElementSymbol2D
                    id={element.id}
                    state={state}
                    title={element.name}
                  />
                  <b>{element.name}</b>
                  <small>{element.composition}</small>
                </button>
              ))}
            </div>
          </article>
        )}
      </section>

      <ol className={styles.rail}>
        {ELEMENTS.map((element, index) => (
          <li key={element.id}>
            <button
              type="button"
              onClick={() => setFocus(focus === element.id ? null : element.id)}
              aria-current={focus === element.id}
            >
              <ElementSymbol2D id={element.id} state={state} />
              <span className={styles.number}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.name}>
                <b>{element.name}</b>
                {!element.takesState && <em>fixed grey</em>}
              </span>
              <span className={styles.mapping}>
                driven by {element.drivenBy}
              </span>
              <span className={styles.meta}>
                {element.family} · {element.composition} · {element.revealAt} ·{' '}
                {GLYPH_MANIFEST[element.id].triangles} tris
              </span>
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}

preloadGlyphs();
