import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Folder } from '../types/pdf';

interface FolderContextType {
  folders: Folder[];
  loadFolders: () => Promise<void>;
  addFolder: (name: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);

  const loadFolders = useCallback(async () => {
    try {
      const storedFolders = await AsyncStorage.getItem('folders');
      if (storedFolders) {
        const parsedFolders = JSON.parse(storedFolders);
        if (Array.isArray(parsedFolders) && parsedFolders.length < 1000) {
          setFolders(parsedFolders);
        } else {
          console.warn('Invalid folders data detected, resetting...');
          await AsyncStorage.setItem('folders', JSON.stringify([]));
          setFolders([]);
        }
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      await AsyncStorage.setItem('folders', JSON.stringify([]));
      setFolders([]);
    }
  }, []);

  const saveFolders = async (updatedFolders: Folder[]) => {
    try {
      if (Array.isArray(updatedFolders) && updatedFolders.length < 1000) {
        await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
        setFolders(updatedFolders);
      } else {
        throw new Error('Invalid folders data');
      }
    } catch (error) {
      console.error('Error saving folders:', error);
      throw error;
    }
  };

  const addFolder = async (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
    };
    const updatedFolders = [...folders, newFolder];
    await saveFolders(updatedFolders);
    return newFolder;
  };

  const deleteFolder = async (id: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== id);
    await saveFolders(updatedFolders);
  };

  const updateFolder = async (id: string, name: string) => {
    const updatedFolders = folders.map(folder =>
      folder.id === id ? { ...folder, name } : folder
    );
    await saveFolders(updatedFolders);
  };

  return (
    <FolderContext.Provider value={{ 
      folders, 
      loadFolders, 
      addFolder, 
      deleteFolder, 
      updateFolder 
    }}>
      {children}
    </FolderContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
} 