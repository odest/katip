import { create } from "zustand";
import { User } from "@workspace/database/schema/sqlite";

interface UserState {
  localUser: User | null;
  setLocalUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  localUser: null,
  setLocalUser: (localUser) => set({ localUser }),
}));
