/**
 * Divider — Horizontal separator
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

type DividerProps = {
  color?: string;
  thickness?: number;
  style?: ViewStyle;
  marginVertical?: number;
};

export function Divider({
  color = Colors.border.subtle,
  thickness = StyleSheet.hairlineWidth,
  style,
  marginVertical = 0,
}: DividerProps) {
  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: color,
          marginVertical,
        },
        style,
      ]}
    />
  );
}
