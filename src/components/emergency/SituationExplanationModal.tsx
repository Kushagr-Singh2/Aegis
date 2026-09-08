/**
 * SituationExplanationModal — AI synthesized incident explanation
 *
 * Requirements:
 * - Loading state: "Analyzing safety signals..."
 * - Summary: "High-risk journey detected. The user moved approximately 180 metres away from the planned route and missed a safety check-in. Abnormal movement was detected afterward. Current risk score is 87/100."
 * - Parameters: Risk, Trigger, Location, Nearest Police, Nearest Hospital
 * - Emergency Timeline
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import { MOCK_SITUATION_EXPLANATION } from '../../lib/mockData';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SituationExplanationModal({ visible, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleShareReport = async () => {
    try {
      await Share.share({
        message: `🚨 AEGIS Incident Summary:\n${MOCK_SITUATION_EXPLANATION.summary}\n\nRisk: ${MOCK_SITUATION_EXPLANATION.parameters.risk}\nLocation: ${MOCK_SITUATION_EXPLANATION.parameters.location}`,
      });
    } catch {
      // Ignored
    }
  };

  if (!visible) return null;

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
              <MaterialCommunityIcons name="brain" size={24} color={Colors.brand.primary} />
              <Heading3 style={styles.title}>EXPLAIN MY SITUATION</Heading3>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            /* ── Loading state: Analyzing safety signals... ────────────── */
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.brand.primary} />
              <Heading3 style={styles.loadingTitle}>Analyzing safety signals...</Heading3>
              <BodySmall color={Colors.text.tertiary} align="center">
                Synthesizing route divergence, motion telemetry, and check-in timeline.
              </BodySmall>
            </View>
          ) : (
            /* ── Synthesized Report ────────────────────────────────────── */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.reportContent}
            >
              {/* Summary Card */}
              <Card variant="danger" padding="md" style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <MaterialCommunityIcons name="shield-alert" size={20} color={Colors.danger.extreme} />
                  <Label style={styles.summaryLabel}>AI INCIDENT SYNTHESIS</Label>
                </View>
                <Body style={styles.summaryText}>
                  "{MOCK_SITUATION_EXPLANATION.summary}"
                </Body>
              </Card>

              {/* Parameters Breakdown */}
              <Card variant="default" padding="md" style={styles.paramsCard}>
                <Label style={styles.sectionLabel}>INCIDENT PARAMETERS</Label>

                <ParamRow
                  icon="speedometer"
                  iconColor={Colors.danger.extreme}
                  label="Risk"
                  value={MOCK_SITUATION_EXPLANATION.parameters.risk}
                  isHighlight
                />
                <Divider marginVertical={8} />

                <ParamRow
                  icon="ray-start-arrow"
                  iconColor={Colors.warning.default}
                  label="Trigger"
                  value={MOCK_SITUATION_EXPLANATION.parameters.trigger}
                />
                <Divider marginVertical={8} />

                <ParamRow
                  icon="crosshairs-gps"
                  iconColor={Colors.brand.primary}
                  label="Location"
                  value={MOCK_SITUATION_EXPLANATION.parameters.location}
                />
                <Divider marginVertical={8} />

                <ParamRow
                  icon="shield-account"
                  iconColor={Colors.brand.primaryLight}
                  label="Nearest Police"
                  value={MOCK_SITUATION_EXPLANATION.parameters.nearestPolice}
                />
                <Divider marginVertical={8} />

                <ParamRow
                  icon="hospital-building"
                  iconColor={Colors.safe.default}
                  label="Nearest Hospital"
                  value={MOCK_SITUATION_EXPLANATION.parameters.nearestHospital}
                />
              </Card>

              {/* Emergency Timeline */}
              <Card variant="default" padding="md" style={styles.timelineCard}>
                <Label style={styles.sectionLabel}>EMERGENCY TIMELINE</Label>

                <View style={styles.timelineList}>
                  {MOCK_SITUATION_EXPLANATION.timeline.map((item, index) => {
                    const isLast = index === MOCK_SITUATION_EXPLANATION.timeline.length - 1;
                    const dotColor =
                      item.status === 'critical'
                        ? Colors.danger.extreme
                        : item.status === 'alert'
                        ? Colors.warning.default
                        : Colors.safe.default;

                    return (
                      <View key={item.id} style={styles.timelineRow}>
                        <View style={styles.timeCol}>
                          <BodySmall style={styles.timeText}>{item.time}</BodySmall>
                        </View>

                        <View style={styles.lineCol}>
                          <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                          {!isLast && <View style={styles.timelineConnector} />}
                        </View>

                        <View style={styles.eventCol}>
                          <Body style={styles.eventTitle}>{item.title}</Body>
                          <BodySmall color={Colors.text.secondary}>
                            {item.description}
                          </BodySmall>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>

              {/* Actions */}
              <View style={styles.actionButtons}>
                <Button
                  label="SHARE INCIDENT REPORT"
                  variant="primary"
                  size="md"
                  onPress={handleShareReport}
                  leftIcon={
                    <MaterialCommunityIcons name="share-variant" size={18} color={Colors.white} />
                  }
                />

                <Button
                  label="DISMISS"
                  variant="secondary"
                  size="md"
                  onPress={onClose}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ParamRow({
  icon,
  iconColor,
  label,
  value,
  isHighlight,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  isHighlight?: boolean;
}) {
  return (
    <View style={paramStyles.row}>
      <View style={[paramStyles.iconBox, { backgroundColor: `${iconColor}18` }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={paramStyles.textCol}>
        <Label style={paramStyles.label}>{label}</Label>
        <Body
          style={[
            paramStyles.value,
            isHighlight && { color: Colors.danger.extreme, fontWeight: '800' },
          ]}
        >
          {value}
        </Body>
      </View>
    </View>
  );
}

const paramStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    color: Colors.text.primary,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
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
    gap: 8,
  },
  title: {
    letterSpacing: 1,
    color: Colors.brand.primaryLight,
  },
  // Loading state
  loadingContainer: {
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingTitle: {
    color: Colors.brand.primaryLight,
    letterSpacing: 0.5,
  },
  // Report content
  reportContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  summaryCard: {
    backgroundColor: '#1E0E12',
    borderColor: Colors.danger.extreme,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    color: Colors.danger.extreme,
    fontSize: 10,
    letterSpacing: 1,
  },
  summaryText: {
    lineHeight: 22,
    fontSize: 14,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  paramsCard: {
    backgroundColor: Colors.surface.primary,
    gap: Spacing.xs,
  },
  sectionLabel: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  timelineCard: {
    backgroundColor: Colors.surface.primary,
    gap: Spacing.sm,
  },
  timelineList: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 48,
  },
  timeCol: {
    width: 60,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
  lineCol: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border.default,
    marginTop: 2,
    marginBottom: 2,
  },
  eventCol: {
    flex: 1,
    paddingBottom: Spacing.sm,
    gap: 2,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
