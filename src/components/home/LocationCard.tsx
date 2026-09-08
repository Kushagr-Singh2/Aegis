/**
 * LocationCard — Current Location Card
 *
 * Requirements:
 * - 📍 Current Location
 * - "Getting your location..." (initial/loading)
 * - Mock GPS resolution
 * - Re-fetch/refresh button
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Body, BodySmall, Label } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type LocationCardProps = {
  initialLocation?: string;
  onLocationResolved?: (location: string) => void;
};

export function LocationCard({
  initialLocation,
  onLocationResolved,
}: LocationCardProps) {
  const [isLoading, setIsLoading] = useState(!initialLocation);
  const [currentAddress, setCurrentAddress] = useState<string | null>(
    initialLocation ?? null
  );

  const resolveMockLocation = () => {
    setIsLoading(true);
    // Simulate Android GPS lock
    const timer = setTimeout(() => {
      const mockLocation = 'Barakhamba Road, Connaught Place, New Delhi';
      setCurrentAddress(mockLocation);
      setIsLoading(false);
      onLocationResolved?.(mockLocation);
    }, 1200);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    if (!initialLocation) {
      const cleanup = resolveMockLocation();
      return cleanup;
    }
  }, []);

  return (
    <Card variant="default" padding="md" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={18}
            color={Colors.brand.primary}
          />
          <Label style={styles.labelText}>CURRENT LOCATION</Label>
        </View>

        <TouchableOpacity
          onPress={resolveMockLocation}
          disabled={isLoading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.refreshBtn}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.brand.primary} />
          ) : (
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={18}
              color={Colors.text.secondary}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={isLoading ? 'navigation-variant-outline' : 'check-circle-outline'}
            size={20}
            color={isLoading ? Colors.brand.primary : Colors.safe.default}
          />
        </View>
        <View style={styles.addressContainer}>
          <Body style={styles.addressText} numberOfLines={1}>
            {isLoading
              ? 'Getting your location...'
              : currentAddress ?? 'Location unavailable'}
          </Body>
          <BodySmall color={Colors.text.tertiary}>
            {isLoading
              ? 'Acquiring GPS signal (Mock)...'
              : 'GPS Signal Active • High Accuracy'}
          </BodySmall>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    color: Colors.text.secondary,
    letterSpacing: 1.2,
  },
  refreshBtn: {
    padding: 2,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  addressContainer: {
    flex: 1,
  },
  addressText: {
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
});
