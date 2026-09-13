/**
 * InnerFlect Mirror — the ten canonical V1 elements.
 *
 * This is the element vocabulary of the Mirror visual language. The governing
 * rule, from WORLD_ELEMENTS.md:
 *
 *   If an object does not represent a company entity, workflow step, state or
 *   relationship, it does not belong in the scene.
 *
 * Deliberately framework-free. `createElements(THREE)` takes the Three.js
 * namespace as a parameter rather than importing it, so this one file drives
 * both the standalone review sheet (three from a CDN, as a global) and the R3F
 * product scene (three as an ES import) with no second copy to drift.
 *
 * V1 constraints, held on purpose:
 *   - boxes, cylinders, planes, curves, small spheres only
 *   - minimal bevels, no textures, no imported models
 *   - colour communicates STATE, never department identity
 *   - labels live in HTML, never in the 3D
 */

/** The product palette. Authority is PRODUCT_STRUCTURE.md, not this file. */
export const palette = {
  void: '#080C0C',
  panel: '#0D1313',
  shell: '#061719',
  massDark: '#203638',
  massMid: '#304345',
  massLight: '#5C6A6B',
  ink: '#EEF3F1',
  teal: '#55CBBB',
  amber: '#D8A34D',
  red: '#E16D5D',
  human: '#5C6A6B',
};

/**
 * State decides colour. This is the whole rule, in one function — there is
 * deliberately no way to ask this module for "the Sales colour".
 */
export function stateColor(state) {
  switch (state) {
    case 'healthy':
    case 'active':
      return palette.teal;
    case 'attention':
      return palette.amber;
    case 'critical':
      return palette.red;
    default:
      return palette.human;
  }
}

/**
 * A soft radial falloff, built once and shared. Used for the bloom-substitute
 * halos and for contact grounding — both are the difference between geometry
 * sitting ON a surface and geometry floating above it.
 */
