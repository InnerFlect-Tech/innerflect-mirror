# Innerflect Mirror — Product and UI Structure

Status: active product contract  
Last aligned with UI: 2026-09-13

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
| Work | What work exists, how does it happen, and what should change? | Workflows and capabilities |
| Decisions | Where does the company need human judgement? | Human authority layer |
| Knowledge | What does the company know, why, and where is it used? | Trusted knowledge objects |
| Impact | Is autonomy making the company better? | Verified business value |
| Settings | What may the system know, access, and do? | Company constitution |

Adaptive workspaces may reorganise around a user's intent, but they must not replace this stable world.

## Company

The first viewport must answer within two seconds:

> Your company is operating normally.

Then show the essential pulse: `68% autonomous · 1,284 actions today · 3 things need you`.

The dominant object is a living operational world, not a widget dashboard. It has two views over identical data:

- **Visual:** spatial company world. Selecting an area brings its work, people, agents, policies, and decisions into context.
- **Practical:** table of area, state, active work, autonomy, and attention.

Desktop is exploratory. Mobile is a compact Company Pulse focused on health, activity, and exceptions. Healthy systems become quiet; information moves from the periphery to the centre only when necessary.

## Work

Use **Work**, not Processes. Every workflow follows:

`Trigger → Context → Work → Decision → Action → Verification → Outcome`

A Work object can expose outcome, trigger, inputs, participants, systems, steps, exceptions, owner, volume, cycle time, human effort, cost, error rate, autonomy, risk, knowledge, policies, and outcome quality.

Autonomy is earned, not toggled. Progress requires evidence: successful observations, decision agreement, policy coverage, reversibility, low exception rate, and passed evaluations.

## Decisions

A large queue is a system failure. Default message: **3 decisions need you. Everything else is running.**

Each decision contains situation, urgency, recommendation, alternatives, evidence, policy, risk, confidence, reversibility, exposure, downstream effect, deadline, authority, comparable decisions, and historical outcomes.

Actions are `Approve · Modify · Decline · Simulate`. Repeated judgement should produce a policy suggestion, converting tacit knowledge into institutional memory.

## Knowledge

Knowledge is not a document repository. Files are evidence for knowledge.

Knowledge objects include policies, procedures, decisions, experience, exceptions, customers, products, people, projects, rules, definitions, and external requirements. Each exposes trust, confidence, owner, freshness, use, sources, conflicts, related decisions, related workflows, and last verification against reality.

Mirror should reveal differences between documented procedures and observed behaviour.

## Impact

Impact is the proof layer. Prefer human capacity returned, operating cost avoided, revenue protected, response and cycle-time improvement, errors prevented, SLA improvement, verified autonomous work, human correction, unsafe actions, and safe recovery.

Every claim is traceable: `Impact → Work → Execution → Action → Decision → Policy → Evidence → Source event`.

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
- The company world dominates. Supporting panels remain subordinate.
- Motion explains live events, execution, handoffs, verification, learning, or escalation. No ambient particles.
- Gamification represents earned maturity, evidence, and verified outcomes. No arbitrary points.

## Prototype alignment

The implemented Company surface contains company health, the essential pulse, Visual and Practical views, a spatial operational world, visible agent work and handoffs, contextual domain inspection, a short judgement queue, and evidence-oriented autonomy maturity.

All operational figures are representative mock data until live integrations exist. Never present them as verified company truth.

## Change discipline

For each meaningful UI change:

1. Update this file first when the product model, navigation, objects, or visual grammar changes.
2. Implement from this contract.
3. Check labels, states, metrics, and interactions against it.
4. Preserve the semantic meanings of teal, amber, and red.
5. Confirm autonomous actions retain authority, evidence, outcome, and auditability.
6. Update **Last aligned with UI** when contract and implementation match.
