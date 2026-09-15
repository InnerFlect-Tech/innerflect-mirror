'use client';

import { create } from 'zustand';

export type CockpitView = 'mirror' | 'practical';

type CockpitState = {
  commandOpen: boolean;
  navigationOpen: boolean;
  viewDrawerOpen: boolean;
  view: CockpitView;
  selectedRecordId: string | null;
  activeModules: Record<string, boolean>;
  setCommandOpen: (open: boolean) => void;
  setNavigationOpen: (open: boolean) => void;
  setViewDrawerOpen: (open: boolean) => void;
  setView: (view: CockpitView) => void;
  selectRecord: (id: string | null) => void;
  toggleModule: (id: string) => void;
};

/**
 * Ephemeral interface state only. Company records and operation results never
 * live here and are deliberately not persisted to browser storage.
 */
export const useCockpitStore = create<CockpitState>((set) => ({
  commandOpen: false,
  navigationOpen: false,
  viewDrawerOpen: false,
  view: 'mirror',
  selectedRecordId: null,
  activeModules: { market: true, sales: true, delivery: true, finance: true },
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setNavigationOpen: (navigationOpen) => set({ navigationOpen }),
  setViewDrawerOpen: (viewDrawerOpen) => set({ viewDrawerOpen }),
  setView: (view) => set({ view }),
  selectRecord: (selectedRecordId) => set({ selectedRecordId }),
  toggleModule: (id) =>
    set((state) => ({
      activeModules: { ...state.activeModules, [id]: !state.activeModules[id] },
    })),
}));
