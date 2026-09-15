/**
 * The executable index of the Innerflect ecosystem.
 *
 * Product meaning remains in PRODUCT_STRUCTURE.md. This file gives the app a typed,
 * source-backed projection that can be rendered by the board and checked by tooling.
 * It is intentionally not a database: production writes must go through the typed,
 * authenticated operation path described in the product contract.
 */

/**
 * One grouping, four values — not the three overlapping taxonomies this file
 * used to carry (category, kind and shape all said slightly different things
 * about the same node). These four are the only kinds of thing that are real:
 * something you can open, the system itself, a layer it is made of, and what
 * it stands on.
 */
export type EcosystemCategoryId = 'surfaces' | 'system' | 'layers' | 'foundations';

export type ImplementationState = 'live' | 'building' | 'planned' | 'external';

export type EcosystemNodeId =
  | 'main-website'
  | 'os-shop'
  | 'forge-shop'
  | 'open-mirror'
  | 'mirror'
  | 'studio'
  | 'admin'
  | 'company-os'
  | 'assessment'
  | 'knowledge-spine'
  | 'web-intelligence'
  | 'revenue-loop'
  | 'operations-system'
  | 'company-graph'
  | 'analytics'
  | 'integration-events'
  | 'data-identity';

export type EcosystemRelationKind =
  | 'composed-of'
  | 'runs-on'
  | 'extends-into'
  | 'operates-in'
  | 'runs-through'
  | 'supplies'
  | 'projects'
  | 'grounds';

export type EcosystemSourceAuthority =
  | 'product'
  | 'implementation'
  | 'coordination'
  | 'external';

export type EcosystemSource = {
  authority: EcosystemSourceAuthority;
  path: string;
};

export type EcosystemNode = {
  id: EcosystemNodeId;
  name: string;
  category: EcosystemCategoryId;
  summary: string;
  detail: string;
  state: ImplementationState;
  position: { x: number; y: number };
  source: EcosystemSource;
};

export type EcosystemRelation = {
  id: string;
  from: EcosystemNodeId;
  to: EcosystemNodeId;
  kind: EcosystemRelationKind;
  label: string;
};

export type EcosystemEntryId =
  | 'environment'
  | 'main-website'
  | 'open-mirror'
  | 'os-shop'
  | 'forge-shop'
  | 'mirror'
  | 'studio'
  | 'admin'
  | 'design-system';

export type EcosystemPageGroupId =
  | 'environment'
  | 'build'
  | 'operate'
  | 'deliver'
  | 'design'
  | 'system';

export type EcosystemAccess = 'public' | 'authenticated' | 'internal' | 'development';

export type EcosystemPage = {
  id: string;
  name: string;
  surface: EcosystemEntryId;
  group: EcosystemPageGroupId;
  href: string;
  file: string;
  access: EcosystemAccess;
  purpose: string;
  state: ImplementationState;
};

export const REPOSITORY_SCOPE = {
  id: 'innerflect-environment',
  repository: 'InnerFlect-Tech/innerflect-mirror',
  statement:
    'The source and coordination environment for Mirror, Open Mirror, both Shops, Studio, Admin, shared engines, infrastructure and design system. Studio, Admin and the main website are live products hosted outside this repository; this registry only projects their existence and entry points.',
  operationalCore: 'mirror',
  entrySurfaces: [
    'environment',
    'main-website',
    'open-mirror',
    'os-shop',
    'forge-shop',
    'mirror',
    'studio',
    'admin',
    'design-system',
  ] satisfies readonly EcosystemEntryId[],
} as const;

export const ECOSYSTEM_CATEGORIES = [
  { id: 'surfaces', name: 'Surfaces', description: 'Something you can open. Every one has a real entry point.' },
  { id: 'system', name: 'Operating system', description: 'The system itself — one object, whoever owns it.' },
  { id: 'layers', name: 'Layers', description: 'The five capabilities an operating system is made of.' },
  { id: 'foundations', name: 'Foundations', description: 'The named things every layer stands on.' },
] as const satisfies readonly { id: EcosystemCategoryId; name: string; description: string }[];

