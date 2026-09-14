'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="global-error">
          <h1>Mirror could not start</h1>
          <p>
            The company has not been changed. Reload the operating surface to
            continue.
          </p>
          <button onClick={reset}>Reload Mirror</button>
        </main>
      </body>
    </html>
  );
}
