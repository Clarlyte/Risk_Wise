import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAssessment } from './AssessmentContext'; // Import the Assessment context

interface Folder {
  id: string;
  name: string;
}

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
  const { resetAssessment } = useAssessment(); // Get the reset function

  const loadFolders = useCallback(async () => {
    try {
      const storedFolders = await AsyncStorage.getItem('folders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  }, []);

  const saveFolders = async (updatedFolders: Folder[]) => {
    try {
      await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  };

  const addFolder = async (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
    };
    const updatedFolders = [...folders, newFolder];
    await saveFolders(updatedFolders);
    
    resetAssessment(); // Reset assessments when a new folder is created
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
    <FolderContext.Provider value={{ folders, loadFolders, addFolder, deleteFolder, updateFolder }}>
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