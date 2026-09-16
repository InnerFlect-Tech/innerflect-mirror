import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicNav } from '@/components/company/PublicNav';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { allShopItems, findShopItem } from '@/data/shops';
import { ECOSYSTEM_NODES_BY_ID } from '@/lib/design/ecosystem';
import styles from '@/components/company/ShopItem.module.css';

/**
 * One catalogue item. Every prototype card ended in "Inspect system →" and
 * pointed nowhere; this is the somewhere.
 *
 * Generated from `data/shops.ts`, so an item cannot exist in the catalogue and
 * be missing here, or vice versa — the list and the page are the same record.
 */
type Params = { params: Promise<{ shop: string; item: string }> };

export function generateStaticParams() {
  return allShopItems();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = findShopItem(...(Object.values(await params) as [string, string]));
  if (!found) return { title: 'Not found' };
  return {
    title: `${found.item.name} · ${found.shop.name}`,
    description: found.item.summary,
  };
}

export default async function Page({ params }: Params) {
  const { shop: shopId, item: itemId } = await params;
  const found = findShopItem(shopId, itemId);
  if (!found) notFound();
  const { shop, item } = found;
  const layer = item.buildsLayer ? ECOSYSTEM_NODES_BY_ID[item.buildsLayer] : null;

  return (
    <main data-surface={`shop-item`}>
      <PublicNav />
      <SurfaceHead
        eyebrow={`${shop.name} · ${item.kind}`}
        title={item.name}
        pulse={item.summary}
      />
      <SurfaceSummary
        stats={[
          { value: item.price, label: 'Price', tone: item.price === 'Free' ? 'good' : 'neutral' },
          { value: item.kind, label: 'Kind of system' },
          ...(layer ? [{ value: layer.name, label: 'Builds the layer', href: '/ecosystem' }] : []),
          { value: 'Inspect', label: 'Checkout not built yet', tone: 'attention' as const },
        ]}
      />

      <section className={styles.panel}>
        <h2>What it is</h2>
        <p className={styles.body}>{item.summary}</p>

        <h2>What it involves</h2>
        <ul className={styles.tags}>
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        {layer && (
          <>
            <h2>Where it fits</h2>
            <p className={styles.body}>
              This gives you a head start on <b>{layer.name}</b> — {layer.summary} Every
              operating layer works on its own, so buying this commits you to nothing else.
            </p>
          </>
        )}

        <Link className={styles.back} href={`/shops/${shop.id}`}>
          ← Back to {shop.name}
        </Link>
      </section>
    </main>
  );
}
