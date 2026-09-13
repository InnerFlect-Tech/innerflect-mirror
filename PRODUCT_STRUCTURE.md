# Innerflect Mirror — Product and UI Structure

Status: active product contract  
Last aligned with UI: 2026-09-13

Implementation baseline: React Three Fiber 9.7.0 · Drei 10.7.8 · React Postprocessing 3.1.1 · maath 0.10.8 · Three.js 0.186.0 · React 19.2

The 3D world is built to `99 System/AI/Rules/Code/threejs-r3f.md`. That rule is the authority for how the scene is written; this file is the authority for what it means.

## Product definition

Innerflect Mirror is the operational digital twin of a company. It observes how the organisation works, reconstructs operational reality, preserves organisational knowledge, and progressively moves eligible work through:

`Human-led → Observed → Assisted → Supervised → Autonomous`

The visible product object is the company. Agents appear only as workers acting inside that company model.

Promise: **See how your company works. Make it run itself.**

Governing rule: **Every autonomous action must have authority, evidence, an observable outcome, and an audit trail.**

## Stable product world

| Surface | Question | Primary object |
|---|---|---|
| Company | Is my company okay, and where should I look? | Operational digital twin |
| Processes | How does work flow through the company, and what should change? | Workflows and capabilities |
| Approvals | Where does the company need human judgement? | Human authority layer |
| Knowledge | What does the company know, why, and where is it used? | Trusted knowledge objects |
| Outcomes | Is autonomy making the company better? | Verified business value |
| Settings | What may the system know, access, and do? | Company constitution |

Adaptive workspaces may reorganise around a user's intent, but they must not replace this stable world.

## Company

The first viewport must answer within two seconds:

> Your company is operating normally.

Then show the essential pulse: `68% autonomous · 1,284 actions today · 3 things need you`.

The dominant object is a living operational world, not a widget dashboard. It has two views over identical data:

- **Visual:** spatial company world. Selecting an area brings its work, people, agents, policies, and decisions into context.
- **Practical:** table of area, state, active work, autonomy, and attention.

### Operational domains

Domains are the islands of the company world. They are **not** an org chart — org charts are not portable across companies. A domain is a stage in the path a euro takes through the organisation, which every company has without exception:

`Attention → Commitment → Fulfilment → Cash`

The core four, present in every company:

| Domain | Question it answers | Entry point |
|---|---|---|
| Market | How does the market find us? | Web Intelligence |
| Sales | How does interest become commitment? | Revenue Loop |
| Delivery | How does a promise become a delivered outcome? | Operations System |
| Finance | How does delivered work become cash? | Custom System Build |

Conditional domains join the world only when the company's operating reality contains them — **People** where capacity and roles are managed work, **Supply** where inputs are a real chain. The renderer holds a curated composition for each supported node count (4, 5, 6); layouts are designed, never force-directed.

Two things that look like domains are deliberately not domains:

- **Governance is a layer, not a place.** Authority, evidence, and audit are properties of every action in every domain. Governance is what turns a domain amber or red; it never occupies an island of its own. Giving it a permanent island would put category in competition with state for the colour channel.
- **Knowledge is a surface, not a place.** It is the substrate every domain draws on, and already has its own top-level surface. An island would duplicate it.

Mirror is the Strategic Assessment made continuous: the assessment maps how work, decisions, and data move through the organisation, and the world is that map kept live. Each remaining entry point lights up one region of an existing world rather than adding a new one.

Desktop is exploratory. Mobile is a compact Company Pulse focused on health, activity, and exceptions. Healthy systems become quiet; information moves from the periphery to the centre only when necessary.

## Processes

**Naming changed 2026-09-13.** This surface was called *Work*, on the reasoning that "Work" names the thing and "Processes" names the paperwork. The interface direction went the other way: owners say *processes*, and the word carries its own mental model of a sequence with steps. The underlying object is still a Workflow, and the seven canonical stages are unchanged — only the surface name moved. Same reasoning applies to Decisions → **Approvals** and Impact → **Outcomes**.

Every workflow follows:

`Trigger → Context → Work → Decision → Action → Verification → Outcome`

A Work object can expose outcome, trigger, inputs, participants, systems, steps, exceptions, owner, volume, cycle time, human effort, cost, error rate, autonomy, risk, knowledge, policies, and outcome quality.

Autonomy is earned, not toggled. Progress requires evidence: successful observations, decision agreement, policy coverage, reversibility, low exception rate, and passed evaluations.

## Approvals

A large queue is a system failure. Default message: **3 decisions need you. Everything else is running.**