export function radialTexture(THREE, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d').createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.35)'));
  g.addColorStop(1, outer);
  const ctx = c.getContext('2d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createElements(THREE) {
  // A single shared sprite texture for every glow in the sheet.
  const haloTex = radialTexture(THREE);

  // --- shared material helpers ------------------------------------------
  const solid = (color, o = {}) =>
    new THREE.MeshStandardMaterial({
      color, roughness: 0.62, metalness: 0.06, envMapIntensity: 1.1, ...o,
    });

  // Dark glass. No `transmission` — Three renders the whole scene into a
  // transmission target once per transmissive object, and clearcoat over a
  // dark base reads the same at this scale for a fraction of the cost.
  const glass = (opacity = 0.5) =>
    new THREE.MeshPhysicalMaterial({
      color: palette.shell,
      roughness: 0.18,
      metalness: 0.2,
      clearcoat: 0.85,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.5,
      transparent: true,
      opacity,
    });

  const glow = (color, opacity = 1) =>
    new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false });

  const box = (w, h, d, x, y, z, material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    return m;
  };

  /**
   * A wireframe edge on a box. Bevelled shells read as manufactured objects
   * only if their edges catch a highlight; without this the glass tiers of the
   * company core were invisible against the ground.
   */
  const outline = (w, h, d, x, y, z, color, opacity = 0.5) => {
    const src = new THREE.BoxGeometry(w, h, d);
    const l = new THREE.LineSegments(
      new THREE.EdgesGeometry(src),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    );
    l.position.set(x, y, z);
    src.dispose();
    return l;
  };

  /**
   * An additive halo around a bright accent. The product scene gets this from a
   * selective bloom pass; a standalone sheet has no post pipeline, so the glow
   * is carried by a sprite instead. Same read, no composer.
   */
  const halo = (x, y, z, size, color, opacity = 0.55) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }));
    s.position.set(x, y, z);
    s.scale.setScalar(size);
    return s;
  };

  const plane = (w, h, material) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    m.material.side = THREE.DoubleSide;
    return m;
  };

  /** A curved path used by workflow lines and action pulses. */
  const flowCurve = () =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.38, 0.05, 0.12),
      new THREE.Vector3(-0.12, 0.22, -0.06),
      new THREE.Vector3(0.14, 0.24, 0.06),
      new THREE.Vector3(0.38, 0.08, -0.1),
    ]);

  /**
   * The canonical ten. Order is the reading order of the system: what the
   * company IS, who and what is in it, then how work moves through it.
   */
  const elements = [
    {
      id: 'company-core',
      name: 'Company Core',
      meaning: 'The organisation as a living system.',
      drivenBy: 'Company record',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();

        // Foundation: the company sits on something.
        g.add(box(0.66, 0.022, 0.66, 0, 0.011, 0, solid(palette.massDark)));
        g.add(outline(0.66, 0.022, 0.66, 0, 0.011, 0, accent, 0.14));

        // Layered translucent block. Separated by air rather than stacked
        // flush: the layers have to be legible AS layers, which was the whole
        // point of the element and the thing the first version lost.
        const tiers = [
          { w: 0.60, y: 0.085, o: 0.30 },
          { w: 0.48, y: 0.195, o: 0.34 },
          { w: 0.34, y: 0.305, o: 0.40 },
        ];
        tiers.forEach((t) => {
          g.add(box(t.w, 0.052, t.w, 0, t.y, 0, glass(t.o)));
          // The edge highlight is what makes dark glass read as glass.
          g.add(outline(t.w, 0.052, t.w, 0, t.y, 0, accent, 0.5));
        });

        // The lit interior, rising through every layer: the company's own
        // state, read from inside the system rather than painted on it.
        g.add(box(0.055, 0.34, 0.055, 0, 0.185, 0, glow(accent, 0.75)));
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 12), glow(accent));
        cap.position.y = 0.365;
        g.add(cap);
        g.add(halo(0, 0.365, 0, 0.42, accent, 0.7));
        g.add(halo(0, 0.185, 0, 0.3, accent, 0.3));

        return { group: g, anchor: 0.42 };
      },
    },
    {
      id: 'mirror-layer',
      name: 'Mirror Layer',
      meaning: 'The digital reflection beneath the company: state, interpretation, policy, audit.',
      drivenBy: 'Mirror model',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        // The real company above.
        g.add(box(0.46, 0.06, 0.46, 0, 0.22, 0, glass(0.5)));
        // Its reflection below — inverted, dimmer, teal. Not a copy: a reading.
        const mirror = box(0.46, 0.02, 0.46, 0, -0.02, 0, glow(accent, 0.16));
        g.add(mirror);
        g.add(box(0.4, 0.012, 0.4, 0, 0.02, 0, glow(accent, 0.09)));
        // Tethers: the reflection is derived from the thing above it.
        [-0.16, 0.16].forEach((x) =>
          [-0.16, 0.16].forEach((z) => g.add(box(0.005, 0.2, 0.005, x, 0.11, z, glow(accent, 0.3)))),
        );
        return { group: g, anchor: 0.3 };
      },
    },
    {
      id: 'function-platform',
      name: 'Function Platform',
      meaning: 'One operational domain — Market, Sales, Delivery, Finance.',
      drivenBy: 'Domain record',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();

        // Layered construction, as the contract specifies: bevelled dark shell,
        // illuminated inner surface, restrained edge highlight. The bevel is
        // faked with an inset underslab — cheaper than a rounded box and reads
        // identically at this scale.
        g.add(box(0.70, 0.030, 0.50, 0, 0.015, 0, solid(palette.shell, { roughness: 0.35, metalness: 0.2 })));
        g.add(box(0.78, 0.048, 0.58, 0, 0.054, 0, glass(0.78)));
        g.add(outline(0.78, 0.048, 0.58, 0, 0.054, 0, accent, 0.42));

        // Inner illuminated surface. Tone-mapped and kept below 1 so the
        // platform glows without blooming into a light panel.
        g.add(box(0.66, 0.014, 0.46, 0, 0.083, 0, solid(palette.shell, {
          emissive: new THREE.Color(accent), emissiveIntensity: 0.22, roughness: 0.45,
          envMapIntensity: 0.6,
        })));

        // A faint ruled surface: this is an operational floor work sits on,
        // not a blank tile.
        for (let i = -1; i <= 1; i++) {
          const line = plane(0.6, 0.004, glow(accent, 0.28));
          line.rotation.x = -Math.PI / 2;
          line.position.set(0, 0.0905, i * 0.13);
          g.add(line);
        }

        // The one piece allowed to bloom: the state signal strip.
        g.add(box(0.46, 0.008, 0.014, 0, 0.092, 0.25, glow(accent)));
        g.add(halo(0, 0.095, 0.25, 0.3, accent, 0.4));

        return { group: g, anchor: 0.16 };
      },
    },
    {
      id: 'human-glyph',
      name: 'Human Glyph',
      meaning: 'Human responsibility or judgement. Always grey: a person is not a state.',
      drivenBy: 'Person / Role record',
      stateDriven: false,
      build() {
        const g = new THREE.Group();
        const m = solid(palette.human, { roughness: 0.72 });

        // Four pieces, icon proportions rather than human proportions: the head
        // is oversized on purpose, because this has to stay legible as a person
        // at the size it actually renders on an island.
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.078, 0.01, 20), solid(palette.massDark));
        base.position.y = 0.005;
        g.add(base);

        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.075, 4, 14), m);
        torso.position.y = 0.12;
        g.add(torso);

        const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.086, 3, 10), m);
        shoulders.rotation.z = Math.PI / 2;
        shoulders.position.y = 0.163;
        g.add(shoulders);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.056, 16, 14), m);
        head.position.y = 0.253;
        g.add(head);

        return { group: g, anchor: 0.32 };
      },
    },
    {
      id: 'tool-glyph',
      name: 'Tool Glyph',
      meaning: 'A system the company works through — CRM, email, calendar, ERP.',
      drivenBy: 'Tool record',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        g.add(box(0.05, 0.03, 0.05, 0, 0.015, 0, solid(palette.massMid)));   // stand
        g.add(box(0.028, 0.06, 0.028, 0, 0.06, 0, solid(palette.massMid)));  // neck
        g.add(box(0.3, 0.2, 0.035, 0, 0.2, 0, solid(palette.massDark)));     // terminal
        const face = plane(0.25, 0.15, glow(accent, 0.55));
        face.position.set(0, 0.2, 0.019);
        g.add(face);
        return { group: g, anchor: 0.33 };
      },
    },
    {
      id: 'knowledge-slab',
      name: 'Knowledge Slab',
      meaning: 'Policy, procedure or company memory being used at a step. Evidence, not a place.',
      drivenBy: 'Knowledge object',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        const slab = box(0.34, 0.012, 0.26, 0, 0.2, 0, glass(0.66));
        slab.rotation.set(-0.34, 0.22, 0);
        g.add(slab);
        // Three line marks: a document is readable content, not a blank tile.
        [-0.06, 0, 0.06].forEach((z, i) => {
          const line = plane(0.2 - i * 0.04, 0.012, glow(accent, 0.5));
          line.rotation.set(-Math.PI / 2, 0, 0);
          line.position.set(-0.01 * i, 0.008, z);
          slab.add(line);
        });
        g.add(box(0.012, 0.2, 0.012, 0, 0.1, 0, glow(accent, 0.18)));    // float tether
        return { group: g, anchor: 0.32 };
      },
    },
    {
      id: 'workflow-line',
      name: 'Workflow Line',
      meaning: 'Work moving between elements. Grey when human-led, teal when autonomous.',
      drivenBy: 'Workflow record',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        const curve = flowCurve();
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.008, 6, false), glow(accent, 0.5)));
        // Endpoints: a flow connects two real things.
        [0, 1].forEach((u) => {
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), glow(accent, 0.85));
          node.position.copy(curve.getPointAt(u));
          g.add(node);
        });
        return { group: g, anchor: 0.34 };
      },
    },
    {
      id: 'decision-gate',
      name: 'Decision Gate',
      meaning: 'A point where work stops and waits for human authority.',
      drivenBy: 'Decision record',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        const post = solid(palette.massDark);
        [-0.17, 0.17].forEach((x) => g.add(box(0.035, 0.3, 0.035, x, 0.15, 0, post)));
        g.add(box(0.375, 0.035, 0.035, 0, 0.3, 0, post));                 // lintel
        // The checkpoint itself: work must pass through this ring.
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.011, 8, 28), glow(accent));
        ring.position.set(0, 0.15, 0);
        g.add(ring);
        g.add(halo(0, 0.15, 0, 0.36, accent, 0.45));
        g.add(box(0.3, 0.004, 0.06, 0, 0.002, 0, glow(accent, 0.22)));    // floor mark
        return { group: g, anchor: 0.4 };
      },
    },
    {
      id: 'action-pulse',
      name: 'Action Pulse',
      meaning: 'One autonomous action executing right now. Motion means an event, never ambience.',
      drivenBy: 'Action / Event stream',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        const curve = flowCurve();
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.006, 6, false), glow(accent, 0.22)));
        const mote = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), glow(accent));
        g.add(mote);
        const flare = halo(0, 0, 0, 0.3, accent, 0.8);
        g.add(flare);
        const trail = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), glow(accent, 0.2));
        g.add(trail);
        return {
          group: g,
          anchor: 0.34,
          update(t) {
            const u = (t * 0.34) % 1;
            mote.position.copy(curve.getPointAt(u));
            flare.position.copy(mote.position);
            trail.position.copy(curve.getPointAt(Math.max(0, u - 0.06)));
          },
        };
      },
    },
    {
      id: 'risk-hotspot',
      name: 'Risk Hotspot',
      meaning: 'An exception asking for attention. The only element allowed to interrupt the field.',
      drivenBy: 'Exception / open item',
      stateDriven: true,
      build(accent) {
        const g = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.007, 8, 32), glow(accent, 0.8));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.004;
        g.add(ring);
        g.add(box(0.022, 0.26, 0.022, 0, 0.13, 0, glow(accent, 0.55)));   // shaft
        const mote = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), glow(accent));
        mote.position.y = 0.29;
        g.add(mote);
        const flare = halo(0, 0.29, 0, 0.4, accent, 0.75);
        g.add(flare);
        g.add(halo(0, 0.01, 0, 0.46, accent, 0.3));
        return {
          group: g,
          anchor: 0.4,
          update(t) {
            // A slow breath, not a flash. Attention should persist, not blink.
            const k = 1 + Math.sin(t * 2.1) * 0.12;
            mote.scale.setScalar(k);
            ring.scale.setScalar(1 + Math.sin(t * 2.1) * 0.05);
          },
        };
      },
    },
  ];

  return { palette, stateColor, elements };
}
