import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { TabNavigationState, ParamListBase } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { FolderProvider } from './contexts/FolderContext';

const { width: screenWidth } = Dimensions.get('window');

// Define types for the CustomTabBar props
interface CustomTabBarProps {
  state: TabNavigationState<ParamListBase>;
  descriptors: Record<string, any>;
  navigation: any;
}

// Define a type for the route
interface RouteType {
  key: string;
  name: string;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const router = useRouter();

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: RouteType, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          // Update this section
          if (route.name === 'add') {
            router.push('/add/activity');  // Update the path
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: string;
        if (route.name === 'index') {
          iconName = 'chart-bar';
        } else if (route.name === 'add') {
          iconName = 'plus';
        } else if (route.name === 'records') {
          iconName = 'file-alt';
        } else {
          iconName = 'question'; // Default icon
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { left: (index * screenWidth) / 3 },
              route.name === 'add' && styles.addButton,
            ]}
          >
            <FontAwesome5 
              name={iconName} 
              size={route.name === 'add' ? 25 : 30} 
              color={route.name === 'add' ? 'white' : (isFocused ? '#1294D5' : '#888888')} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function AppLayout() {
  return (
    <FolderProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="add" />
        <Tabs.Screen name="records" />
      </Tabs>
    </FolderProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    position: 'absolute',
    width: screenWidth / 3,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1294D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    left: (screenWidth - 50) / 2, // Center the add button
  },
});
