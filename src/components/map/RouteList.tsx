/**
 * RouteList — Horizontal scrollable list of RouteCards
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteCard } from './RouteCard';
import { Spacing } from '../../constants/spacing';
import type { MockRoute } from '../../lib/mockData';

type Props = {
  routes: MockRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (route: MockRoute) => void;
};

export function RouteList({ routes, selectedRouteId, onSelectRoute }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {routes.map((route) => (
        <View key={route.id} style={styles.cardWrapper}>
          <RouteCard
            route={route}
            isSelected={route.id === selectedRouteId}
            onSelect={() => onSelectRoute(route)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row',
    paddingBottom: 2,
  },
  cardWrapper: {
    width: 180,
  },
});
