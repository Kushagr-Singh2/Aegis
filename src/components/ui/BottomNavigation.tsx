/**
 * BottomNavigation — Mobile bottom navigation bar component
 *
 * Requirements:
 * - Home
 * - Journey
 * - Emergency
 * - Profile
 * - Only Home functional in Phase 1
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Label } from './Typography';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { FontFamily } from '../../constants/typography';

export type NavTab = 'home' | 'journey' | 'emergency' | 'profile';

type BottomNavigationProps = {
  activeTab?: NavTab;
  onTabPress?: (tab: NavTab) => void;
};

export function BottomNavigation({
  activeTab = 'home',
  onTabPress,
}: BottomNavigationProps) {
  const tabs: Array<{
    id: NavTab;
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
    isEmergency?: boolean;
  }> = [
    {
      id: 'home',
      label: 'Home',
      icon: 'shield-outline',
      activeIcon: 'shield',
    },
    {
      id: 'journey',
      label: 'Journey',
      icon: 'navigation-variant-outline',
      activeIcon: 'navigation-variant',
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: 'alert-octagon-outline',
      activeIcon: 'alert-octagon',
      isEmergency: true,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'account-outline',
      activeIcon: 'account',
    },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = tab.isEmergency
          ? Colors.danger.default
          : isActive
          ? Colors.brand.primary
          : Colors.text.tertiary;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onTabPress?.(tab.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={color}
            />
            <Label
              style={[
                styles.tabLabel,
                { color },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Label>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 68,
    backgroundColor: Colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
    paddingBottom: Spacing.xs,
    paddingTop: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
    fontFamily: FontFamily.bodyMedium,
  },
  activeTabLabel: {
    fontFamily: FontFamily.bodySemiBold,
  },
});
