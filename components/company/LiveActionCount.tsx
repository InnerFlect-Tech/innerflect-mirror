'use client';

import { useEffect, useState } from 'react';

/**
 * The one genuinely live number in the hero. Isolated so the rest of the hero
 * stays a server component instead of dragging the whole shell to the client.
 */
export function LiveActionCount({ from }: { from: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const timer = window.setInterval(() => setCount((v) => v + 1), 3200);
    return () => window.clearInterval(timer);
  }, []);

  return <span>{count.toLocaleString()}</span>;
}
