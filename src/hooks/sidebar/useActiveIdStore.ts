import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveIdState {
  activeId: number | null;
  setActiveId: (id: number | null) => void;
}

export const useActiveIdStore = create<ActiveIdState>()(
  persist(
    (set) => ({
      activeId: 1,
      setActiveId: (id) => set({ activeId: id }),
    }),
    {
      name: "active-id-storage",
    }
  )
);
