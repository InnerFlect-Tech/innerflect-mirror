/**
 * The executable index of the Innerflect ecosystem.
 *
 * Product meaning remains in PRODUCT_STRUCTURE.md. This file gives the app a typed,
 * source-backed projection that can be rendered by the board and checked by tooling.
 * It is intentionally not a database: production writes must go through the typed,
 * authenticated operation path described in the product contract.
 */

export type EcosystemCategoryId =
  | 'journeys'
  | 'shops'
  | 'products'
  | 'delivery'
  | 'engine'
  | 'infrastructure';

export type EcosystemNodeKind =
  | 'audience'
  | 'shop'
  | 'product'
  | 'workspace'
  | 'actor'
  | 'engine'
  | 'infrastructure';

export type ImplementationState = 'live' | 'building' | 'planned' | 'external';

export type EcosystemNodeId =
  | 'self-builder'
  | 'managed-client'
  | 'innerflect-team'
  | 'os-shop'
  | 'forge-shop'
  | 'open-mirror'
  | 'own-os'
  | 'managed-os'
  | 'mirror'
  | 'studio'
  | 'admin'
  | 'innerflect-mirror'
  | 'company-graph'
  | 'operation-catalogue'
  | 'knowledge-spine'
  | 'governance'
  | 'integration-events'
  | 'agent-runtime'
  | 'data-identity'
  | 'audit-outcomes';

export type EcosystemRelationKind =
  | 'starts-with'
  | 'learns-from'
  | 'assembles-with'
  | 'extends-into'
  | 'receives'
  | 'follows-in'
  | 'operates-in'
  | 'runs-through'
  | 'supplies'
  | 'projects'
  | 'invokes'
  | 'grounds'
  | 'authorises'
  | 'records'
  | 'updates'
  | 'stores'
  | 'proves';

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
  kind: EcosystemNodeKind;
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
    'The source and coordination environment for Mirror, Open Mirror, both Shops, Studio, Admin, shared engines, infrastructure and design system.',
  operationalCore: 'mirror',
  entrySurfaces: [
    'environment',
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
  { id: 'journeys', name: 'Journeys', description: 'Who is building or operating an OS.' },
  { id: 'shops', name: 'Shops', description: 'Patterns and reusable capabilities.' },
  { id: 'products', name: 'Products', description: 'The surfaces a person enters.' },
  { id: 'delivery', name: 'Delivery', description: 'People and workspaces around a managed OS.' },
  { id: 'engine', name: 'Engine', description: 'The graph and operation primitives underneath.' },
  { id: 'infrastructure', name: 'Infrastructure', description: 'Evidence, identity and integration boundaries.' },
] as const;

const source = {
  product: (path: string): EcosystemSource => ({ authority: 'product', path }),
  implementation: (path: string): EcosystemSource => ({ authority: 'implementation', path }),
  coordination: (path: string): EcosystemSource => ({ authority: 'coordination', path }),
  external: (path: string): EcosystemSource => ({ authority: 'external', path }),
};

