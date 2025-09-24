import { useAuthStore } from "@/stores/auth-store";

type PersistCapableStore = typeof useAuthStore & {
  persist?: {
    hasHydrated?: () => boolean;
    rehydrate?: () => Promise<void>;
  };
  getState: () => { token: string | null };
};

export const hydrateAuthStore = async (): Promise<void> => {
  const storeAny = useAuthStore as unknown as PersistCapableStore;
  if (!storeAny.persist?.hasHydrated?.()) {
    await storeAny.persist?.rehydrate?.();
  }
};

export const isUserAuthenticated = async (): Promise<boolean> => {
  const storeAny = useAuthStore as unknown as PersistCapableStore;
  await hydrateAuthStore();
  const { token } = storeAny.getState();
  return Boolean(token);
};
