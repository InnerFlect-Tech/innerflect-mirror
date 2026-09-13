import { FloorPreview } from '@/components/company-world/design/FloorPreview';
import { domains } from '@/data/company';

export const metadata = { title: 'Floor · Design', robots: 'noindex' };

export default function Page() {
  return <FloorPreview domains={domains} />;
}
