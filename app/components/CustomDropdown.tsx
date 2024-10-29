import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  label: string;
  data: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  onAddItem?: (item: string) => void;
  selectedItems?: string[];
  onRemoveItem?: (item: string) => void;
  enableImageUpload?: boolean;
  onImageSelect?: (uri: string) => void;
}

export function CustomDropdown({ 
  label, 
  data, 
  value, 
  onChange,
  onAddItem,
  selectedItems = [],
  onRemoveItem,
  enableImageUpload = false,
  onImageSelect
}: DropdownProps) {
  const [showPicker, setShowPicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      onImageSelect?.(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>{label}:</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Text style={styles.dropdownText}>{value || 'Input'}</Text>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onChange(itemValue);
              if (onAddItem) onAddItem(itemValue.toString());
              setShowPicker(false);
            }}
            style={styles.picker}
          >
            {data.map((item) => (
              <Picker.Item 
                key={item.value.toString()} 
                label={item.label} 
                value={item.value} 
              />
            ))}
          </Picker>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                if (value && onAddItem) {
                  onAddItem(value.toString());
                  setShowPicker(false);
                }
              }}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            
            {enableImageUpload && (
              <TouchableOpacity 
                style={styles.imageButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {selectedItems.length > 0 && (
        <FlatList
          data={selectedItems}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{item}</Text>
              {onRemoveItem && (
                <TouchableOpacity onPress={() => onRemoveItem(item)}>
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flex: 2,
    backgroundColor: 'white',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 4,
  },
  picker: {
    height: 200,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  addButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#666',
    fontSize: 16,
  },
  imageButton: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    marginTop: 4,
    borderRadius: 8,
  },
  selectedItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
