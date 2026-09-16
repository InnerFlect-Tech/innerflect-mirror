import Link from 'next/link';
import { ECOSYSTEM_PAGES } from '@/lib/design/ecosystem';
import styles from './PublicNav.module.css';

/**
 * Navigation across the public surfaces.
 *
 * Added because an axe pass found the real defect: `/open-mirror`,
 * `/shops/os` and `/shops/forge` each had **zero** outbound links. Every
 * public page was a dead end — you could arrive and never leave, and nothing
 * told you the others existed. The environment shipped as four islands.
 *
 * The destinations are not a hand-written list. They are the public,
 * in-repository entry points the registry says are open, so a new public
 * surface joins this nav by existing rather than by someone remembering to
 * add it — and a surface that stops being live drops out of it the same way.
 */
const PUBLIC_NAV = ECOSYSTEM_PAGES.filter(
  (page) =>
    page.access === 'public' &&
    page.state === 'live' &&
    !page.href.startsWith('http'),
);

export function PublicNav({ current }: { current?: string }) {
  return (
    <nav className={styles.nav} aria-label="Innerflect environment">
      <Link href="/ecosystem" className={styles.brand}>
        Innerflect
      </Link>
      <ul>
        {PUBLIC_NAV.map((page) => (
          <li key={page.id}>
            <Link
              href={page.href}
              aria-current={page.href === current ? 'page' : undefined}
            >
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
      <a className={styles.out} href="https://innerflect.tech" target="_blank" rel="noreferrer">
        innerflect.tech ↗
      </a>
    </nav>
  );
}
