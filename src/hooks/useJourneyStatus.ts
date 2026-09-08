/**
 * useJourneyStatus — Derived journey state hook
 *
 * Returns semantic information about the current journey state
 * that components can use directly without knowing store details.
 */

import { useMemo } from 'react';
import {
  useJourneyStore,
  selectIsJourneyActive,
  selectIsSOSActive,
  selectJourneyDuration,
  type JourneyStatus,
  type RiskLevel,
} from '../store/useJourneyStore';
import { Colors } from '../constants/colors';

// ── Types ────────────────────────────────────────────────────────────────────

export type JourneyStatusInfo = {
  status: JourneyStatus;
  riskLevel: RiskLevel;
  isActive: boolean;
  isSOSActive: boolean;
  isIdle: boolean;
  hasArrived: boolean;
  duration: string;
  statusLabel: string;
  statusColor: string;
  statusBackgroundColor: string;
  riskLabel: string;
  riskColor: string;
  showRiskIndicator: boolean;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useJourneyStatus(): JourneyStatusInfo {
  const status = useJourneyStore((s) => s.status);
  const riskLevel = useJourneyStore((s) => s.riskLevel);
  const isActive = useJourneyStore(selectIsJourneyActive);
  const isSOSActive = useJourneyStore(selectIsSOSActive);
  const duration = useJourneyStore(selectJourneyDuration);

  return useMemo<JourneyStatusInfo>(() => {
    const isIdle = status === 'idle';
    const hasArrived = status === 'arrived';

    // Status label
    const statusLabels: Record<JourneyStatus, string> = {
      idle: 'Protected',
      active: 'Journey Active',
      sos: 'SOS Active',
      arrived: 'Arrived Safely',
    };

    // Status color (foreground text/icon)
    const statusColors: Record<JourneyStatus, string> = {
      idle: Colors.text.secondary,
      active: Colors.safe.default,
      sos: Colors.danger.default,
      arrived: Colors.brand.primary,
    };

    // Status background
    const statusBgColors: Record<JourneyStatus, string> = {
      idle: Colors.surface.tertiary,
      active: Colors.safe.tint,
      sos: Colors.danger.tint,
      arrived: Colors.brand.tint,
    };

    // Risk label
    const riskLabels: Record<RiskLevel, string> = {
      low: 'Low Risk',
      medium: 'Moderate Risk',
      high: 'High Risk',
    };

    // Risk color
    const riskColors: Record<RiskLevel, string> = {
      low: Colors.safe.default,
      medium: Colors.warning.default,
      high: Colors.danger.default,
    };

    return {
      status,
      riskLevel,
      isActive,
      isSOSActive,
      isIdle,
      hasArrived,
      duration,
      statusLabel: statusLabels[status],
      statusColor: statusColors[status],
      statusBackgroundColor: statusBgColors[status],
      riskLabel: riskLabels[riskLevel],
      riskColor: riskColors[riskLevel],
      showRiskIndicator: isActive && !isSOSActive,
    };
  }, [status, riskLevel, isActive, isSOSActive, duration]);
}