export const ECOSYSTEM_NODES: readonly EcosystemNode[] = [
  {
    id: 'self-builder',
    name: 'Self-builder',
    kind: 'audience',
    category: 'journeys',
    summary: 'Builds an operating system from open patterns and components.',
    detail: 'The free/open entry point: use Mirror to understand work, OS Shop for patterns and Forge Shop for reusable components.',
    state: 'building',
    position: { x: 56, y: 64 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'managed-client',
    name: 'Managed client',
    kind: 'audience',
    category: 'journeys',
    summary: 'Asks Innerflect to manage an operating system.',
    detail: 'Receives managed OS delivery through proprietary Forge capabilities, Studio collaboration and Mirror operations.',
    state: 'building',
    position: { x: 56, y: 292 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'innerflect-team',
    name: 'Innerflect team',
    kind: 'actor',
    category: 'journeys',
    summary: 'Operates Innerflect and delivers managed systems.',
    detail: 'The team uses its own Mirror and Admin to govern integrations, delivery, access and outcomes.',
    state: 'live',
    position: { x: 56, y: 520 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'os-shop',
    name: 'OS Shop',
    kind: 'shop',
    category: 'shops',
    summary: 'Patterns for designing an operating system.',
    detail: 'A catalogue of playbooks, architectures and proven operating patterns that a self-builder can adapt.',
    state: 'planned',
    position: { x: 430, y: 64 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'forge-shop',
    name: 'Forge Shop',
    kind: 'shop',
    category: 'shops',
    summary: 'Reusable design and implementation components.',
    detail: 'Open components serve self-builders; proprietary capabilities serve managed engagements.',
    state: 'planned',
    position: { x: 430, y: 292 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'open-mirror',
    name: 'Open Mirror',
    kind: 'product',
    category: 'products',
    summary: 'Free/open operational twin for self-builders.',
    detail: 'The simpler edition exposes the visual language and the operating model without requiring Innerflect-managed delivery.',
    state: 'building',
    position: { x: 800, y: 64 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'own-os',
    name: 'Builder-owned OS',
    kind: 'workspace',
    category: 'delivery',
    summary: 'The self-builder’s operating system.',
    detail: 'An OS assembled from open patterns and components, owned and operated by the builder.',
    state: 'planned',
    position: { x: 800, y: 292 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'managed-os',
    name: 'Managed OS',
    kind: 'workspace',
    category: 'delivery',
    summary: 'The operating system Innerflect manages for a client.',
    detail: 'A client-specific operating model with controlled access, evidence, integrations, workflows and outcomes.',
    state: 'planned',
    position: { x: 800, y: 520 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'mirror',
    name: 'Mirror',
    kind: 'product',
    category: 'products',
    summary: 'The operational twin and constrained builder.',
    detail: 'Mirror mode shows reality; Builder mode lets a person redesign it without losing authority, evidence or auditability.',
    state: 'live',
    position: { x: 1170, y: 64 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'studio',
    name: 'Studio',
    kind: 'workspace',
    category: 'delivery',
    summary: 'Client-facing project and collaboration workspace.',
    detail: 'Studio follows evidence, decisions, delivery progress and the parts of a managed OS the client can see or change.',
    state: 'building',
    position: { x: 1170, y: 292 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'admin',
    name: 'Admin',
    kind: 'workspace',
    category: 'delivery',
    summary: 'Innerflect’s internal delivery and governance console.',
    detail: 'Admin is where the Innerflect team runs managed systems, access, integrations, releases and operational controls.',
    state: 'building',
    position: { x: 1170, y: 520 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'innerflect-mirror',
    name: 'Innerflect Mirror',
    kind: 'product',
    category: 'products',
    summary: 'Innerflect’s own operational twin.',
    detail: 'Innerflect proves the system on itself before using the managed journey for clients.',
    state: 'building',
    position: { x: 1540, y: 64 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'company-graph',
    name: 'Company graph',
    kind: 'engine',
    category: 'engine',
    summary: 'One record-backed model of the company.',
    detail: 'Workflows, actors, records, decisions, tools, knowledge, permissions, exceptions and outcomes share stable ids.',
    state: 'building',
    position: { x: 1540, y: 292 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'operation-catalogue',
    name: 'Typed operation catalogue',
    kind: 'engine',
    category: 'engine',
    summary: 'The actions humans and agents are allowed to request.',
    detail: 'The same typed operation contract serves the UI and integrations; policy decides whether an effect may happen.',
    state: 'planned',
    position: { x: 1540, y: 520 },
    source: source.coordination('WORLD_ELEMENTS.md'),
  },
  {
    id: 'knowledge-spine',
    name: 'Knowledge spine',
    kind: 'engine',
    category: 'engine',
    summary: 'Trusted knowledge used by work.',
    detail: 'Knowledge is a surface and substrate, not an org-chart island; evidence links to the step or outcome that uses it.',
    state: 'building',
    position: { x: 1540, y: 748 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'governance',
    name: 'Governance',
    kind: 'engine',
    category: 'engine',
    summary: 'Authority, policy and human control.',
    detail: 'Governance is a layer over every domain. It makes work human-led, assisted, supervised, autonomous or blocked.',
    state: 'building',
    position: { x: 1910, y: 292 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'integration-events',
    name: 'Integrations and events',
    kind: 'infrastructure',
    category: 'infrastructure',
    summary: 'Connections that observe and report work.',
    detail: 'Connected tools produce evidence and events; they do not become a second model of the company.',
    state: 'planned',
    position: { x: 1910, y: 520 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'agent-runtime',
    name: 'Agent runtime',
    kind: 'infrastructure',
    category: 'infrastructure',
    summary: 'Where eligible operations are performed.',
    detail: 'Agents are workers inside the model. Runtime activity must retain authority, evidence, observable outcome and audit.',
    state: 'planned',
    position: { x: 1910, y: 748 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
  {
    id: 'data-identity',
    name: 'Data, identity and access',
    kind: 'infrastructure',
    category: 'infrastructure',
    summary: 'The boundaries around every read and write.',
    detail: 'Identity, tenant scope, permissions and revision checks protect the canonical graph and its sensitive records.',
    state: 'planned',
    position: { x: 1910, y: 976 },
    source: source.coordination('WORLD_ELEMENTS.md'),
  },
  {
    id: 'audit-outcomes',
    name: 'Audit and outcomes',
    kind: 'infrastructure',
    category: 'infrastructure',
    summary: 'Proof that an operation happened and mattered.',
    detail: 'Every effect produces an event, verification and observable result that can be inspected in Outcomes.',
    state: 'planned',
    position: { x: 1540, y: 976 },
    source: source.product('PRODUCT_STRUCTURE.md'),
  },
];

export const ECOSYSTEM_RELATIONS: readonly EcosystemRelation[] = [
  { id: 'self-builder-starts-open-mirror', from: 'self-builder', to: 'open-mirror', kind: 'starts-with', label: 'starts with' },
  { id: 'self-builder-learns-os-patterns', from: 'self-builder', to: 'os-shop', kind: 'learns-from', label: 'learns from' },
  { id: 'self-builder-assembles-forge', from: 'self-builder', to: 'forge-shop', kind: 'assembles-with', label: 'assembles with' },
  { id: 'os-patterns-extend-own-os', from: 'os-shop', to: 'own-os', kind: 'extends-into', label: 'extends into' },
  { id: 'forge-components-extend-own-os', from: 'forge-shop', to: 'own-os', kind: 'extends-into', label: 'extends into' },
  { id: 'managed-client-receives-managed-os', from: 'managed-client', to: 'managed-os', kind: 'receives', label: 'receives' },
  { id: 'managed-client-follows-forge', from: 'managed-client', to: 'forge-shop', kind: 'follows-in', label: 'runs through' },
  { id: 'managed-os-runs-through-studio', from: 'managed-os', to: 'studio', kind: 'runs-through', label: 'runs through' },
  { id: 'managed-os-runs-through-mirror', from: 'managed-os', to: 'mirror', kind: 'runs-through', label: 'runs through' },
  { id: 'innerflect-operates-admin', from: 'innerflect-team', to: 'admin', kind: 'operates-in', label: 'operates in' },
  { id: 'innerflect-operates-own-mirror', from: 'innerflect-team', to: 'innerflect-mirror', kind: 'operates-in', label: 'operates in' },
  { id: 'admin-supplies-managed-os', from: 'admin', to: 'managed-os', kind: 'supplies', label: 'supplies' },
  { id: 'mirror-projects-company-graph', from: 'mirror', to: 'company-graph', kind: 'projects', label: 'projects' },
  { id: 'studio-projects-company-graph', from: 'studio', to: 'company-graph', kind: 'projects', label: 'projects' },
  { id: 'innerflect-mirror-projects-company-graph', from: 'innerflect-mirror', to: 'company-graph', kind: 'projects', label: 'projects' },
  { id: 'graph-invokes-catalogue', from: 'company-graph', to: 'operation-catalogue', kind: 'invokes', label: 'invokes' },
  { id: 'knowledge-grounds-graph', from: 'knowledge-spine', to: 'company-graph', kind: 'grounds', label: 'grounds' },
  { id: 'governance-authorises-operations', from: 'governance', to: 'operation-catalogue', kind: 'authorises', label: 'authorises' },
  { id: 'operations-record-events', from: 'operation-catalogue', to: 'integration-events', kind: 'records', label: 'records' },
  { id: 'operations-updates-graph', from: 'operation-catalogue', to: 'company-graph', kind: 'updates', label: 'updates' },
  { id: 'agent-invokes-operations', from: 'agent-runtime', to: 'operation-catalogue', kind: 'invokes', label: 'invokes' },
  { id: 'identity-authorises-governance', from: 'data-identity', to: 'governance', kind: 'authorises', label: 'authorises' },
  { id: 'events-prove-outcomes', from: 'integration-events', to: 'audit-outcomes', kind: 'proves', label: 'proves' },
  { id: 'graph-stores-knowledge', from: 'company-graph', to: 'knowledge-spine', kind: 'stores', label: 'stores' },
  { id: 'admin-updates-graph', from: 'admin', to: 'company-graph', kind: 'updates', label: 'updates' },
  { id: 'mirror-receives-events', from: 'integration-events', to: 'mirror', kind: 'projects', label: 'refreshes' },
  { id: 'audit-receives-outcomes', from: 'audit-outcomes', to: 'studio', kind: 'updates', label: 'reports into' },
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
  { id: 'open-mirror', name: 'Open Mirror', surface: 'open-mirror', group: 'build', href: '/open-mirror', file: 'app/open-mirror/page.tsx', access: 'public', purpose: 'The free/open operational twin for self-builders.', state: 'planned' },
  { id: 'os-shop', name: 'OS Shop', surface: 'os-shop', group: 'build', href: '/shops/os', file: 'app/shops/os/page.tsx', access: 'public', purpose: 'Patterns, playbooks and operating-system architectures.', state: 'planned' },
  { id: 'forge-shop', name: 'Forge Shop', surface: 'forge-shop', group: 'build', href: '/shops/forge', file: 'app/shops/forge/page.tsx', access: 'public', purpose: 'Reusable open components and gated proprietary capabilities.', state: 'planned' },
  { id: 'company', name: 'Company', surface: 'mirror', group: 'operate', href: '/', file: 'app/page.tsx', access: 'authenticated', purpose: 'Company health, activity and the operational world.', state: 'live' },
  { id: 'mirror', name: 'Mirror', surface: 'mirror', group: 'operate', href: '/mirror', file: 'app/mirror/page.tsx', access: 'authenticated', purpose: 'The company reflected as a system.', state: 'live' },
  { id: 'processes', name: 'Processes', surface: 'mirror', group: 'operate', href: '/processes', file: 'app/processes/page.tsx', access: 'authenticated', purpose: 'Workflows, capabilities and the canonical work spine.', state: 'live' },
  { id: 'approvals', name: 'Approvals', surface: 'mirror', group: 'operate', href: '/approvals', file: 'app/approvals/page.tsx', access: 'authenticated', purpose: 'Human authority and judgement queue.', state: 'live' },
  { id: 'knowledge', name: 'Knowledge', surface: 'mirror', group: 'operate', href: '/knowledge', file: 'app/knowledge/page.tsx', access: 'authenticated', purpose: 'Trusted knowledge and its evidence links.', state: 'live' },
  { id: 'outcomes', name: 'Outcomes', surface: 'mirror', group: 'operate', href: '/outcomes', file: 'app/outcomes/page.tsx', access: 'authenticated', purpose: 'Verified business value and audit.', state: 'live' },
  { id: 'settings', name: 'Settings', surface: 'mirror', group: 'operate', href: '/settings', file: 'app/settings/page.tsx', access: 'authenticated', purpose: 'Company constitution, access and connections.', state: 'live' },
  { id: 'studio', name: 'Studio', surface: 'studio', group: 'deliver', href: '/studio', file: 'app/studio/page.tsx', access: 'authenticated', purpose: 'Client project, evidence and collaboration workspace.', state: 'planned' },
  { id: 'admin', name: 'Admin', surface: 'admin', group: 'deliver', href: '/admin', file: 'app/admin/page.tsx', access: 'internal', purpose: 'Innerflect delivery, integration, access and governance console.', state: 'planned' },
  { id: 'elements', name: 'Elements', surface: 'design-system', group: 'design', href: '/design/elements', file: 'app/design/elements/page.tsx', access: 'development', purpose: 'Every semantic element in paired 2D and 3D isolation.', state: 'live' },
  { id: 'floor', name: 'Floor', surface: 'design-system', group: 'design', href: '/design/floor', file: 'app/design/floor/page.tsx', access: 'development', purpose: 'The production CompanyWorld composition.', state: 'live' },
  { id: 'shell', name: 'Shell', surface: 'design-system', group: 'design', href: '/design/shell', file: 'app/design/shell/page.tsx', access: 'development', purpose: 'The HTML shell and token surface.', state: 'live' },
  { id: 'lab', name: 'Lab', surface: 'design-system', group: 'design', href: '/design/lab', file: 'app/design/lab/page.tsx', access: 'development', purpose: 'Drag, connect and compare 2D and 3D compositions.', state: 'planned' },
  { id: 'ecosystem-design', name: 'Ecosystem board', surface: 'design-system', group: 'system', href: '/design/ecosystem', file: 'app/design/ecosystem/page.tsx', access: 'development', purpose: 'The source-backed index and conformance view of the full environment.', state: 'live' },
];

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
