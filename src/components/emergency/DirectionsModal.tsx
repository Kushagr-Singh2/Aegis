/**
 * DirectionsModal — Route guidance to nearest safe shelter or emergency service
 *
 * Requirements:
 * - Current Location ↓ Selected Place
 * - Route line on map
 * - Distance, Walking ETA, Direction
 * - Mock routing
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import type { NearbyHelpPlace } from '../../lib/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  visible: boolean;
  place: NearbyHelpPlace | null;
  onClose: () => void;
};

export function DirectionsModal({ visible, place, onClose }: Props) {
  if (!visible || !place) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name="navigation-variant"
                size={22}
                color={Colors.brand.primary}
              />
              <Heading3 style={styles.title}>WALKING ROUTE</Heading3>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <MaterialCommunityIcons name="close" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Location Flow: Current Location ↓ Selected Place */}
          <Card variant="default" padding="sm" style={styles.flowCard}>
            <View style={styles.flowRow}>
              <View style={styles.flowDotsCol}>
                <View style={styles.originDot} />
                <View style={styles.dotConnector} />
                <View style={styles.destDot} />
              </View>

              <View style={styles.flowTextCol}>
                <View style={styles.flowItem}>
                  <Label style={styles.flowLabel}>CURRENT LOCATION</Label>
                  <Body style={styles.flowValue} numberOfLines={1}>
                    Connaught Place Outer Ring (Mock GPS)
                  </Body>
                </View>

                <View style={styles.flowItem}>
                  <Label style={styles.flowLabel}>DESTINATION</Label>
                  <Body style={styles.destValue} numberOfLines={1}>
                    {place.name}
                  </Body>
                  <BodySmall color={Colors.text.secondary} numberOfLines={1}>
                    {place.address}
                  </BodySmall>
                </View>
              </View>
            </View>
          </Card>

          {/* Mock Map Canvas with Route Line */}
          <View style={styles.mapCanvas}>
            {/* Grid overlay */}
            <View style={styles.mapGrid} pointerEvents="none">
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={`h_${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 16}%` as any }]} />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={`v_${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 18}%` as any }]} />
              ))}
            </View>

            {/* Mock Walking Route Polyline */}
            <View style={styles.routeSegment1} />
            <View style={styles.routeSegment2} />

            {/* Current Position Pin */}
            <View style={styles.originPin}>
              <View style={styles.originPulse} />
              <View style={styles.originCore} />
            </View>

            {/* Destination Pin */}
            <View style={styles.destPin}>
              <MaterialCommunityIcons name="map-marker" size={28} color={Colors.danger.default} />
              <View style={styles.pinLabel}>
                <BodySmall style={styles.pinLabelText} numberOfLines={1}>
                  {place.name}
                </BodySmall>
              </View>
            </View>

            {/* Route ETA pill on map */}
            <View style={styles.etaPill}>
              <MaterialCommunityIcons name="walk" size={14} color={Colors.white} />
              <Label style={styles.etaPillText}>{place.walkingEta}</Label>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Label style={styles.metricLabel}>DISTANCE</Label>
              <Heading3 style={styles.metricValue}>{place.distance}</Heading3>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Label style={styles.metricLabel}>ESTIMATED WALK</Label>
              <Heading3 style={styles.metricValue}>{place.walkingEta}</Heading3>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Label style={styles.metricLabel}>DIRECTION</Label>
              <Heading3 style={styles.metricValue}>{place.direction}</Heading3>
            </View>
          </View>

          {/* Action CTA */}
          <Button
            label="START WALKING GUIDANCE"
            variant="primary"
            size="lg"
            onPress={onClose}
            leftIcon={
              <MaterialCommunityIcons
                name="navigation-variant"
                size={20}
                color={Colors.white}
              />
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.elevated,
    borderTopLeftRadius: BorderRadius.modal,
    borderTopRightRadius: BorderRadius.modal,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border.default,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    letterSpacing: 1,
    color: Colors.brand.primaryLight,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowCard: {
    backgroundColor: Colors.surface.primary,
  },
  flowRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    alignItems: 'center',
  },
  flowDotsCol: {
    alignItems: 'center',
    width: 16,
    gap: 2,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand.primary,
  },
  dotConnector: {
    width: 2,
    height: 28,
    backgroundColor: Colors.border.default,
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger.default,
  },
  flowTextCol: {
    flex: 1,
    gap: Spacing.xs,
  },
  flowItem: {
    gap: 1,
  },
  flowLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
  },
  flowValue: {
    fontSize: 13,
    color: Colors.text.primary,
  },
  destValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.primaryLight,
  },
  mapCanvas: {
    height: 170,
    backgroundColor: '#161C2C',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  routeSegment1: {
    position: 'absolute',
    left: 45,
    top: 110,
    width: 140,
    height: 4,
    backgroundColor: Colors.brand.primary,
    transform: [{ rotate: '-32deg' }],
    transformOrigin: '0 50%',
    borderRadius: 2,
  },
  routeSegment2: {
    position: 'absolute',
    left: 164,
    top: 40,
    width: 120,
    height: 4,
    backgroundColor: Colors.brand.primary,
    transform: [{ rotate: '12deg' }],
    transformOrigin: '0 50%',
    borderRadius: 2,
  },
  originPin: {
    position: 'absolute',
    left: 36,
    top: 102,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  originPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 217, 0.35)',
  },
  originCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  destPin: {
    position: 'absolute',
    right: 32,
    top: 25,
    alignItems: 'center',
  },
  pinLabel: {
    backgroundColor: Colors.background.overlay,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: -2,
    maxWidth: 100,
  },
  pinLabelText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  etaPill: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.badge,
  },
  etaPillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: Colors.border.default,
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    color: Colors.brand.primaryLight,
  },
});
