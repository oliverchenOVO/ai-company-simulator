import { create } from 'zustand';
export type Page = 'Dashboard' | 'Office' | 'People' | 'Teams' | 'Product' | 'Customers' | 'Finance' | 'Inbox' | 'Timeline' | 'Settings';
// Only presentation choices live here; no world state or simulation entity mutation.
export const useUi = create<{ page: Page; selectedEmployee: string | null; selectedEvent: string | null; setPage: (page: Page) => void; selectEmployee: (id: string | null) => void; selectEvent: (id: string | null) => void }>(set => ({
  page: 'Dashboard', selectedEmployee: null, selectedEvent: null,
  setPage: page => set({ page, selectedEmployee: null }), selectEmployee: selectedEmployee => set({ selectedEmployee }), selectEvent: selectedEvent => set({ selectedEvent })
}));
