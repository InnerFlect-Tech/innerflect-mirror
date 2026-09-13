/**
 * An honest placeholder. The contract defines six surfaces; five are not built
 * yet. Saying so plainly is better than a dead control that implies otherwise —
 * each stub states the question that surface exists to answer.
 */
export function SurfaceStub({
  eyebrow,
  title,
  question,
  object,
  detail,
}: {
  eyebrow: string;
  title: string;
  question: string;
  object: string;
  detail: string;
}) {
  return (
    <section className="surface-stub">
      <span className="context">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="stub-question">{question}</p>
      <dl>
        <div><dt>Primary object</dt><dd>{object}</dd></div>
        <div><dt>Status</dt><dd>Not built yet</dd></div>
      </dl>
      <p className="stub-detail">{detail}</p>
    </section>
  );
}