Each decision contains situation, urgency, recommendation, alternatives, evidence, policy, risk, confidence, reversibility, exposure, downstream effect, deadline, authority, comparable decisions, and historical outcomes.

Actions are `Approve · Modify · Decline · Simulate`. Repeated judgement should produce a policy suggestion, converting tacit knowledge into institutional memory.

## Knowledge

Knowledge is not a document repository. Files are evidence for knowledge.

Knowledge objects include policies, procedures, decisions, experience, exceptions, customers, products, people, projects, rules, definitions, and external requirements. Each exposes trust, confidence, owner, freshness, use, sources, conflicts, related decisions, related workflows, and last verification against reality.

Mirror should reveal differences between documented procedures and observed behaviour.

## Outcomes

Outcomes are the proof layer. Prefer human capacity returned, operating cost avoided, revenue protected, response and cycle-time improvement, errors prevented, SLA improvement, verified autonomous work, human correction, unsafe actions, and safe recovery.

Every claim is traceable: `Outcome → Process → Execution → Action → Decision → Policy → Evidence → Source event`.

## Company constitution

Settings defines machine-readable boundaries: organisation structure, integrations, data access, sources, policies, authority and financial limits, risk levels, roles, audit retention, and model permissions.

## Shared domain model

`Company · Domain · Workflow · Step · Tool · Person/Role · Knowledge · Policy · Authority · Agent · Action · Event · Decision · Outcome · Audit Record`

Objects retain identity across surfaces. Information is organised by why it matters now, not by its source system.

## Visual and interaction grammar

- Canvas `#080C0C`; surfaces `#0D1313`–`#111918`; text `#EEF3F1`; secondary `#778581`.
- Teal `#55CBBB` means safe machine operation, never decoration.
- Amber `#D8A34D` means human attention or caution.
- Red `#E16D5D` means risk, blocked action, or unsafe state.
- Inter is the product face; compact uppercase is reserved for system metadata.
- Type uses a fixed scale in `rem`, exposed as custom properties: `--fs-xs` 12 · `--fs-sm` 13 · `--fs-md` 14 · `--fs-lg` 16 · `--fs-xl` 20 · `--fs-2xl` 24 · `--fs-3xl` 30. **Nothing renders below 12px.** Density comes from spacing, weight and colour — never from shrinking text past the legibility floor. Icon-only glyphs inside a badge are not text and may sit below the floor.
- The state palette has exactly one definition, `lib/tokens/state.ts`. The stylesheet receives it as generated custom properties (`--state-<state>-label`) and the WebGL scene imports the same object, so "state decides colour" is enforced mechanically rather than by discipline. Emissive values stay beside the renderer, because they mean nothing outside one.
- The company world dominates. Supporting panels remain subordinate.
- Motion explains live events, execution, handoffs, verification, learning, or escalation. No ambient particles.
- Gamification represents earned maturity, evidence, and verified outcomes. No arbitrary points.
- The world has five visual layers: dark plane, stable domain islands, low-detail semantic objects, operational connections, and semantic state.
- Visual hierarchy is strict: Company is brightest and largest; domains are secondary; connections are thin; background geometry nearly disappears; only attention and critical states interrupt teal.
- Scene states are `neutral · healthy · active · attention · critical`. State—not department identity—determines color.
- Hover is restrained. Selection raises and clarifies an island, dims unrelated context, updates the HTML inspector, and smoothly reframes the camera.
- A selected domain unfolds in place over time; semantic zoom should preserve context instead of navigating to a disconnected page.
- Company, Flow, and Decision views must reuse the same objects and animate between curated layout families.

## 3D implementation architecture

The production visual world is a React Three Fiber scene whose objects are projections of the same Company and Domain records used by the HTML interface. The scene is never a separate source of truth.

