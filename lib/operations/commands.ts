import { ECOSYSTEM_PAGES } from '@/lib/design/ecosystem';

export type CommandIntent = {
  id: string;
  label: string;
  description: string;
  group: 'Navigate' | 'Investigate' | 'Govern';
  href: string;
  keywords: readonly string[];
};

const liveMirrorPages = ECOSYSTEM_PAGES.filter(
  (page) => page.surface === 'mirror' && page.state === 'live',
);

export const commandIntents: readonly CommandIntent[] = [
  ...liveMirrorPages.map((page) => ({
    id: `navigate-${page.id}`,
    label: page.name,
    description: page.purpose,
    group: 'Navigate' as const,
    href: page.href,
    keywords: [page.id, page.group, page.purpose],
  })),
  {
    id: 'investigate-risk',
    label: 'Why is a domain at risk?',
    description:
      'Open the company context and inspect the evidence behind its state.',
    group: 'Investigate',
    href: '/',
    keywords: ['risk', 'domain', 'evidence', 'health'],
  },
  {
    id: 'govern-decisions',
    label: 'Review decisions waiting for me',
    description:
      'Open the human authority queue with its recommendations and evidence.',
    group: 'Govern',
    href: '/approvals',
    keywords: ['decision', 'approval', 'authority', 'human'],
  },
];
