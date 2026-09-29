import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.select({ ios: 49 + insets.bottom, default: 60 + insets.bottom });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2EDE0',
          borderTopWidth: 1,
          ...(Platform.OS === 'web'
            ? { height: 'auto', minHeight: 'auto', paddingTop: 6, paddingBottom: 6 }
            : {
                height: tabBarHeight,
                paddingBottom: Math.max(6, insets.bottom),
                paddingTop: 6,
              }),
          elevation: 0,
        },
        tabBarActiveTintColor: '#1E6B35',
        tabBarInactiveTintColor: '#7D9480',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'house.fill' : 'house'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'chart.bar.fill' : 'chart.bar'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <Icon name="camera.fill" size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'person.fill' : 'person'} size={24} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
