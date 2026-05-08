export interface StorageBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createLocalStorageBackend(): StorageBackend {
  return {
    async get<T>(key: string): Promise<T | null> {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(value));
    },
    async remove(key: string): Promise<void> {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    },
  };
}
