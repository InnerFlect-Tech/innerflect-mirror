'use client';

import { useEffect } from 'react';
import { SurfaceState } from '@/components/company/SurfaceState';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('mirror.surface.error', {
      name: error.name,
      digest: error.digest,
    });
  }, [error]);
  return (
    <div>
      <SurfaceState status="unavailable" />
      <button className="error-retry" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
