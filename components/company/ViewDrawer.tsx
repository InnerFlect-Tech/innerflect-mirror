'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { useCockpitStore, type CockpitView } from '@/lib/store/cockpit';

const views: { id: CockpitView; label: string; detail: string }[] = [
  {
    id: 'mirror',
    label: 'Spatial Mirror',
    detail: 'The company as a navigable operational system.',
  },
  {
    id: 'practical',
    label: 'Practical table',
    detail: 'The same records in a compact operational list.',
  },
];

const modules = [
  { id: 'market', label: 'Market' },
  { id: 'sales', label: 'Sales' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'finance', label: 'Finance' },
] as const;

export function ViewDrawer() {
  const open = useCockpitStore((state) => state.viewDrawerOpen);
  const setOpen = useCockpitStore((state) => state.setViewDrawerOpen);
  const view = useCockpitStore((state) => state.view);
  const setView = useCockpitStore((state) => state.setView);
  const activeModules = useCockpitStore((state) => state.activeModules);
  const toggleModule = useCockpitStore((state) => state.toggleModule);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="view-trigger" aria-label="Configure this view">
          <SlidersHorizontal />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay" />
        <Dialog.Content className="view-drawer">
          <Dialog.Title>View</Dialog.Title>
          <Dialog.Description>
            Choose how the same company records are projected.
          </Dialog.Description>
          <Dialog.Close
            className="drawer-close"
            aria-label="Close view settings"
          >
            <X />
          </Dialog.Close>
          <div
            className="view-options"
            role="radiogroup"
            aria-label="Company projection"
          >
            {views.map((item) => (
              <label
                key={item.id}
                className={view === item.id ? 'is-selected' : undefined}
              >
                <input
                  type="radio"
                  name="company-view"
                  value={item.id}
                  checked={view === item.id}
                  onChange={() => setView(item.id)}
                />
                <span>
                  <b>{item.label}</b>
                  <small>{item.detail}</small>
                </span>
                {view === item.id && <Check aria-hidden="true" />}
              </label>
            ))}
          </div>
          <h3 className="drawer-section-title">Company modules</h3>
          <div className="module-options" aria-label="Active company modules">
            {modules.map((module) => (
              <label key={module.id}>
                <input
                  type="checkbox"
                  checked={activeModules[module.id] !== false}
                  onChange={() => toggleModule(module.id)}
                />
                <span>{module.label}</span>
              </label>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
