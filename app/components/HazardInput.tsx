import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CustomDropdown } from './CustomDropdown';

interface HazardInputProps {
  onSave: (hazard: { description: string; images: string[] }) => void;
  onCancel: () => void;
}

const predefinedHazards = [
  { label: 'Fall from Height', value: 'Fall from Height' },
  { label: 'Electrical Shock', value: 'Electrical Shock' },
  { label: 'Chemical Exposure', value: 'Chemical Exposure' },
  { label: 'Custom Hazard', value: 'custom' },
];

export function HazardInput({ onSave, onCancel }: HazardInputProps) {
  const [selectedHazard, setSelectedHazard] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSave = () => {
    const description = selectedHazard === 'custom' ? customDescription.trim() : selectedHazard;
    if (!description) return;
    onSave({ description, images });
    setSelectedHazard('');
    setCustomDescription('');
    setImages([]);
  };

  const handleCancel = () => {
    setSelectedHazard('');
    setCustomDescription('');
    setImages([]);
    onCancel();
  };

  const isValid = () => {
    const description = selectedHazard === 'custom' ? customDescription.trim() : selectedHazard;
    return description && images.length > 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.dropdownContainer}>
          <CustomDropdown
            label="Select Hazard"
            data={predefinedHazards}
            value={selectedHazard}
            onChange={(value) => {
              setSelectedHazard(value.toString());
              if (value !== 'custom') {
                setCustomDescription('');
              }
            }}
          />
        </View>
        
        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <FontAwesome5 name="camera" size={20} color="#1294D5" />
        </TouchableOpacity>
      </View>

      {selectedHazard === 'custom' && (
        <TextInput
          style={styles.customInput}
          placeholder="Describe the custom hazard"
          value={customDescription}
          onChangeText={setCustomDescription}
          multiline
          numberOfLines={4}
        />
      )}
      
      <View style={styles.imageSection}>
        {images.map((uri, index) => (
          <Image 
            key={index} 
            source={{ uri }} 
            style={styles.previewImage} 
          />
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.button,
            isValid() ? styles.saveButton : styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={!isValid()}
        >
          <Text style={[
            styles.saveButtonText,
            !isValid() && styles.saveButtonTextDisabled
          ]}>Add Hazard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dropdownContainer: {
    flex: 1,
  },
  cameraButton: {
    bottom: -6,
    right: 0,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1294D5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    backgroundColor: '#FFF3CD',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imageSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007BFF',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButtonText: {
    color: 'white',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
});

