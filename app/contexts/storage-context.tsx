import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { HybridStorageService } from '../services/storage-service';

const StorageContext = createContext<HybridStorageService | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [storageService] = useState(() => new HybridStorageService());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    storageService.initialize()
      .then(() => setIsInitialized(true))
      .catch(error => console.error('Failed to initialize storage service:', error));
  }, [storageService]);

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <StorageContext.Provider value={storageService}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
} 