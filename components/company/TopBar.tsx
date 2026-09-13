import { Bell, Menu, Search } from 'lucide-react';
import type { SceneState } from '@/lib/model/state';
import { stateColors } from '@/lib/tokens/state';

/** Server component. The only live part is the status text, which is passed in. */
export function TopBar({ status, state }: { status: string; state: SceneState }) {
  const accent = stateColors[state].label;
  return (
    <header className="top">
      <div>
        <button className="mobile-menu" aria-label="Open navigation"><Menu size={18} /></button>
        <output className="status-live" aria-live="polite" style={{ color: accent }}>
          <i aria-hidden="true" style={{ background: accent, boxShadow: `0 0 9px ${accent}` }} />
          {status}
        </output>
      </div>
      <button className="command">
        <Search size={15} />
        <span>Ask anything about the company</span>
        <kbd>⌘ K</kbd>
      </button>
      <div className="top-actions">
        <button aria-label="Notifications, 1 unread"><Bell size={16} /><i aria-hidden="true" /></button>
        <span>Sunday · 09:41</span>
      </div>
    </header>
  );
}
