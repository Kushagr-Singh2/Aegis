/**
 * NearbyHelpCard — Shows closest emergency facilities
 *
 * Displays:
 * - Police (800m)
 * - Hospital (1.2km)
 * - Public Place (350m)
 *
 * Tapping a service provides guidance or pre-fills the dialer (never auto-calls).
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { EmergencyDialer } from '../../lib/EmergencyDialer';

type HelpFacility = {
  id: string;
  name: string;
  distance: string;
  type: 'police' | 'hospital' | 'public_place';
  phone?: string;
};

const NEARBY_SERVICES: HelpFacility[] = [
  {
    id: 'help_police',
    name: 'Police',
    distance: '800m',
    type: 'police',
    phone: '112',
  },
  {
    id: 'help_hospital',
    name: 'Hospital',
    distance: '1.2km',
    type: 'hospital',
    phone: '102',
  },
  {
    id: 'help_public',
    name: 'Public Place',
    distance: '350m',
    type: 'public_place',
  },
];

export function NearbyHelpCard() {
  const handleServicePress = (service: HelpFacility) => {
    if (service.phone) {
      EmergencyDialer.openDialer(service.phone);
    }
  };

  return (
    <Card variant="default" padding="md" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="map-marker-radius" size={18} color={Colors.brand.primary} />
          <Label style={styles.title}>NEARBY HELP</Label>
        </View>
        <BodySmall color={Colors.text.tertiary}>Within 2 km</BodySmall>
      </View>

      <View style={styles.list}>
        {NEARBY_SERVICES.map((service, index) => {
          const iconConfig = getIconConfig(service.type);
          return (
            <TouchableOpacity
              key={service.id}
              style={[styles.row, index < NEARBY_SERVICES.length - 1 && styles.rowBorder]}
              onPress={() => handleServicePress(service)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                <MaterialCommunityIcons
                  name={iconConfig.name as any}
                  size={20}
                  color={iconConfig.color}
                />
              </View>

              <View style={styles.info}>
                <Body style={styles.serviceName}>{service.name}</Body>
                <BodySmall color={Colors.text.secondary}>
                  {service.type === 'public_place' ? 'Verified safe shelter' : 'Emergency response ready'}
                </BodySmall>
              </View>

              <View style={styles.distanceBadge}>
                <MaterialCommunityIcons name="navigation-variant" size={12} color={Colors.brand.primary} />
                <Label style={styles.distanceText}>{service.distance}</Label>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
}

function getIconConfig(type: HelpFacility['type']): { name: string; color: string; bg: string } {
  switch (type) {
    case 'police':
      return {
        name: 'shield-alert',
        color: Colors.brand.primary,
        bg: Colors.brand.tint,
      };
    case 'hospital':
      return {
        name: 'hospital-box',
        color: Colors.danger.default,
        bg: Colors.danger.tint,
      };
    case 'public_place':
      return {
        name: 'storefront',
        color: Colors.safe.default,
        bg: Colors.safe.tint,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface.primary,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 1,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    fontWeight: '700',
    fontSize: 15,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.badge,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
  },
  distanceText: {
    color: Colors.brand.primaryLight,
    fontWeight: '700',
    fontSize: 11,
  },
});
