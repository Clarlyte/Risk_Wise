import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

interface FolderNameDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialValue?: string;
  title: string;
}

export function FolderNameDialog({ visible, onClose, onSubmit, initialValue = '', title }: FolderNameDialogProps) {
  const [name, setName] = useState(initialValue);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter folder name"
            autoFocus
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={[styles.buttonText, styles.submitButtonText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#1294D5',
    borderRadius: 4,
  },
  buttonText: {
    color: '#1294D5',
  },
  submitButtonText: {
    color: 'white',
  },
});
