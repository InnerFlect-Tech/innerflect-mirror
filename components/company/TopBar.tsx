'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import type { SceneState } from '@/lib/model/state';
import { stateColors } from '@/lib/tokens/state';
import { CommandCenter } from './CommandCenter';
import { ViewDrawer } from './ViewDrawer';
import { useCockpitStore } from '@/lib/store/cockpit';

/**
 * Client component now: the command bar and the notification tray are real
 * controls. A button that does nothing is worse than no button — it teaches
 * people the product is a mock-up.
 */
export function TopBar({
  status,
  state,
}: {
  status: string;
  state: SceneState;
}) {
  const accent = stateColors[state].label;
  const toggleNavigation = useCockpitStore((s) => s.setNavigationOpen);
  return (
    <header className="top">
      <div>
        <button
          className="mobile-menu"
          aria-label="Open navigation"
          onClick={() => toggleNavigation(true)}
        >
          <Menu size={18} />
        </button>
        <output
          className="status-live"
          aria-live="polite"
          style={{ color: accent }}
        >
          <i
            aria-hidden="true"
            style={{ background: accent, boxShadow: `0 0 9px ${accent}` }}
          />
          {status}
        </output>
      </div>
      <CommandCenter />
      <div className="top-actions">
        <Notifications />
        <ViewDrawer />
        <span>Sunday · 09:41</span>
      </div>
    </header>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  return (
    <div className="notif-wrap">
      <button
        aria-label="Notifications, 1 unread"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Bell size={16} aria-hidden="true" />
        <i aria-hidden="true" />
      </button>
      {open && (
        <div className="notif-panel">
          <span className="eyebrow">Needs you</span>
          <ul>
            <li>
              <Link href="/approvals">
                <b>Approve Essência Gate 1</b>
                <small>Delivery · 12 min ago</small>
              </Link>
            </li>
            <li>
              <Link href="/approvals">
                <b>Assign invoice reconciliation ownership</b>
                <small>Finance · overdue 56 days</small>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <b>Finance owner role is unfilled</b>
                <small>Constitution · blocking 1 process</small>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
