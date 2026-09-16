import type { EcosystemNodeId } from '@/lib/design/ecosystem';

/**
 * The two Shops, as records.
 *
 * Lifted out of `prototypes/innerflect-platforms/{os,forge}.html` rather than
 * rewritten: those prototypes are where the catalogue was designed, and typing
 * one up from memory is how a shop quietly starts selling something it does
 * not have. Every item, kind, price and tag below is what the prototype states.
 *
 * Held here rather than in the route so both Shops render through one
 * component and cannot drift into two different ideas of what a shop is.
 */

export type ShopId = 'os' | 'forge';

export type ShopItem = {
  id: string;
  name: string;
  /** What kind of thing it is — the prototype's own label for it. */
  kind: string;
  /** Price as written, including 'Free'. Not a number: 'Free' is a real value. */
  price: string;
  summary: string;
  tags: readonly string[];
  /**
   * The operating layer this item gives you a head start on.
   *
   * Without it the Shops are orphans: a catalogue sitting beside a system it
   * never refers to. It also settles a real collision — "Knowledge Spine" is
   * both one of the five layers and an OS Shop blueprint, and those are not
   * the same object. The layer is the capability a company ends up with; the
   * blueprint is the pattern you buy to build it. Stating the link makes that
   * a relationship instead of a name clash.
   */
  buildsLayer?: EcosystemNodeId;
};

export type Shop = {
  id: ShopId;
  /** The registry node this shop is the storefront for. */
  node: EcosystemNodeId;
  name: string;
  eyebrow: string;
  headline: string;
  pulse: string;
  /** The three things the shop promises, straight from the prototype. */
  promises: readonly { label: string; detail: string }[];
  items: readonly ShopItem[];
  /** What the shop is honest about not being yet. */
  caveat: string;
};

