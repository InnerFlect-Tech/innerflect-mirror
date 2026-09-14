import Link from 'next/link';
import { SurfaceState } from '@/components/company/SurfaceState';

export default function NotFound() {
  return (
    <main className="global-error">
      <SurfaceState status="empty" />
      <Link href="/">Return to Company</Link>
    </main>
  );
}