const source = {
  product: (path: string): EcosystemSource => ({ authority: 'product', path }),
  implementation: (path: string): EcosystemSource => ({ authority: 'implementation', path }),
  coordination: (path: string): EcosystemSource => ({ authority: 'coordination', path }),
  external: (path: string): EcosystemSource => ({ authority: 'external', path }),
};

export const ECOSYSTEM_NODES: readonly EcosystemNode[] = [
  // Surfaces — the seven things that actually have an entry point.
  {
    id: 'main-website',
    name: 'Main website',
    category: 'surfaces',
    summary: 'Innerflect’s public site and the front door to everything.',
    detail: 'Hosted at innerflect.tech, outside this repository. Where a visitor first lands, where the five offers are sold, and where the team signs in before reaching Admin.',
    state: 'external',
    position: { x: 56, y: 80 },
    source: source.external('innerflect.tech'),
  },
  {
    id: 'os-shop',
    name: 'OS Shop',
    category: 'surfaces',
    summary: 'Patterns for designing an operating system.',
    detail: 'A catalogue of playbooks, architectures and proven operating patterns a self-builder can adapt. Prototyped at prototypes/innerflect-platforms/os.html.',
    state: 'building',
    position: { x: 430, y: 80 },
    source: source.implementation('prototypes/innerflect-platforms/os.html'),
  },
  {
    id: 'forge-shop',
    name: 'Forge Shop',
    category: 'surfaces',
    summary: 'Reusable design and implementation components.',
    detail: 'Open components serve self-builders; proprietary capabilities serve managed engagements. Prototyped at prototypes/innerflect-platforms/forge.html.',
    state: 'building',
    position: { x: 804, y: 80 },
    source: source.implementation('prototypes/innerflect-platforms/forge.html'),
  },
  {
    id: 'open-mirror',
    name: 'Open Mirror',
    category: 'surfaces',
    summary: 'The free edition of the operational twin.',
    detail: 'The simpler edition exposes the visual language and the operating model without requiring Innerflect-managed delivery.',
    state: 'building',
    position: { x: 1178, y: 80 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'mirror',
    name: 'Mirror',
    category: 'surfaces',
    summary: 'The operational twin and constrained builder.',
    detail: 'Mirror mode shows reality; Builder mode lets a person redesign it without losing authority, evidence or auditability.',
    state: 'live',
    position: { x: 1552, y: 80 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'studio',
    name: 'Studio',
    category: 'surfaces',
    summary: 'Client-facing project and collaboration workspace.',
    detail: 'Where a client follows evidence, decisions and delivery progress. Live at studio.innerflect.tech, outside this repository.',
    state: 'external',
    position: { x: 1926, y: 80 },
    source: source.external('studio.innerflect.tech'),
  },
  {
    id: 'admin',
    name: 'Admin',
    category: 'surfaces',
    summary: 'Innerflect’s internal delivery and governance console.',
    detail: 'Where the team runs managed systems, access, integrations and releases. Reached by signing in at innerflect.tech/auth/sign-in; live, outside this repository.',
    state: 'external',
    position: { x: 2300, y: 80 },
    source: source.external('innerflect.tech/auth/sign-in'),
  },

  /*
   * One of these, not three. A builder's, a client's and our own are the same
   * object with a different owner; who owns it is a journey, not a separate
   * node, so collapsing them took nine lines off the board.
   *
   * Named "Company operating system", not "Operating system": one of the five
   * layers below is Operations System, the delivery offer sold on
   * innerflect.tech. Two near-identical names on one board is a reading bug,
   * and the sold name is the one that cannot move.
   */
  {
    id: 'company-os',
    name: 'Company operating system',
    category: 'system',
    summary: 'The whole system for one company — all five layers together.',
    detail: 'A company-specific operating model with controlled access, evidence, integrations, workflows and outcomes. A self-builder assembles their own from the Shops; Innerflect delivers one for a client, and runs one on itself.',
    state: 'building',
    position: { x: 1178, y: 328 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },

  /*
   * The five operating layers. Not an invented taxonomy: they are the five
   * entry points Innerflect sells on innerflect.tech, and they are also what
   * an operating system is actually made of.
   */
  {
    id: 'assessment',
    name: 'Strategic Assessment',
    category: 'layers',
    summary: 'The entry offer: map the work before building anything.',
    detail: 'Maps how work, decisions, data and AI opportunities move through an organisation, so real leverage is found before infrastructure is built. Workflow review, AI opportunity map, decision criteria, 90-day roadmap.',
    state: 'live',
    position: { x: 430, y: 576 },
    source: source.external('innerflect.tech'),
  },
  {
    id: 'knowledge-spine',
    name: 'Knowledge Spine',
    category: 'layers',
    summary: 'The knowledge base: one trusted layer for people and agents.',
    detail: 'Structures internal knowledge into a trusted access layer so people, workflows and AI use the right information in context. Source of truth, access logic, retrieval paths, ownership model.',
    state: 'building',
    position: { x: 804, y: 576 },
    source: source.external('innerflect.tech'),
  },
  {
    id: 'web-intelligence',
    name: 'Web Intelligence',
    category: 'layers',
    summary: 'The website as an operating entry point, not a brochure.',
    detail: 'Turns the website into the front door of the system: positioning, intent capture, qualification and CRM handoff connected end to end.',
    state: 'live',
    position: { x: 1178, y: 576 },
    source: source.external('innerflect.tech'),
  },
  {
    id: 'revenue-loop',
    name: 'Revenue Loop',
    category: 'layers',
    summary: 'The selling mechanism: intent that never falls between tools.',
    detail: 'Connects lead intake, ownership, qualification and CRM logic so customer intent does not disappear between tools or teams.',
    state: 'building',
    position: { x: 1552, y: 576 },
    source: source.external('innerflect.tech'),
  },
  {
    id: 'operations-system',
    name: 'Operations System',
    category: 'layers',
    summary: 'The operations mechanism: delivery that is not run from chats.',
    detail: 'Connects onboarding, responsibilities, status logic and client visibility so delivery no longer depends on scattered chats and manual tracking.',
    state: 'building',
    position: { x: 1926, y: 576 },
    source: source.external('innerflect.tech'),
  },

  // Foundations — every one names a real tool, model or boundary.
  {
    id: 'company-graph',
    name: 'Company graph',
    category: 'foundations',
    summary: 'One record-backed model of the company.',
    detail: 'Workflows, actors, records, decisions, tools, knowledge, permissions, exceptions and outcomes share stable ids. Everything else writes into this.',
    state: 'building',
    position: { x: 617, y: 824 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'analytics',
    name: 'Analytics and observability',
    category: 'foundations',
    summary: 'Where you find out whether any of it is working.',
    detail: 'Grafana for operational dashboards and Umami for cookieless web analytics. Named because they are actual software the team runs.',
    state: 'building',
    position: { x: 991, y: 824 },
    source: source.external('grafana.com, umami.is'),
  },
  {
    id: 'integration-events',
    name: 'Integrations and events',
    category: 'foundations',
    summary: 'The connected tools that observe and report work.',
    detail: 'Connected tools produce evidence and events; they do not become a second model of the company.',
    state: 'planned',
    position: { x: 1365, y: 824 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'data-identity',
    name: 'Access and identity',
    category: 'foundations',
    summary: 'The boundary around every read and write.',
    detail: 'Identity, tenant scope, permissions and revision checks protect the canonical graph and its sensitive records.',
    state: 'planned',
    position: { x: 1739, y: 824 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
];

const OPERATING_LAYERS = [
  'assessment',
  'knowledge-spine',
  'web-intelligence',
  'revenue-loop',
  'operations-system',
] satisfies readonly EcosystemNodeId[];

export const ECOSYSTEM_RELATIONS: readonly EcosystemRelation[] = [
  // Structure: what the system is made of. One owner now, not three.
  ...OPERATING_LAYERS.map((layer) => ({
    id: `company-os-composed-of-${layer}`,
    from: 'company-os' as const,
    to: layer,
    kind: 'composed-of' as const,
    label: 'is made of',
  })),

  // What each layer stands on. Every target names a real tool or boundary.
  { id: 'assessment-runs-on-graph', from: 'assessment', to: 'company-graph', kind: 'runs-on', label: 'writes into' },
  { id: 'knowledge-runs-on-identity', from: 'knowledge-spine', to: 'data-identity', kind: 'runs-on', label: 'scoped by' },
  { id: 'knowledge-runs-on-graph', from: 'knowledge-spine', to: 'company-graph', kind: 'grounds', label: 'grounds' },
  { id: 'web-intelligence-runs-on-events', from: 'web-intelligence', to: 'integration-events', kind: 'runs-on', label: 'runs on' },
  { id: 'web-intelligence-runs-on-analytics', from: 'web-intelligence', to: 'analytics', kind: 'runs-on', label: 'measured in' },
  { id: 'revenue-loop-runs-on-events', from: 'revenue-loop', to: 'integration-events', kind: 'runs-on', label: 'runs on' },
  { id: 'revenue-loop-runs-on-analytics', from: 'revenue-loop', to: 'analytics', kind: 'runs-on', label: 'measured in' },
  { id: 'operations-system-runs-on-events', from: 'operations-system', to: 'integration-events', kind: 'runs-on', label: 'runs on' },
  { id: 'operations-system-runs-on-graph', from: 'operations-system', to: 'company-graph', kind: 'runs-on', label: 'writes into' },

  // Where a layer or a system is actually operated from.
  { id: 'web-intelligence-is-main-website', from: 'web-intelligence', to: 'main-website', kind: 'operates-in', label: 'operates in' },
  { id: 'company-os-runs-through-mirror', from: 'company-os', to: 'mirror', kind: 'runs-through', label: 'is operated in' },
  { id: 'operations-system-runs-through-studio', from: 'operations-system', to: 'studio', kind: 'runs-through', label: 'shown to a client in' },
  { id: 'admin-supplies-company-os', from: 'admin', to: 'company-os', kind: 'supplies', label: 'supplies' },
  { id: 'os-shop-extends-company-os', from: 'os-shop', to: 'company-os', kind: 'extends-into', label: 'extends into' },
  { id: 'forge-shop-extends-company-os', from: 'forge-shop', to: 'company-os', kind: 'extends-into', label: 'extends into' },

  // Where the record-backed model surfaces.
  { id: 'mirror-projects-graph', from: 'mirror', to: 'company-graph', kind: 'projects', label: 'projects' },
  { id: 'studio-projects-graph', from: 'studio', to: 'company-graph', kind: 'projects', label: 'projects' },
  { id: 'open-mirror-projects-graph', from: 'open-mirror', to: 'company-graph', kind: 'projects', label: 'projects' },
  { id: 'events-refresh-mirror', from: 'integration-events', to: 'mirror', kind: 'projects', label: 'refreshes' },
];

/**
 * A journey is not an element. It is an ordered walk through elements that
 * already exist, which is why the three audiences stopped being cards: as
 * nodes they added three boxes and seven lines and still could not be traced.
 * As a lens you can follow one path and dim everything else.
 */
export type EcosystemJourneyId = 'self-builder' | 'managed-client' | 'innerflect-team';

export type EcosystemJourney = {
  id: EcosystemJourneyId;
  name: string;
  summary: string;
  steps: readonly EcosystemNodeId[];
};

export const ECOSYSTEM_JOURNEYS: readonly EcosystemJourney[] = [
  {
    id: 'self-builder',
    name: 'Self-builder',
    summary: 'Builds an operating system from open patterns and components.',
    steps: ['main-website', 'open-mirror', 'os-shop', 'forge-shop', 'company-os'],
  },
  {
    id: 'managed-client',
    name: 'Managed client',
    summary: 'Asks Innerflect to build and run the operating system.',
    steps: ['main-website', 'assessment', 'company-os', 'studio', 'mirror'],
  },
  {
    id: 'innerflect-team',
    name: 'Innerflect team',
    summary: 'Runs the same five layers on itself, and delivers them to clients.',
    steps: ['main-website', 'admin', 'company-os', 'mirror', 'company-graph'],
  },
];

export const ECOSYSTEM_PAGE_GROUPS = [
  { id: 'environment', name: 'Environment', description: 'The index and shared entry boundary.' },
  { id: 'build', name: 'Build', description: 'Open Mirror and the two Shops for self-builders.' },
  { id: 'operate', name: 'Operate', description: 'Mirror and its operational company surfaces.' },
  { id: 'deliver', name: 'Deliver', description: 'Studio and Admin for managed operating systems.' },
  { id: 'design', name: 'Design', description: 'The shared 2D and 3D visual language.' },
  { id: 'system', name: 'System', description: 'Architecture, evidence and conformance contracts.' },
] as const;

export const ECOSYSTEM_PAGES: readonly EcosystemPage[] = [
  { id: 'ecosystem-home', name: 'Innerflect environment', surface: 'environment', group: 'environment', href: '/ecosystem', file: 'app/ecosystem/page.tsx', access: 'public', purpose: 'The navigable index of the complete Innerflect environment.', state: 'planned' },
  { id: 'main-website', name: 'Main website', surface: 'main-website', group: 'environment', href: 'https://innerflect.tech', file: 'https://innerflect.tech', access: 'public', purpose: 'Innerflect’s public marketing site and shared entry point, hosted outside this repository.', state: 'external' },
  { id: 'open-mirror', name: 'Open Mirror', surface: 'open-mirror', group: 'build', href: '/open-mirror', file: 'app/open-mirror/page.tsx', access: 'public', purpose: 'The free/open operational twin for self-builders.', state: 'planned' },
  { id: 'os-shop', name: 'OS Shop', surface: 'os-shop', group: 'build', href: '/shops/os', file: 'app/shops/os/page.tsx', access: 'public', purpose: 'Patterns, playbooks and operating-system architectures. Prototyped at prototypes/innerflect-platforms/os.html; this route does not exist yet.', state: 'building' },
  { id: 'forge-shop', name: 'Forge Shop', surface: 'forge-shop', group: 'build', href: '/shops/forge', file: 'app/shops/forge/page.tsx', access: 'public', purpose: 'Reusable open components and gated proprietary capabilities. Prototyped at prototypes/innerflect-platforms/forge.html; this route does not exist yet.', state: 'building' },
  { id: 'company', name: 'Company', surface: 'mirror', group: 'operate', href: '/', file: 'app/page.tsx', access: 'authenticated', purpose: 'Company health, activity and the operational world.', state: 'live' },
  { id: 'mirror', name: 'Mirror', surface: 'mirror', group: 'operate', href: '/mirror', file: 'app/mirror/page.tsx', access: 'authenticated', purpose: 'The company reflected as a system.', state: 'live' },
  { id: 'processes', name: 'Processes', surface: 'mirror', group: 'operate', href: '/processes', file: 'app/processes/page.tsx', access: 'authenticated', purpose: 'Workflows, capabilities and the canonical work spine.', state: 'live' },
  { id: 'approvals', name: 'Approvals', surface: 'mirror', group: 'operate', href: '/approvals', file: 'app/approvals/page.tsx', access: 'authenticated', purpose: 'Human authority and judgement queue.', state: 'live' },
  { id: 'knowledge', name: 'Knowledge', surface: 'mirror', group: 'operate', href: '/knowledge', file: 'app/knowledge/page.tsx', access: 'authenticated', purpose: 'Trusted knowledge and its evidence links.', state: 'live' },
  { id: 'outcomes', name: 'Outcomes', surface: 'mirror', group: 'operate', href: '/outcomes', file: 'app/outcomes/page.tsx', access: 'authenticated', purpose: 'Verified business value and audit.', state: 'live' },
  { id: 'settings', name: 'Settings', surface: 'mirror', group: 'operate', href: '/settings', file: 'app/settings/page.tsx', access: 'authenticated', purpose: 'Company constitution, access and connections.', state: 'live' },
  { id: 'studio', name: 'Studio', surface: 'studio', group: 'deliver', href: 'https://studio.innerflect.tech', file: 'https://studio.innerflect.tech', access: 'authenticated', purpose: 'Client project, evidence and collaboration workspace, hosted outside this repository.', state: 'external' },
  { id: 'admin', name: 'Admin', surface: 'admin', group: 'deliver', href: 'https://innerflect.tech/auth/sign-in', file: 'https://innerflect.tech/auth/sign-in', access: 'internal', purpose: 'Innerflect delivery, integration, access and governance console, reached by signing in on the main website. Hosted outside this repository.', state: 'external' },
  { id: 'elements', name: 'Elements', surface: 'design-system', group: 'design', href: '/design/elements', file: 'app/design/elements/page.tsx', access: 'development', purpose: 'Every semantic element in paired 2D and 3D isolation.', state: 'live' },
  { id: 'floor', name: 'Floor', surface: 'design-system', group: 'design', href: '/design/floor', file: 'app/design/floor/page.tsx', access: 'development', purpose: 'The production CompanyWorld composition.', state: 'live' },
  { id: 'shell', name: 'Shell', surface: 'design-system', group: 'design', href: '/design/shell', file: 'app/design/shell/page.tsx', access: 'development', purpose: 'The HTML shell and token surface.', state: 'live' },
  { id: 'lab', name: 'Lab', surface: 'design-system', group: 'design', href: '/design/lab', file: 'app/design/lab/page.tsx', access: 'development', purpose: 'Drag, connect and compare 2D and 3D compositions.', state: 'planned' },
  { id: 'ecosystem-design', name: 'Ecosystem board', surface: 'design-system', group: 'system', href: '/design/ecosystem', file: 'app/design/ecosystem/page.tsx', access: 'development', purpose: 'The source-backed index and conformance view of the full environment.', state: 'live' },
];

/**
 * What kind of thing a node *is*, expressed as a shape the board can draw.
 *
 * Not a sixth hand-maintained list: every value below is derived from what the
 * registry already knows, so a node cannot be drawn as one thing and registered
 * as another. The distinction the network needs at a glance is not category
 * (which groups by role) but substance — a person is not a website, and a
 * website is not an engine.
 *
 * - `surface`     the node has real entry points in ECOSYSTEM_PAGES: it is a
 *                 thing you can open. Main website, Mirror, Studio, Admin,
 *                 Open Mirror and both Shops.
 * - `people`      an audience or an actor. The Innerflect team is us; the
 *                 self-builder and the managed client are who we build for.
 * - `instance`    a product or workspace with no entry point of its own: a
 *                 deployed copy of the system for someone (Managed OS,
 *                 Builder-owned OS, Innerflect's own Mirror).
 * - `engine`      the shared machinery underneath every surface.
 * - `infrastructure` the boundaries around every read and write.
 */
export type EcosystemNodeShape = 'surface' | 'system' | 'layer' | 'foundation';

const NODES_WITH_A_SURFACE: ReadonlySet<string> = new Set(
  ECOSYSTEM_PAGES.map((page) => page.surface),
);

const SHAPE_BY_CATEGORY: Record<EcosystemCategoryId, EcosystemNodeShape> = {
  surfaces: 'surface',
  system: 'system',
  layers: 'layer',
  foundations: 'foundation',
};

export function nodeShape(node: EcosystemNode): EcosystemNodeShape {
  return SHAPE_BY_CATEGORY[node.category];
}

/** `surfaces` has to mean exactly "has a real entry point" — checked, not assumed. */
export function hasEntryPoint(node: EcosystemNode): boolean {
  return NODES_WITH_A_SURFACE.has(node.id);
}

/**
 * Seventeen relation kinds drawn as seventeen identical grey lines says
 * nothing. Grouped into five families, each drawn differently, the graph
 * becomes readable: you can see at a glance what a thing is made of versus
 * where its data goes versus who is allowed to act.
 */
export type EcosystemRelationFamily = 'composition' | 'journey' | 'dependency';

const RELATION_FAMILY: Record<EcosystemRelationKind, EcosystemRelationFamily> = {
  'composed-of': 'composition',
  'runs-on': 'composition',
  'extends-into': 'journey',
  'operates-in': 'journey',
  'runs-through': 'journey',
  supplies: 'journey',
  projects: 'dependency',
  grounds: 'dependency',
};

export function relationFamily(relation: EcosystemRelation): EcosystemRelationFamily {
  return RELATION_FAMILY[relation.kind];
}

export const ECOSYSTEM_RELATION_FAMILIES = [
  { id: 'composition', name: 'Is made of', description: 'What a thing contains, and what it stands on.' },
  { id: 'journey', name: 'Leads to', description: 'How you get from one part of the ecosystem to the next.' },
  { id: 'dependency', name: 'Depends on', description: 'Records and state moving between parts. Hidden until you ask for detail.' },
] as const satisfies readonly { id: EcosystemRelationFamily; name: string; description: string }[];

/** The legend. A shape nobody can read is decoration, not information. */
export const ECOSYSTEM_SHAPES = [
  { id: 'surface', name: 'You can open it', description: 'A real entry point: a website, an app, a shop.' },
  { id: 'system', name: 'The operating system', description: 'The system itself — five layers, one company.' },
  { id: 'layer', name: 'A layer it is made of', description: 'One of the five capabilities, and one of the five things Innerflect sells.' },
  { id: 'foundation', name: 'What it stands on', description: 'A named tool, model or boundary underneath every layer.' },
] as const satisfies readonly { id: EcosystemNodeShape; name: string; description: string }[];

export const ECOSYSTEM_CHANGE_CONTRACT = {
  source: 'PRODUCT_STRUCTURE.md defines meaning; lib/design/ecosystem.ts defines the registered projection.',
  read: 'The board reads nodes, typed relations and ECOSYSTEM_PAGES; it does not invent cards from local state.',
  write: 'A production edit authenticates an actor, checks permission and revision, validates the operation, writes canonical state, records an event, then refreshes this projection.',
  draftOnly: 'The public board may export a typed layout proposal. A browser draft or localStorage value is not canonical.',
  forbidden: 'Do not put secrets, customer data or private infrastructure coordinates in this public registry.',
} as const;

export const ECOSYSTEM_NODES_BY_ID = Object.fromEntries(
  ECOSYSTEM_NODES.map((node) => [node.id, node]),
) as Record<EcosystemNodeId, EcosystemNode>;

export function validateRegistry(): true {
  const categories = new Set(ECOSYSTEM_CATEGORIES.map((category) => category.id));
  const nodes = new Set<string>();
  const relations = new Set<string>();
  const pages = new Set<string>();
  const hrefs = new Set<string>();
  const pageGroups = new Set(ECOSYSTEM_PAGE_GROUPS.map((group) => group.id));
  const entrySurfaces = new Set(REPOSITORY_SCOPE.entrySurfaces);

  for (const node of ECOSYSTEM_NODES) {
    if (nodes.has(node.id)) throw new Error('Duplicate ecosystem node id: ' + node.id);
    nodes.add(node.id);
    if (!categories.has(node.category)) throw new Error('Unknown ecosystem category: ' + node.category);
    if (!node.summary.trim() || !node.detail.trim() || !node.source.path.trim()) {
      throw new Error('Incomplete ecosystem node: ' + node.id);
    }
  }
  for (const relation of ECOSYSTEM_RELATIONS) {
    if (relations.has(relation.id)) throw new Error('Duplicate ecosystem relation id: ' + relation.id);
    relations.add(relation.id);
    if (!ECOSYSTEM_NODES_BY_ID[relation.from] || !ECOSYSTEM_NODES_BY_ID[relation.to]) {
      throw new Error('Unresolved ecosystem relation: ' + relation.id);
    }
    if (!relation.label.trim()) throw new Error('Unlabelled ecosystem relation: ' + relation.id);
  }
  for (const page of ECOSYSTEM_PAGES) {
    if (pages.has(page.id)) throw new Error('Duplicate ecosystem page id: ' + page.id);
    pages.add(page.id);
    if (hrefs.has(page.href)) throw new Error('Duplicate ecosystem page href: ' + page.href);
    hrefs.add(page.href);
    if (!pageGroups.has(page.group)) throw new Error('Unknown ecosystem page group: ' + page.group);
    if (!entrySurfaces.has(page.surface)) throw new Error('Unknown ecosystem entry surface: ' + page.surface);
    if (!page.file || !page.purpose.trim()) throw new Error('Incomplete ecosystem page: ' + page.id);
  }
  return true;
}

validateRegistry();
