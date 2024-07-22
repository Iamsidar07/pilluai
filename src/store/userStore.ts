// store/userStore.ts
import { create } from "zustand";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export interface User {
  name: string;
  email: string;
  photoURL: string;
  uid: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  initializeAuth: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
        set({
          user: {
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            uid: user.uid,
          },
        });
      } else {
        console.log("User signed out");
        set({ user: null });
      }
    });
  },
}));

// Initialize the authentication listener
export const initializeAuthListener = () => {
  const { initializeAuth } = useUserStore.getState();
  initializeAuth();
};