- React Three Fiber owns the scene graph and interaction bridge.
- Drei provides cameras, model loading, line geometry, shadows, instancing, and adaptive performance helpers.
- Three.js is pinned beneath the stable R3F line. Experimental R3F alpha releases are not used in production.
- Each scene object receives a stable domain-object identifier and emits selection intent back to application state.
- Accessible HTML controls remain available for every meaningful 3D interaction.
- The Canvas provides a non-WebGL fallback, respects reduced motion, limits device pixel ratio, and uses on-demand complexity rather than unlimited effects.
- Custom GLB assets will replace procedural prototype geometry without changing the domain contract.
- Animation states express work: idle, moving, acting, waiting, verifying, escalating, and handing off.
- The main camera is a locked orthographic architectural view. Normal use has no free orbit; pointer parallax and controlled focus are the camera grammar.
- Platforms use a layered construction: soft shadow, dark bevelled shell, illuminated inner surface, restrained edge highlight, low-detail semantic miniature.
- Connections are designed three-dimensional infrastructure curves. Static low-luminance paths carry short, event-driven pulses; the whole path never flashes.
- Lighting stays neutral and nearly invisible. Teal appears to originate inside verified machine activity, not from global colored lighting.
- Labels and all meaningful controls remain accessible HTML. WebGL is the spatial model only—not the application shell.
- Mobile does not render the interactive 3D world; it receives an equivalent compact operational state.
- Performance target for the desktop home scene is fewer than 120 draw calls and 200k triangles, with shared geometry/materials and instancing for repeated objects.
- State carries two separate emissive channels. The island's inner surface is tone-mapped and always below 1, so a platform glows without blooming; only small HDR accents — the signal strip, the company core, connection pulses — sit above the bloom threshold of 1. A whole platform that blooms reads as a light panel, not as dark glass catching light from inside the system.
- Bloom is selective by threshold, never global intensity.
- Physical `transmission` is reserved for cases that demonstrably earn it. Three renders the entire scene into a transmission target once per transmissive object, so glass platforms are built from clearcoat over a dark base against the studio environment instead. Removing transmission from five objects took the home scene from 224 to 100 draw calls.
- The scene environment is built from lightformers rather than a downloaded HDR: no network request, and no foreign colour cast in a scene whose palette is the point.
- Contact shadows are baked on mount. Left dynamic they re-render the whole scene into a depth target every frame, for a blur that cannot resolve the hover lift.
- Camera zoom is derived from the viewport against a fixed world frame, never a constant, so the composition neither crops on a narrow pane nor drowns in floor on a wide one.
- Measured home scene: **100 draw calls, 21k triangles** against a budget of 120 and 200k. `window.__mirrorGL` exposes the renderer in development so the number can be checked rather than assumed.
- Nothing allocates or calls `setState` inside the frame loop. Scratch vectors are hoisted to module scope, and all easing uses delta-corrected `damp`/`damp3`, never a fixed `lerp` factor — a fixed factor eases twice as fast at 120fps as at 60.
- The scene renders on demand. It is only continuous while work is flowing; paused, or for a viewer who asked for reduced motion, it issues **zero draw calls** and each easing requests frames only until it settles.
- `PerformanceMonitor` scales DPR between 1 and 2 to the device that actually turned up.
- Mobile never creates a WebGL context. The world is gated in React, not hidden in CSS.
- **Renderer choice is WebGL, deliberately.** The R3F rule prefers `WebGPURenderer` for greenfield work, but the documented blocker is that legacy `EffectComposer` post-processing is unsupported on WebGPU — and selective bloom is load-bearing for this scene's entire visual language. Revisit when postprocessing parity lands; treat it as a project, not a config flag.
- The official pmndrs documentation and MCP-compatible documentation endpoint are the technical authority for R3F/Drei implementation patterns.

## Prototype alignment

The implemented Company surface contains company health, the essential pulse, Visual and Practical views, a spatial operational world, visible agent work and handoffs, contextual domain inspection, a short judgement queue, and evidence-oriented autonomy maturity.

All operational figures are representative mock data until live integrations exist. Never present them as verified company truth.

## Application architecture

The shell is a React Server Component tree. Only what needs interactivity crosses to the client:

| Server (ships no JS) | Client |
|---|---|
| `AppShell` · `Rail` · `TopBar` · `Hero` · `Impact` · `SurfaceStub` · every `page.tsx` | `CompanyWorkspace` · `PracticalTable` · `DomainInspector` · `NeedsYou` · `LiveActionCount` · the whole 3D world |

- The domain model lives in `lib/model/`, the records in `data/company.ts`, the palette in `lib/tokens/state.ts`. `WorldDomain` is a `Pick<>` of `Domain`, so the scene is a projection **by construction** rather than by discipline.
- Agent activity is the contract's seven-state union, not a free string.
- The `Impact` panel renders on the server and is passed into the client workspace as a slot, so a static panel is not dragged across the boundary to sit inside an interactive grid.
- All six surfaces are real routes. Five are honest stubs that name the question that surface exists to answer and say plainly that it is not built. Navigation is links, never buttons.
- No CSS framework and no component library. The design language is hand-written against the token scale; a half-installed library is worse than either choice.

## Change discipline

For each meaningful UI change:

1. Update this file first when the product model, navigation, objects, or visual grammar changes.
2. Implement from this contract.
3. Check labels, states, metrics, and interactions against it.
4. Preserve the semantic meanings of teal, amber, and red.
5. Confirm autonomous actions retain authority, evidence, outcome, and auditability.
6. Update **Last aligned with UI** when contract and implementation match.
