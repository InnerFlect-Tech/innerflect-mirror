import type { Metadata } from 'next';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { ShopSurface } from '@/components/company/ShopSurface';
import { SHOPS, shopKinds } from '@/data/shops';

/**
 * OS Shop — registered in `lib/design/ecosystem.ts` as `/shops/os` and pointed
 * at this exact file since before it existed.
 *
 * Public, so deliberately not wrapped in `AppShell`: that shell carries an
 * authenticated operator's rail and a decisions-waiting count, and a shop has
 * neither. Same call `/open-mirror` made.
 */
const shop = SHOPS.os;

export const metadata: Metadata = {
  title: 'OS Shop · Innerflect',
  description: shop.pulse,
};

export default function Page() {
  return (
    <main data-surface="shop-os">
      <SurfaceHead eyebrow={shop.eyebrow} title={shop.name} pulse={shop.pulse} />
      <SurfaceSummary
        stats={[
          { value: String(shop.items.length), label: 'In the catalogue', tone: 'good' },
          { value: String(shopKinds(shop).length), label: 'Kinds of system' },
          { value: shop.items.filter((i) => i.price === 'Free').length ? 'Yes' : 'No', label: 'Something free' },
          { value: 'Inspect', label: 'Checkout not built yet', tone: 'attention' },
        ]}
      />
      <ShopSurface shop={shop} />
    </main>
  );
}
