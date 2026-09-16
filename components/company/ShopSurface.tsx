import { shopKinds, type Shop } from '@/data/shops';
import { ECOSYSTEM_NODES_BY_ID } from '@/lib/design/ecosystem';
import styles from './ShopSurface.module.css';

/**
 * Both Shops, rendered from one record.
 *
 * Built in the app rather than left as a fifth static prototype, for the same
 * reason `/open-mirror` was: a prototype can only *assert* alignment, and the
 * ones under `prototypes/` had already drifted into their own vocabulary. This
 * imports the registry, so a shop claiming a state the registry disagrees with
 * breaks the build instead of quietly shipping.
 *
 * Server component — a catalogue is legible without a click. Filtering by kind
 * is the next slice; the kinds are already derived from the items rather than
 * hardcoded, so it has somewhere honest to attach.
 */
export function ShopSurface({ shop }: { shop: Shop }) {
  const node = ECOSYSTEM_NODES_BY_ID[shop.node];
  const kinds = shopKinds(shop);

  return (
    <div className={styles.shop}>
      <section className={styles.promises}>
        {shop.promises.map((promise) => (
          <div key={promise.label}>
            <b>{promise.label}</b>
            <span>{promise.detail}</span>
          </div>
        ))}
      </section>

      <section className={styles.catalogue}>
        <header>
          <div>
            <span className="context">{shop.name} library</span>
            <h2>Install capability, not another disconnected tool.</h2>
          </div>
          <ul className={styles.kinds} aria-label="What this shop carries">
            <li>
              <b>{shop.items.length}</b> in the catalogue
            </li>
            {kinds.map((kind) => (
              <li key={kind}>{kind}</li>
            ))}
          </ul>
        </header>

        <ul className={styles.items}>
          {shop.items.map((item) => (
            <li key={item.id}>
              <span className={styles.itemKind}>{item.kind}</span>
              <h3>{item.name}</h3>
              <p>{item.summary}</p>
              <ul className={styles.tags}>
                {item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <span className={styles.price} data-free={item.price === 'Free'}>
                {item.price}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/*
        The shop says what it is not. `node.state` is the registry's word, not
        this page's, so the caveat cannot outlive the thing it apologises for:
        when the shop actually opens, the state changes in one place.
      */}
      <aside className={styles.caveat} data-state={node.state}>
        <b>Not open for business yet</b>
        <p>{shop.caveat}</p>
        <p className={styles.caveatSource}>
          {node.name} is registered as <code>{node.state}</code> in the
          ecosystem index.
        </p>
      </aside>
    </div>
  );
}
