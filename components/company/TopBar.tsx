'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Menu, Search } from 'lucide-react';
import type { SceneState } from '@/lib/model/state';
import { stateColors } from '@/lib/tokens/state';

/**
 * Client component now: the command bar and the notification tray are real
 * controls. A button that does nothing is worse than no button — it teaches
 * people the product is a mock-up.
 */
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
      <CommandBar />
      <div className="top-actions">
        <Notifications />
        <span>Sunday · 09:41</span>
      </div>
    </header>
  );
}


function CommandBar() {
  const [open, setOpen] = useState(false);
  const suggestions = [
    { label: 'Why is Finance at risk?', to: '/' },
    { label: 'Which processes need evidence?', to: '/processes' },
    { label: 'What needs my approval?', to: '/approvals' },
    { label: 'What has drifted from policy?', to: '/knowledge' },
    { label: 'What value did autonomy return?', to: '/outcomes' },
  ];

  return (
    <div className="command-wrap">
      <button className="command" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Search size={15} aria-hidden="true" />
        <span>Ask anything about the company</span>
        <kbd>⌘ K</kbd>
      </button>
      {open && (
        <div className="command-panel">
          <span className="eyebrow">Try</span>
          <ul>
            {suggestions.map((s) => (
              <li key={s.label}><Link href={s.to}>{s.label}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  return (
    <div className="notif-wrap">
      <button aria-label="Notifications, 1 unread" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={16} aria-hidden="true" /><i aria-hidden="true" />
      </button>
      {open && (
        <div className="notif-panel">
          <span className="eyebrow">Needs you</span>
          <ul>
            <li><Link href="/approvals"><b>Approve Essência Gate 1</b><small>Delivery · 12 min ago</small></Link></li>
            <li><Link href="/approvals"><b>Assign invoice reconciliation ownership</b><small>Finance · overdue 56 days</small></Link></li>
            <li><Link href="/settings"><b>Finance owner role is unfilled</b><small>Constitution · blocking 1 process</small></Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}
