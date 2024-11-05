import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface HazardInputProps {
  onSave: (hazard: { description: string; images: string[] }) => void;
  onCancel: () => void;
}

export function HazardInput({ onSave, onCancel }: HazardInputProps) {
  const [description, setDescription] = useState('');
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
    if (!description.trim()) return;
    onSave({ description: description.trim(), images });
    setDescription('');
    setImages([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Describe the hazard"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <FontAwesome5 name="camera" size={20} color="#1294D5" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.imageSection}>
        <View style={styles.imagePreview}>
          {images.map((uri, index) => (
            <Image 
              key={index} 
              source={{ uri }} 
              style={styles.previewImage} 
            />
          ))}
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Add Hazard</Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
  },
  cameraButton: {
    marginLeft: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1294D5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    marginBottom: 16,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
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
    backgroundColor: '#1294D5',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButtonText: {
    color: 'white',
  },
});
