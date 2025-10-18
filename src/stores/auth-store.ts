import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export interface User {
  _id: string;
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  googleId: string;
  provider: string;
  username: string;
  auth_provider: string;
  auth_provider_id: string;
  tier: string;
  karma_points: number;
  role: string;
  isVerified: true;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
