/** Server component. Every surface opens the same way: what it is, then its pulse. */
export function SurfaceHead({
  eyebrow,
  title,
  pulse,
  aside,
}: {
  eyebrow: string;
  title: string;
  pulse: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className="surface-head">
      <div>
        <span className="context">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{pulse}</p>
      </div>
      {aside}
    </section>
  );
}
