# Innerflect Mirror — Product and UI Structure

Status: active product contract  
Last aligned with UI: 2026-09-14

Implementation baseline: React Three Fiber 9.7.0 · Drei 10.7.8 · React Postprocessing 3.1.1 · maath 0.10.8 · Three.js 0.186.0 · React 19.2

The 3D world is built to `99 System/AI/Rules/Code/threejs-r3f.md`. That rule is the authority for how the scene is written; this file is the authority for what it means.

## Product definition

Innerflect Mirror is the operational digital twin of a company. It observes how the organisation works, reconstructs operational reality, preserves organisational knowledge, and progressively moves eligible work through:

`Human-led → Observed → Assisted → Supervised → Autonomous`

Mirror has two modes over one company model. **Mirror mode** reconstructs and shows how the company actually operates. **Builder mode** lets a person redesign how it should operate. The system should reconstruct workflows from connected tools first; people review and correct that evidence-backed model rather than drawing the company from a blank canvas.

The operating loop is `Connect → Observe → Reconstruct → Improve → Simulate → Approve → Automate → Verify → Learn`. Builder mode is a constrained visual language, not a generic node canvas. Every workflow retains the canonical spine `Trigger → Context → Work → Decision → Action → Verification → Outcome`, and every published step names the record moving through it, its actor, control mode, tools, authority, evidence and observable result.

The product distinction is deliberate: workflow tools primarily describe what software should execute; Mirror shows what the company is actually doing across people, AI agents, deterministic systems, knowledge, decisions, permissions, exceptions and verified business outcomes.

The visible product object is the company. Agents appear only as workers acting inside that company model.

Promise: **See how your company works. Make it run itself.**

Governing rule: **Every autonomous action must have authority, evidence, an observable outcome, and an audit trail.**

## Innerflect ecosystem

Mirror is one projection inside a larger system with two users and two Shops. The
surfaces share one company graph, one typed operation catalogue, and one evidence trail;
they are not separate products that happen to link to each other.

### Repository boundary

This repository is the source and coordination environment for the **full Innerflect
ecosystem**, not only the Mirror product. Mirror is the operational core, and this
repository holds the shared model and the in-repo entry surfaces for it. Studio, Admin
and the main website are **live products hosted outside this repository** — this
repository does not build or deploy them, and only registers their existence and entry
points so the ecosystem index stays honest about the whole environment:

- Mirror and the free/open Open Mirror edition (in this repository);
- OS Shop and Forge Shop (in this repository, planned);
- Studio (live, external — studio.innerflect.tech) and Admin (live, external — reached by
  signing in at innerflect.tech/auth/sign-in);
- the main website (live, external — innerflect.tech), the public entry point to the whole
  ecosystem;
- the company graph, typed operation catalogue, governance, knowledge, agent runtime,
  integrations, identity/access, audit and outcomes;
- the design system, ecosystem index, diagrams and conformance tooling that keep every
  surface aligned.

One repository does not mean one undifferentiated application. Studio, Admin and the main
website are proof that products in this ecosystem can be separate deployments or hosts,
each keeping its own audience and access boundary, while still needing to agree with the
same records, tokens, operations and semantic registry this repository defines — so a
change to the system does not silently drift from what those external products show.

