import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FolderNameDialog } from './components/FolderNameDialog';
import { useRouter } from 'expo-router';
import { useFolders } from './contexts/FolderContext';
import { useFocusEffect } from '@react-navigation/native';
import { Folder } from './types/pdf';

export default function RecordsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogVisible, setIsAddDialogVisible] = useState(false);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { folders, addFolder, deleteFolder, updateFolder, loadFolders } = useFolders();

  // Keep only this effect
  useFocusEffect(
    React.useCallback(() => {
      loadFolders();
    }, [loadFolders])
  );

  const handleAddFolder = async (name: string) => {
    try {
      await addFolder(name);
      await loadFolders(); // Reload after adding
    } catch (error) {
      console.error('Error adding folder:', error);
      Alert.alert('Error', 'Failed to add folder');
    }
  };

  const handleEditSubmit = async (newName: string) => {
    if (!selectedFolderId) return;
    try {
      await updateFolder(selectedFolderId, newName);
      await loadFolders(); // Reload after updating
      setSelectedFolderId(null);
    } catch (error) {
      console.error('Error updating folder:', error);
      Alert.alert('Error', 'Failed to update folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to delete this folder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFolder(id);
              await loadFolders(); // Reload after deleting
            } catch (error) {
              console.error('Error deleting folder:', error);
              Alert.alert('Error', 'Failed to delete folder');
            }
          },
        },
      ]
    );
  };

  const editFolderName = (id: string) => {
    setSelectedFolderId(id);
    setIsEditDialogVisible(true);
  };

  const renderFolderItem = ({ item }: { item: Folder }) => (
    <View style={styles.folderItem}>
      <FontAwesome5 name="folder" size={24} color="#1294D5" />
      <Text style={styles.folderName}>{item.name}</Text>
      <View style={styles.folderActions}>
        <TouchableOpacity onPress={() => editFolderName(item.id)}>
          <FontAwesome5 name="edit" size={20} color="#1294D5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteFolder(item.id)}>
          <FontAwesome5 name="trash-alt" size={20} color="#FF3B30" />
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
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/records/folder',
                params: { folderId: item.id, folderName: item.name }
              })}
            >
              {renderFolderItem({ item })}
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No folders found</Text>}
        />

        <FolderNameDialog
          visible={isAddDialogVisible}
          onClose={() => setIsAddDialogVisible(false)}
          onSubmit={handleAddFolder}
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
    width: 70,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
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