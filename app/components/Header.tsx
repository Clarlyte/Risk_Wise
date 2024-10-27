import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  onSettingsPress: () => void;
  textColor?: string;
}

export function Header({ title, onSettingsPress, textColor = 'black' }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <TouchableOpacity onPress={onSettingsPress}>
        <FontAwesome name="gear" size={24} color={textColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
