import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FolderNameDialog } from './components/FolderNameDialog';

interface Folder {
  id: string;
  name: string;
}

// Add this helper function at the top level
function validateFolderName(name: string): boolean {
  return name.trim().length > 0;
}

export default function RecordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isAddDialogVisible, setIsAddDialogVisible] = useState(false);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const storedFolders = await AsyncStorage.getItem('folders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const saveFolders = async (updatedFolders: Folder[]) => {
    try {
      await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const editFolderName = (id: string) => {
    setSelectedFolderId(id);
    setIsEditDialogVisible(true);
  };

  const handleEditSubmit = (newName: string) => {
    if (!selectedFolderId) return;
    
    const updatedFolders = folders.map(folder =>
      folder.id === selectedFolderId ? { ...folder, name: newName } : folder
    );
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
    setSelectedFolderId(null);
  };

  const shareFolder = (id: string) => {
    // Implement sharing functionality here
    Alert.alert('Share', 'Sharing functionality to be implemented');
  };

  const deleteFolder = (id: string) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to delete this folder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedFolders = folders.filter(folder => folder.id !== id);
            setFolders(updatedFolders);
            saveFolders(updatedFolders);
          },
        },
      ]
    );
  };

  const renderFolderItem = ({ item }: { item: Folder }) => (
    <View style={styles.folderItem}>
      <FontAwesome5 name="folder" size={24} color="#1294D5" />
      <Text style={styles.folderName}>{item.name}</Text>
      <View style={styles.folderActions}>
        <TouchableOpacity onPress={() => editFolderName(item.id)}>
          <FontAwesome5 name="edit" size={20} color="#1294D5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => shareFolder(item.id)}>
          <FontAwesome5 name="share-alt" size={20} color="#1294D5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteFolder(item.id)}>
          <FontAwesome5 name="trash-alt" size={20} color="#1294D5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Records" onSettingsPress={() => {}} />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <FlatList
          style={styles.list}
          data={filteredFolders}
          renderItem={renderFolderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No folders found</Text>}
        />
        
        <FolderNameDialog
          visible={isAddDialogVisible}
          onClose={() => setIsAddDialogVisible(false)}
          onSubmit={addFolder}
          title="New Folder"
        />
        
        <FolderNameDialog
          visible={isEditDialogVisible}
          onClose={() => setIsEditDialogVisible(false)}
          onSubmit={handleEditSubmit}
          initialValue={folders.find(f => f.id === selectedFolderId)?.name}
          title="Rename Folder"
        />
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setIsAddDialogVisible(true)}
        >
          <FontAwesome5 name="plus" size={18} color="white" />
          <Text style={styles.addButtonText}>Add folder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FC7524',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F1F9',
  },
  list: {
    flex: 1,
    backgroundColor: '#F2F1F9',
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  folderName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  folderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 80, // Increased to account for the footer
    backgroundColor: '#FC7524',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