export const SHOPS: Record<ShopId, Shop> = {
  os: {
    id: 'os',
    node: 'os-shop',
    name: 'OS Shop',
    eyebrow: 'AI-native systems that turn intelligence into execution',
    headline: 'Make AI part of how work runs.',
    pulse:
      'A practical shop of agent architectures, automation recipes, governed prompts and operating blueprints. Build systems that know what to do, when to ask, and where human judgment remains essential.',
    promises: [
      { label: 'Governed', detail: 'Human approval by design' },
      { label: 'Observable', detail: 'Sources and outcomes visible' },
      { label: 'Composable', detail: 'Agents, workflows and interfaces' },
    ],
    items: [
      {
        id: 'knowledge-spine',
        name: 'Knowledge Spine',
        kind: 'Operating blueprint',
        price: '€79',
        summary:
          'Map, structure and govern the knowledge layer that makes organizational AI dependable.',
        tags: ['RAG', 'Governance', '14 modules'],
        buildsLayer: 'knowledge-spine',
      },
      {
        id: 'research-agent-network',
        name: 'Research Agent Network',
        kind: 'Agent architecture',
        price: '€69',
        summary:
          'A governed scout, verifier and synthesis workflow for reliable recurring intelligence.',
        tags: ['Agents', 'Sources', 'Verification'],
        buildsLayer: 'knowledge-spine',
      },
      {
        id: 'revenue-signal-loop',
        name: 'Revenue Signal Loop',
        kind: 'Automation recipe',
        price: '€59',
        summary:
          'Connect intent capture, qualification, ownership and follow-up into one visible flow.',
        tags: ['CRM', '8 integrations', 'Handoff'],
        buildsLayer: 'revenue-loop',
      },
      {
        id: 'approval-circuit',
        name: 'Approval Circuit',
        kind: 'Governance system',
        price: '€54',
        summary:
          'Risk-tiered review, escalation and evidence capture for consequential AI actions.',
        tags: ['Approval', 'Audit', 'Policy'],
        buildsLayer: 'operations-system',
      },
      {
        id: 'quiet-portal',
        name: 'Quiet Portal',
        kind: 'Client workspace',
        price: '€49',
        summary:
          'A calm operating surface for progress, decisions, evidence and the next useful action.',
        tags: ['Portal', 'Decisions', 'Trust'],
        buildsLayer: 'operations-system',
      },
      {
        id: 'decision-atlas',
        name: 'Decision Atlas',
        kind: 'Guided diagnostic',
        price: '€39',
        summary:
          'A typed branching flow that locates a Direction, Systems or Delivery constraint.',
        tags: ['Diagnostic', 'State machine', 'Guided'],
        buildsLayer: 'assessment',
      },
    ],
    caveat:
      'The catalogue is designed and priced; checkout is not built yet. Everything here is inspectable, nothing is purchasable.',
  },

  forge: {
    id: 'forge',
    node: 'forge-shop',
    name: 'Forge Shop',
    eyebrow: 'Templates · sections · backgrounds · 3D scenes',
    headline: 'Make websites people feel.',
    pulse:
      'A curated shop of production-ready creative layers. Start with a complete template, add high-quality sections, establish atmosphere with a background, or create product theatre with a 3D scene.',
    promises: [
      { label: 'Art-directed', detail: 'Every system reviewed by hand' },
      { label: 'Composable', detail: 'Mix layers without losing coherence' },
      { label: 'Maintained', detail: 'Compatibility and updates included' },
    ],
    items: [
      {
        id: 'object-one-launch',
        name: 'Object One Launch',
        kind: 'Product experience',
        price: '€59',
        summary:
          'Pointer-responsive product theatre, story sections and an elevated purchase journey.',
        tags: ['Three.js', 'Commerce', '3D'],
        buildsLayer: 'web-intelligence',
      },
      {
        id: 'atelier-editorial-system',
        name: 'Atelier Editorial System',
        kind: 'Complete experience',
        price: '€49',
        summary:
          'An image-led portfolio with cinematic typography, case-study structures and restrained motion.',
        tags: ['Next.js', 'Portfolio', 'Motion'],
        buildsLayer: 'web-intelligence',
      },
      {
        id: 'release-sequence',
        name: 'Release Sequence',
        kind: 'Launch system',
        price: '€39',
        summary:
          'A conversion-ready launch page with product story, proof, pricing and release motion.',
        tags: ['SaaS', 'Conversion', 'Responsive'],
        buildsLayer: 'revenue-loop',
      },
      {
        id: 'signal-field',
        name: 'Signal Field',
        kind: 'Hero system',
        price: '€29',
        summary:
          'A precise opening statement held inside a living field of signals, evidence and context.',
        tags: ['SVG', 'Editorial', 'Accessible'],
        buildsLayer: 'web-intelligence',
      },
      {
        id: 'proof-ledger',
        name: 'Proof Ledger',
        kind: 'Evidence system',
        price: '€24',
        summary:
          'An audited evidence component with outcome, baseline, series, source and methodology.',
        tags: ['Case study', 'Data', 'Trust'],
        buildsLayer: 'operations-system',
      },
      {
        id: 'flowstate-fluid-hero',
        name: 'Flowstate Fluid Hero',
        kind: 'Signature effect',
        price: 'Free',
        summary:
          'A living fluid field, editorial foreground and complete performance fallback specification.',
        tags: ['WebGL', 'Single HTML', 'Advanced'],
        buildsLayer: 'web-intelligence',
      },
    ],
    caveat:
      'The catalogue is designed and priced; checkout is not built yet. Everything here is inspectable, nothing is purchasable.',
  },
};

/** Distinct kinds in a shop, in catalogue order — the filter row's real source. */
export function shopKinds(shop: Shop): string[] {
  return [...new Set(shop.items.map((item) => item.kind))];
}

/** Resolve a shop + item from route params. Returns null so a bad URL 404s. */
export function findShopItem(shopId: string, itemId: string) {
  const shop = (SHOPS as Record<string, Shop>)[shopId];
  const item = shop?.items.find((entry) => entry.id === itemId);
  return shop && item ? { shop, item } : null;
}

/** Every shop/item pair, for static generation and for the surfaces gate. */
export function allShopItems() {
  return Object.values(SHOPS).flatMap((shop) =>
    shop.items.map((item) => ({ shop: shop.id, item: item.id })),
  );
}
