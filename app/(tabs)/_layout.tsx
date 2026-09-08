/**
 * Tabs Layout — Bottom Tab Navigation
 *
 * Configures the primary four tabs:
 * 1. HOME (index)
 * 2. JOURNEY (journey)
 * 3. EMERGENCY (emergency)
 * 4. PROFILE (profile)
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontFamily } from '../../src/constants/typography';
import { useJourneyStore } from '../../src/store/useJourneyStore';

export default function TabLayout() {
  const status = useJourneyStore((s) => s.status);
  const isSOSActive = status === 'sos';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background.elevated,
          borderTopColor: Colors.border.default,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: {
          fontFamily: FontFamily.bodyMedium,
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'shield' : 'shield-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'navigation-variant' : 'navigation-variant-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarActiveTintColor: Colors.danger.default,
          tabBarIcon: ({ size, focused }) => (
            <MaterialCommunityIcons
              name={focused || isSOSActive ? 'alert-octagon' : 'alert-octagon-outline'}
              size={size}
              color={isSOSActive ? Colors.danger.extreme : focused ? Colors.danger.default : Colors.text.tertiary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
