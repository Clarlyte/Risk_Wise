import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ControlsSection } from './components/ControlsSection';
import { HazardsSection } from './components/HazardsSection';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Dashboard" onSettingsPress={handleSettingsPress} textColor="white" />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <ControlsSection />
      <HazardsSection searchQuery={searchQuery} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FC7524',
  },
});
