import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <FontAwesome name="bars" size={20} color="gray" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search report"
        value={value}
        onChangeText={onChangeText}
      />
      <FontAwesome name="search" size={20} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
  },
});