| Entry surface | Canonical location | Audience / access |
|---|---|---|
| Main website | innerflect.tech (external) | Public; live |
| Ecosystem index | /ecosystem | Public map of the full environment; planned |
| Open Mirror | /open-mirror | Self-builder; public/open; planned |
| OS Shop | /shops/os | Self-builder; public patterns; planned |
| Forge Shop | /shops/forge | Public catalogue with gated proprietary capabilities; planned |
| Mirror | / and /mirror | Authenticated company operator; live |
| Studio | studio.innerflect.tech (external) | Managed client; authenticated; live |
| Admin | innerflect.tech/auth/sign-in (external) | Innerflect team; internal; live |
| Design and system surfaces | /design/* | Development and conformance; partially live |

Paths without "(external)" are canonical inside the repository; deployment hosts may map
them differently later without changing product identity. Surfaces marked "(external)" are
not repository paths at all — they are the real hosted locations, recorded here so this
document and ECOSYSTEM_PAGES do not describe a product as planned once it already exists.
ECOSYSTEM_PAGES records every entry point and its implementation state.

| Audience | Journey | What they receive |
|---|---|---|
| Self-builder | Open Mirror → OS Shop → Forge Shop | A free/open operational twin, patterns for an operating system, and reusable open components to build their own OS. |
| Managed client | Managed OS → Forge → Studio → Mirror | A managed operating system, proprietary Forge capabilities, a client project workspace, and a live operational twin. |
| Innerflect team | Innerflect Mirror → Admin → managed clients | The same operational twin for Innerflect itself, plus the internal delivery and governance console. |

### Product roles

| Product | Role in the ecosystem |
|---|---|
| Main website | Innerflect's public marketing site and shared entry point (innerflect.tech). Live, hosted outside this repository. |
| Mirror | The operational twin and constrained visual builder. It has a simpler free/open edition for self-builders. |
| OS Shop | Patterns, playbooks and proven operating-system architectures. |
| Forge Shop | Reusable design and implementation components: open components for self-builders and proprietary capabilities for managed clients. |
| Studio | Client-facing project, evidence and collaboration workspace for a managed operating system. Live, hosted outside this repository at studio.innerflect.tech. |
| Admin | Innerflect's internal delivery, access, integration and governance console. Live, hosted outside this repository; reached by signing in at innerflect.tech/auth/sign-in. |

### One mechanism under every surface

A human in the UI and an agent acting through an integration use the same typed operation:

Interface or agent → typed operation → policy and authority → effect → event → verification → outcome → Mirror

The ecosystem board is an executable index, not a second source of truth. Product meaning
is defined here; lib/design/ecosystem.ts exposes the registered nodes, relations and pages;
the board projects that registry. ECOSYSTEM_PAGES registers every route across the full
environment with its owning surface, source file, access boundary, purpose and implementation
state.

The board's change contract is intentionally two-way:

1. Canonical product or implementation source → registry validation → board projection.
2. Board draft → authenticated typed operation → canonical authority → validation → event or commit → refreshed projection.

A browser draft or localStorage value is never canonical. The public repository contains
no secrets, customer data or private infrastructure coordinates.

## Stable product world

| Surface | Question | Primary object |
|---|---|---|
| Company | Is my company okay, and where should I look? | Operational digital twin |
| Mirror | What would this company be if the work it already does ran itself? | The company reflected as a system |
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
The Company surface also carries the audit trail as a readable sequence rather than a ticker. Every entry names who acted — the system, or the person — and carries the record reference, and the step where a human was required is marked. A feed that only says "something happened" satisfies none of authority, evidence, outcome or audit.

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

## Mirror

Its own surface, not a view inside Company. Company answers *is my company okay*; Mirror answers *what would this company be if the work it already does ran itself*.

Both columns carry the same rows and the same number of steps, on purpose: the work does not shrink, only the share of it a person has to carry. The only thing that changes between the two sides is who performs each step, and that difference is the whole argument.

Mirror has two layouts over the same comparison, because they answer different questions:

- **Split** — the two states lined up so they can be counted against each other. Answers *how much of each department is still carried by a person*.
- **Radial** — the company at the centre, departments around it. **Position carries meaning**: a department sits on the left while a person still carries the work and moves across once it runs itself, so the layout is a progress bar read at a glance. Answers *where is the company in the migration*. Carries the workflow example with its human-approval gate and the timestamped audit log beside it.

Steps are rendered as icon tiles rather than words, so the read is a count of grey against teal rather than two paragraphs; shape carries meaning before colour does — a circle is a person, a square is work. Labels remain available as tooltips and to assistive technology, and one workflow is spelled out in full beneath the rows.

The right-hand column is a **projection, not a measurement**, and must always be labelled as such on the surface itself. A projection presented as fact is the most dangerous number in the product, because it is the one a person would act on — quote to a board, or plan headcount against.

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

Four invariants hold across every surface:

- **Actor identity and control mode are separate axes.** Actor kinds are human, AI agent, deterministic system and external system. Control modes are human-led, assisted, supervised, autonomous and blocked. Neither implies the other: a deterministic system can be blocked, and a human can work under supervision.
- **This is not the autonomy ladder.** `Human-led → Observed → Assisted → Supervised → Autonomous` is *earned maturity* of a workflow, moved only by evidence. Control mode is *how a step runs right now*. `Observed` is a rung, not a mode; `blocked` is a mode, not a rung. Conflating them is the mistake this paragraph exists to prevent.
- **Every selectable visual object carries a stable record id and record type.** Clicking it resolves to the same object the HTML surfaces use. An `id` alone is not identity — ids repeat across collections.
- **A workflow definition is not an execution.** An execution carries the specific business record moving through the steps, with its events, timestamps, decisions, verification and outcome.

Objects retain identity across surfaces. Information is organised by why it matters now, not by its source system.

## Visual and interaction grammar

- Canvas `#080C0C`; surfaces `#0D1313`–`#111918`; text `#EEF3F1`; secondary `#778581`.
- Teal `#55CBBB` means safe machine operation, never decoration.
- Amber `#D8A34D` means human attention or caution.
- Red `#E16D5D` means risk, blocked action, or unsafe state.
- Inter is the product face; compact uppercase is reserved for system metadata.
- Type uses a fixed scale in `rem`, exposed as custom properties: `--fs-xs` 12 · `--fs-sm` 13 · `--fs-md` 14 · `--fs-lg` 16 · `--fs-xl` 20 · `--fs-2xl` 24 · `--fs-3xl` 30. **Nothing renders below 12px.** Density comes from spacing, weight and colour — never from shrinking text past the legibility floor. Icon-only glyphs inside a badge are not text and may sit below the floor.
- The state palette has exactly one definition, `lib/tokens/source/state.ts` (`lib/tokens/state.ts` is a re-export shim). The stylesheet receives it as generated custom properties (`--state-<state>-label`) and the WebGL scene imports the same object, so "state decides colour" is enforced mechanically rather than by discipline. Emissive values stay beside the renderer, because they mean nothing outside one.
- The company world dominates. Supporting panels remain subordinate.
- Motion explains live events, execution, handoffs, verification, learning, or escalation. No ambient particles.
- Gamification represents earned maturity, evidence, and verified outcomes. No arbitrary points.
- The world has five visual layers: dark plane, stable domain islands, low-detail semantic objects, operational connections, and semantic state.
- Visual hierarchy is strict: Company is brightest and largest; domains are secondary; connections are thin; background geometry nearly disappears; only attention and critical states interrupt teal.
- Scene states are `neutral · active · attention · critical`. State—not department identity—determines color. (`healthy` merged into `active` 2026-09-14: they read as one word, "Healthy", everywhere a user saw either; see docs/DECISIONS.md.)
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
- The main camera is orthographic and architectural. Orbit is drag-or-arrow-keys with a reset, because rotation is exploration and needs a way back; it is bounded, never free-fly. Pointer parallax and controlled focus complete the grammar.
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
- Measured home scene: **61 draw calls, 19,479 triangles** against a budget of 120 and 200k. `window.__mirrorGL` exposes the renderer in development so the number can be checked rather than assumed.
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
- All six surfaces are real routes, and all six are built. They were stubs once; `SurfaceStub` is now an orphan awaiting deletion. Navigation is links, never buttons.
- No CSS framework and no component library. The design language is hand-written against the token scale; a half-installed library is worse than either choice.

## Change discipline

For each meaningful UI change:

1. Update this file first when the product model, navigation, objects, or visual grammar changes.
2. Implement from this contract.
3. Check labels, states, metrics, and interactions against it.
4. Preserve the semantic meanings of teal, amber, and red.
5. Confirm autonomous actions retain authority, evidence, outcome, and auditability.
6. Update **Last aligned with UI** when contract and implementation match.
