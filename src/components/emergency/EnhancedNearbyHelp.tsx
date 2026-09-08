/**
 * EnhancedNearbyHelp — Safe destinations and emergency services
 *
 * Requirements:
 * - ⭐ RECOMMENDED SAFE DESTINATION (Shopping Mall, 350m, 5 min walk, Estimated activity: HIGH)
 * - Police Station (800m, 10 min walk, ↗ NE, Open)
 * - Hospital (1.2km, 14 min walk, → E, Open)
 * - Public places described as "Nearby Public Places"
 * - Clear disclaimer: Do not claim every public place is guaranteed safe.
 * - Activity labeled as "Estimated activity" (LOW, MEDIUM, HIGH)
 * - Show: Distance, Walking ETA, Direction, Open status, Route button
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import {
  MOCK_NEARBY_HELP_PLACES,
  type NearbyHelpPlace,
  type ActivityLevel,
} from '../../lib/mockData';
import { EmergencyDialer } from '../../lib/EmergencyDialer';

type Props = {
  onSelectPlaceForDirections: (place: NearbyHelpPlace) => void;
};

const ACTIVITY_COLORS: Record<ActivityLevel, { text: string; bg: string }> = {
  HIGH: { text: Colors.safe.default, bg: Colors.safe.tint },
  MEDIUM: { text: Colors.warning.default, bg: Colors.warning.tint },
  LOW: { text: Colors.text.tertiary, bg: Colors.surface.secondary },
};

export function EnhancedNearbyHelp({ onSelectPlaceForDirections }: Props) {
  const recommendedPlace = MOCK_NEARBY_HELP_PLACES.find((p) => p.isRecommended) ?? MOCK_NEARBY_HELP_PLACES[0];
  const policePlace = MOCK_NEARBY_HELP_PLACES.find((p) => p.category === 'police');
  const hospitalPlace = MOCK_NEARBY_HELP_PLACES.find((p) => p.category === 'hospital');
  const publicPlaces = MOCK_NEARBY_HELP_PLACES.filter((p) => p.category === 'public_place');

  return (
    <View style={styles.container}>
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-search" size={20} color={Colors.brand.primary} />
        <Heading3 style={styles.headerTitle}>NEARBY HELP</Heading3>
      </View>

      {/* ── ⭐ RECOMMENDED SAFE DESTINATION ────────────────────────────── */}
      <Card variant="safe" padding="md" style={styles.recommendedCard}>
        <View style={styles.recBadgeRow}>
          <View style={styles.recBadge}>
            <MaterialCommunityIcons name="star" size={13} color="#FFD700" />
            <Label style={styles.recBadgeText}>RECOMMENDED SAFE DESTINATION</Label>
          </View>
        </View>

        <View style={styles.recContent}>
          <View style={styles.recInfo}>
            <Heading3 style={styles.recName}>{recommendedPlace.name}</Heading3>
            <BodySmall color={Colors.text.secondary}>
              {recommendedPlace.address}
            </BodySmall>
          </View>

          {/* Metrics row */}
          <View style={styles.recMetricsRow}>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="map-marker-distance" size={14} color={Colors.brand.primary} />
              <BodySmall style={styles.chipText}>{recommendedPlace.distance}</BodySmall>
            </View>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="walk" size={14} color={Colors.brand.primary} />
              <BodySmall style={styles.chipText}>{recommendedPlace.walkingEta}</BodySmall>
            </View>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="compass-outline" size={14} color={Colors.brand.primary} />
              <BodySmall style={styles.chipText}>{recommendedPlace.direction}</BodySmall>
            </View>
          </View>

          {/* Activity pill */}
          {recommendedPlace.estimatedActivity && (
            <View style={styles.activityRow}>
              <Label style={styles.activityLabel}>Estimated activity:</Label>
              <View
                style={[
                  styles.activityPill,
                  { backgroundColor: ACTIVITY_COLORS[recommendedPlace.estimatedActivity].bg },
                ]}
              >
                <BodySmall
                  style={[
                    styles.activityPillText,
                    { color: ACTIVITY_COLORS[recommendedPlace.estimatedActivity].text },
                  ]}
                >
                  {recommendedPlace.estimatedActivity}
                </BodySmall>
              </View>
            </View>
          )}

          {/* Action CTA */}
          <View style={styles.recActionWrap}>
            <Button
              label="GET DIRECTIONS"
              variant="primary"
              size="md"
              onPress={() => onSelectPlaceForDirections(recommendedPlace)}
              leftIcon={
                <MaterialCommunityIcons name="directions" size={18} color={Colors.white} />
              }
            />
          </View>
        </View>
      </Card>

      {/* ── Emergency Services: Police & Hospital ──────────────────────── */}
      <Card variant="default" padding="md" style={styles.servicesCard}>
        <Label style={styles.subSectionTitle}>EMERGENCY AUTHORITIES</Label>

        {policePlace && (
          <ServiceRow
            place={policePlace}
            icon="shield-alert"
            iconColor={Colors.brand.primary}
            onDirections={() => onSelectPlaceForDirections(policePlace)}
            onCall={policePlace.phone ? () => EmergencyDialer.openDialer(policePlace.phone!) : undefined}
          />
        )}

        <Divider marginVertical={8} />

        {hospitalPlace && (
          <ServiceRow
            place={hospitalPlace}
            icon="hospital-box"
            iconColor={Colors.danger.default}
            onDirections={() => onSelectPlaceForDirections(hospitalPlace)}
            onCall={hospitalPlace.phone ? () => EmergencyDialer.openDialer(hospitalPlace.phone!) : undefined}
          />
        )}
      </Card>

      {/* ── Nearby Public Places ───────────────────────────────────────── */}
      <Card variant="default" padding="md" style={styles.publicPlacesCard}>
        <View style={styles.publicHeader}>
          <Label style={styles.subSectionTitle}>NEARBY PUBLIC PLACES</Label>
        </View>

        {/* Explicit safety disclaimer */}
        <View style={styles.disclaimerBox}>
          <MaterialCommunityIcons name="information-outline" size={14} color={Colors.text.tertiary} />
          <BodySmall style={styles.disclaimerText}>
            Public places offer visibility and active bystander presence. Aegis does not claim every public place is guaranteed safe.
          </BodySmall>
        </View>

        <View style={styles.publicList}>
          {publicPlaces.map((place, idx) => (
            <View key={place.id}>
              <View style={styles.publicRow}>
                <View style={styles.publicLeft}>
                  <Body style={styles.publicName}>{place.name}</Body>
                  <View style={styles.publicMeta}>
                    <BodySmall color={Colors.text.tertiary}>
                      {place.distance} · {place.walkingEta} · {place.direction}
                    </BodySmall>
                  </View>
                  {place.estimatedActivity && (
                    <View style={styles.activityRowSmall}>
                      <BodySmall style={styles.activityLabelSmall}>Estimated activity:</BodySmall>
                      <View
                        style={[
                          styles.activityPillSmall,
                          { backgroundColor: ACTIVITY_COLORS[place.estimatedActivity].bg },
                        ]}
                      >
                        <BodySmall
                          style={[
                            styles.activityPillTextSmall,
                            { color: ACTIVITY_COLORS[place.estimatedActivity].text },
                          ]}
                        >
                          {place.estimatedActivity}
                        </BodySmall>
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.routeBtn}
                  onPress={() => onSelectPlaceForDirections(place)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="navigation-variant" size={14} color={Colors.brand.primary} />
                  <BodySmall style={styles.routeBtnText}>ROUTE</BodySmall>
                </TouchableOpacity>
              </View>
              {idx < publicPlaces.length - 1 && <Divider marginVertical={8} />}
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

function ServiceRow({
  place,
  icon,
  iconColor,
  onDirections,
  onCall,
}: {
  place: NearbyHelpPlace;
  icon: string;
  iconColor: string;
  onDirections: () => void;
  onCall?: () => void;
}) {
  return (
    <View style={serviceStyles.row}>
      <View style={[serviceStyles.iconCircle, { backgroundColor: `${iconColor}18` }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
      </View>

      <View style={serviceStyles.textCol}>
        <View style={serviceStyles.nameRow}>
          <Body style={serviceStyles.name}>{place.name}</Body>
          {place.isOpen && (
            <View style={serviceStyles.openPill}>
              <BodySmall style={serviceStyles.openText}>Open</BodySmall>
            </View>
          )}
        </View>
        <BodySmall color={Colors.text.tertiary}>
          {place.distance} · {place.walkingEta} · {place.direction}
        </BodySmall>
      </View>

      <View style={serviceStyles.actionsCol}>
        <TouchableOpacity style={serviceStyles.routeBtn} onPress={onDirections}>
          <MaterialCommunityIcons name="directions" size={16} color={Colors.brand.primary} />
          <BodySmall style={serviceStyles.routeBtnText}>ROUTE</BodySmall>
        </TouchableOpacity>

        {onCall && (
          <TouchableOpacity style={serviceStyles.callBtn} onPress={onCall}>
            <MaterialCommunityIcons name="phone" size={14} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const serviceStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontWeight: '700',
  },
  openPill: {
    backgroundColor: Colors.safe.tint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.badge,
  },
  openText: {
    color: Colors.safe.default,
    fontSize: 10,
    fontWeight: '700',
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  routeBtnText: {
    color: Colors.brand.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  callBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    letterSpacing: 1,
    color: Colors.text.primary,
  },
  // Recommended Safe Destination Card
  recommendedCard: {
    backgroundColor: '#0F1E19',
    borderColor: Colors.safe.default,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  recBadgeRow: {
    flexDirection: 'row',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.badge,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFD700',
  },
  recBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recContent: {
    gap: Spacing.sm,
  },
  recInfo: {
    gap: 2,
  },
  recName: {
    fontSize: 18,
    color: Colors.text.primary,
  },
  recMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  chipText: {
    color: Colors.text.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  activityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.badge,
  },
  activityPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recActionWrap: {
    marginTop: Spacing.xs,
  },
  // Emergency Authorities Card
  servicesCard: {
    backgroundColor: Colors.surface.primary,
    gap: Spacing.sm,
  },
  subSectionTitle: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 1,
  },
  // Nearby Public Places Card
  publicPlacesCard: {
    backgroundColor: Colors.surface.primary,
    gap: Spacing.sm,
  },
  publicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Colors.surface.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.text.tertiary,
  },
  publicList: {
    gap: 2,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  publicLeft: {
    flex: 1,
    gap: 2,
  },
  publicName: {
    fontWeight: '700',
    fontSize: 14,
  },
  publicMeta: {
    flexDirection: 'row',
    gap: 4,
  },
  activityRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activityLabelSmall: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  activityPillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.badge,
  },
  activityPillTextSmall: {
    fontSize: 9,
    fontWeight: '800',
  },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  routeBtnText: {
    color: Colors.brand.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
