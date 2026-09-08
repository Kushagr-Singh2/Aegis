/**
 * JourneyStatus — In-journey monitoring panel
 *
 * Shown when a journey is active. Displays live status, risk level,
 * and journey controls (share, end journey, SOS).
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { Heading2, Heading3, Body, BodySmall, BodySecondary, Label } from '../ui/Typography';
import { Divider } from '../ui/Divider';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { MOCK_JOURNEY_CHECKPOINTS } from '../../lib/mockData';

// ── Component ────────────────────────────────────────────────────────────────

export function JourneyStatus() {
  const router = useRouter();
  const destination = useJourneyStore((s) => s.destination);
  const status = useJourneyStore((s) => s.status);
  const riskLevel = useJourneyStore((s) => s.riskLevel);
  const sharedWithContacts = useJourneyStore((s) => s.sharedWithContacts);
  const endJourney = useJourneyStore((s) => s.endJourney);
  const triggerSOS = useJourneyStore((s) => s.triggerSOS);
  const markArrived = useJourneyStore((s) => s.markArrived);
  const shareWithContacts = useJourneyStore((s) => s.shareWithContacts);
  const setRiskLevel = useJourneyStore((s) => s.setRiskLevel);

  const journeyInfo = useJourneyStatus();

  const isSOSMode = status === 'sos';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <StatusBadge
          label={journeyInfo.statusLabel}
          variant={isSOSMode ? 'sos' : 'active'}
        />
        <BodySmall color={Colors.text.secondary}>{journeyInfo.duration}</BodySmall>
      </View>

      {/* Destination card */}
      {destination && (
        <Card variant={isSOSMode ? 'danger' : 'safe'} style={styles.destinationCard}>
          <View style={styles.destinationRow}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={24}
              color={isSOSMode ? Colors.danger.default : Colors.safe.default}
            />
            <View style={styles.destinationInfo}>
              <Heading3 numberOfLines={1}>{destination.name}</Heading3>
              <BodySmall numberOfLines={1} color={Colors.text.secondary}>
                {destination.address}
              </BodySmall>
            </View>
          </View>
          <Divider marginVertical={12} />
          <View style={styles.etaRow}>
            <View style={styles.etaItem}>
              <Label>ETA</Label>
              <Body style={styles.etaValue}>{destination.estimatedTime}</Body>
            </View>
            <View style={styles.etaItem}>
              <Label>Risk Level</Label>
              <Body style={[styles.etaValue, { color: journeyInfo.riskColor }]}>
                {journeyInfo.riskLabel}
              </Body>
            </View>
            <View style={styles.etaItem}>
              <Label>Duration</Label>
              <Body style={styles.etaValue}>{journeyInfo.duration}</Body>
            </View>
          </View>
        </Card>
      )}

      {/* View Full Map / Active Journey Screen CTA */}
      <Button
        label="Open Live Navigation Map"
        variant="primary"
        size="md"
        onPress={() => router.push('/active-journey')}
        leftIcon={
          <MaterialCommunityIcons name="map-marker-path" size={18} color={Colors.white} />
        }
      />

      {/* Risk indicator (dev-only toggle) */}
      {!isSOSMode && (
        <Card variant="default" style={styles.riskCard}>
          <Label style={styles.riskTitle}>Risk Level (Mock)</Label>
          <View style={styles.riskButtons}>
            {(['low', 'moderate', 'high', 'critical'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.riskBtn,
                  riskLevel === level && styles.riskBtnActive,
                  { borderColor: getRiskColor(level) },
                  riskLevel === level && { backgroundColor: getRiskTint(level) },
                ]}
                onPress={() => setRiskLevel(level)}
              >
                <BodySmall
                  style={{
                    color: riskLevel === level ? getRiskColor(level) : Colors.text.secondary,
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </BodySmall>
              </TouchableOpacity>
            ))}
          </View>
          <BodySecondary style={styles.riskNote}>
            Dev tool: Risk will be AI-computed in production
          </BodySecondary>
        </Card>
      )}

      {/* Journey checkpoints */}
      <Card variant="default" style={styles.checkpointsCard}>
        <Label style={styles.checkpointsTitle}>Journey Timeline</Label>
        {MOCK_JOURNEY_CHECKPOINTS.map((checkpoint, index) => (
          <CheckpointItem
            key={checkpoint.id}
            checkpoint={checkpoint}
            isLast={index === MOCK_JOURNEY_CHECKPOINTS.length - 1}
          />
        ))}
      </Card>

      {/* Share with contacts */}
      {!sharedWithContacts && (
        <Button
          label="Share Journey with Contacts"
          variant="secondary"
          size="md"
          onPress={shareWithContacts}
          leftIcon={
            <MaterialCommunityIcons name="share-variant" size={18} color={Colors.brand.primary} />
          }
        />
      )}
      {sharedWithContacts && (
        <View style={styles.sharedBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color={Colors.safe.default} />
          <BodySmall color={Colors.safe.default}>Journey shared with trusted contacts</BodySmall>
        </View>
      )}

      {/* Arrived button */}
      <Button
        label="Mark as Arrived"
        variant="outline"
        size="md"
        onPress={markArrived}
        leftIcon={
          <MaterialCommunityIcons name="flag-checkered" size={18} color={Colors.brand.primary} />
        }
      />

      {/* End journey */}
      <Button
        label="End Journey"
        variant="ghost"
        size="md"
        onPress={endJourney}
        leftIcon={
          <MaterialCommunityIcons name="stop-circle" size={18} color={Colors.text.secondary} />
        }
      />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CheckpointItem({
  checkpoint,
  isLast,
}: {
  checkpoint: (typeof MOCK_JOURNEY_CHECKPOINTS)[0];
  isLast: boolean;
}) {
  const iconMap = {
    passed: 'check-circle' as const,
    current: 'circle-slice-4' as const,
    upcoming: 'circle-outline' as const,
  };

  const colorMap = {
    passed: Colors.safe.default,
    current: Colors.brand.primary,
    upcoming: Colors.text.tertiary,
  };

  return (
    <View style={styles.checkpoint}>
      <View style={styles.checkpointLine}>
        <MaterialCommunityIcons
          name={iconMap[checkpoint.status]}
          size={18}
          color={colorMap[checkpoint.status]}
        />
        {!isLast && (
          <View
            style={[
              styles.checkpointConnector,
              {
                backgroundColor:
                  checkpoint.status === 'passed'
                    ? Colors.safe.default
                    : Colors.border.default,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.checkpointContent}>
        <Body
          style={{
            color:
              checkpoint.status === 'upcoming'
                ? Colors.text.secondary
                : Colors.text.primary,
          }}
        >
          {checkpoint.label}
        </Body>
        <BodySmall color={Colors.text.tertiary}>{checkpoint.timestamp}</BodySmall>
      </View>
    </View>
  );
}

function getRiskColor(level: 'low' | 'moderate' | 'high' | 'critical'): string {
  return {
    low: Colors.safe.default,
    moderate: Colors.warning.default,
    high: Colors.danger.default,
    critical: Colors.danger.extreme,
  }[level];
}

function getRiskTint(level: 'low' | 'moderate' | 'high' | 'critical'): string {
  return {
    low: Colors.safe.tint,
    moderate: Colors.warning.tint,
    high: Colors.danger.tint,
    critical: Colors.danger.tint,
  }[level];
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationCard: {},
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  destinationInfo: {
    flex: 1,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etaItem: {
    alignItems: 'center',
    flex: 1,
  },
  etaValue: {
    marginTop: 2,
  },
  // Risk card
  riskCard: {},
  riskTitle: {
    marginBottom: Spacing.sm,
  },
  riskButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  riskBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  riskBtnActive: {},
  riskNote: {
    marginTop: Spacing.sm,
  },
  // Checkpoints
  checkpointsCard: {},
  checkpointsTitle: {
    marginBottom: Spacing.sm,
  },
  checkpoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  checkpointLine: {
    alignItems: 'center',
    marginRight: Spacing.sm,
    width: 18,
  },
  checkpointConnector: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: 2,
    minHeight: 20,
    borderRadius: 1,
  },
  checkpointContent: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  // Shared badge
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  bottomSpacer: {
    height: 40,
  },
});
