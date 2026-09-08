/**
 * MockMapView — Schematic map placeholder
 *
 * A styled View that represents a map. Draws:
 * - Subtle grid background (street pattern suggestion)
 * - Current location dot (bottom-left area)
 * - Destination pin (top-right area)
 * - Route polyline(s) between them
 *
 * This intentionally looks like a development placeholder.
 * Replace with a real map SDK (e.g. MapLibre, react-native-maps) in Phase 3.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BodySmall } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/spacing';
import type { MockRoute } from '../../lib/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 260;

type Props = {
  routes?: MockRoute[];
  selectedRouteId?: string;
  destinationName?: string;
  style?: object;
};

const ROUTE_COLORS: Record<string, string> = {
  route_a: '#F5A623',   // amber — heavy traffic
  route_b: '#00C896',   // green — recommended
  route_c: '#4A90D9',   // blue — alternative
};

export function MockMapView({
  routes = [],
  selectedRouteId,
  destinationName,
  style,
}: Props) {
  const mapWidth = SCREEN_WIDTH - 0; // full width

  return (
    <View style={[styles.container, style]}>
      {/* Grid background — subtle street pattern */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 11}%` as any }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 14}%` as any }]} />
        ))}
      </View>

      {/* Route lines */}
      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId;
        const color = ROUTE_COLORS[route.id] ?? Colors.brand.primary;
        const opacity = isSelected ? 1 : selectedRouteId ? 0.25 : 0.7;
        const lineWidth = isSelected ? 4 : 2;

        return route.waypoints.slice(0, -1).map((pt, idx) => {
          const next = route.waypoints[idx + 1];
          const x1 = pt.x * mapWidth;
          const y1 = pt.y * MAP_HEIGHT;
          const x2 = next.x * mapWidth;
          const y2 = next.y * MAP_HEIGHT;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <View
              key={`${route.id}-seg-${idx}`}
              style={{
                position: 'absolute',
                left: x1,
                top: y1,
                width: length,
                height: lineWidth,
                backgroundColor: color,
                opacity,
                borderRadius: lineWidth / 2,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: '0 50%',
              }}
              pointerEvents="none"
            />
          );
        });
      })}

      {/* Current location pin */}
      <View style={[styles.currentPin, { left: mapWidth * 0.18 - 10, top: MAP_HEIGHT * 0.82 - 10 }]}>
        <View style={styles.currentPinOuter}>
          <View style={styles.currentPinInner} />
        </View>
      </View>

      {/* Destination pin */}
      <View style={[styles.destPin, { left: mapWidth * 0.78 - 14, top: MAP_HEIGHT * 0.22 - 36 }]}>
        <MaterialCommunityIcons name="map-marker" size={32} color={Colors.danger.default} />
        {destinationName && (
          <View style={styles.destLabel}>
            <BodySmall style={styles.destLabelText} numberOfLines={1}>
              {destinationName}
            </BodySmall>
          </View>
        )}
      </View>

      {/* Dev watermark */}
      <View style={styles.devWatermark} pointerEvents="none">
        <BodySmall style={styles.devWatermarkText}>MOCK MAP — Phase 2</BodySmall>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#1A2235',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: BorderRadius.lg,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  currentPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPinOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(74,144,217,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  currentPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
  },
  destPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  destLabel: {
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
    maxWidth: 100,
  },
  destLabelText: {
    color: Colors.text.primary,
    fontSize: 10,
  },
  devWatermark: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  devWatermarkText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
