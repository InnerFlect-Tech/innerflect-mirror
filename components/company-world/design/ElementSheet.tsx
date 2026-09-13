'use client';

import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box3, Vector3, type Group } from 'three';
import { AgXToneMapping, SRGBColorSpace } from 'three';
import { ELEMENTS } from '@/lib/design/elements';
import { GLYPH_MANIFEST, type GlyphId } from '../generated/glyphIds';
import { useGlyph, preloadGlyphs } from '../glyphs/Glyph';
import { StudioEnvironment } from '../world/StudioEnvironment';
import { SceneEffects } from '../effects/SceneEffects';
import { stateTokens, type SceneState } from '../tokens/sceneStates';

/**
 * Every element, in isolation, across every state.
 *
 * A route rather than a standalone page, and built from the same `Glyph`,
 * `StudioEnvironment` and `SceneEffects` the product renders — so it cannot drift.
 * A page beside the app could only ever *assert* it matched; this one breaks if
 * the import does. It also means the emissive values are judged under the real
 * bloom pass, which is the only place they mean anything.
 */

/** Every state, worst last, so the sheet reads as a progression. */
const STATES: SceneState[] = ['neutral', 'healthy', 'active', 'attention', 'critical'];

const CELL = 2.6;

/** One glyph, normalised into its cell so the sheet compares shape, not scale. */
function Specimen({ id, state, position }: { id: GlyphId; state: SceneState; position: [number, number, number] }) {
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

  return <primitive object={fitted} position={position} />;
}

export function ElementSheet() {
  const [state, setState] = useState<SceneState>('active');
  const [focus, setFocus] = useState<GlyphId | null>(null);

  const shown = focus ? ELEMENTS.filter((e) => e.id === focus) : ELEMENTS;
  const cols = focus ? 1 : 5;

  return (
    <div className="sheet">
      <header className="sheet-bar">
        <div>
          <span className="eyebrow">Design system</span>
          <h1>Elements</h1>
        </div>
        <div className="sheet-ctl">
          <span className="eyebrow">State</span>
          <div className="seg">
            {/* The state KEY, not stateLabel: a designer inspecting states needs the
                identifier the code uses. It also avoids reprinting the product's
                own ambiguity — stateLabel maps both `healthy` and `active` to
                "Healthy", which would render two identical buttons here. */}
            {STATES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === state}
                style={{ '--sw': stateTokens[s].label } as React.CSSProperties}
                onClick={() => setState(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {focus && (
          <button type="button" className="ghost" onClick={() => setFocus(null)}>
            Show all
          </button>
        )}
      </header>

      <div className="sheet-stage">
        <Canvas
          orthographic
          camera={{ position: [8, 7, 8], zoom: 46, near: 0.1, far: 100 }}
          dpr={[1, 2]}
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
            {shown.map((el, i) => (
              <Specimen
                key={el.id}
                id={el.id}
                state={state}
                position={[
                  (i % cols - (cols - 1) / 2) * CELL,
                  0,
                  (Math.floor(i / cols) - (Math.ceil(shown.length / cols) - 1) / 2) * CELL,
                ]}
              />
            ))}
          </Suspense>
          <SceneEffects />
        </Canvas>
      </div>

      <ol className="sheet-rail">
        {ELEMENTS.map((el, i) => (
          <li key={el.id}>
            <button type="button" onClick={() => setFocus(focus === el.id ? null : el.id)} aria-current={focus === el.id}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span className="nm">
                <b>{el.name}</b>
                {!el.takesState && <em title="A person is not a state">fixed grey</em>}
              </span>
              <span className="df">driven by {el.drivenBy}</span>
              <span className="meta">
                {GLYPH_MANIFEST[el.id].triangles} tris · {GLYPH_MANIFEST[el.id].parts} parts
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

preloadGlyphs();


