import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export interface User {
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  authenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

type PersistedAuthState = Pick<AuthState, "token">;

// Storage that persists only the token string under key "auth-storage"
const authTokenPersistStorage: PersistStorage<PersistedAuthState> = {
  getItem: async (name) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([name], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        const token = (result[name] ?? null) as string | null;
        resolve({ state: { token }, version: 0 });
      });
    });
  },
  setItem: async (name, value) => {
    return new Promise<void>((resolve, reject) => {
      const token = value.state?.token ?? null;
      chrome.storage.local.set({ [name]: token }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  },
  removeItem: async (name) => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.remove([name], () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      authenticated: false,
      setUser: (user) => set({ user }),
      setAuthenticated: (authenticated) => set({ authenticated }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, authenticated: false }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthState): PersistedAuthState => ({
        token: state.token,
      }),
      storage: authTokenPersistStorage,
    }
  )
);
