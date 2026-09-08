/**
 * SearchBar — Destination search input
 *
 * Auto-focuses on mount. Shows clear button when query is non-empty.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onClear?: () => void;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search destination...',
  autoFocus = false,
  onClear,
  ...rest
}: Props) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={Colors.text.secondary}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.tertiary}
        returnKeyType="search"
        clearButtonMode="never"
        {...rest}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
            inputRef.current?.focus();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearButton}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={Colors.text.tertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.input,
    borderWidth: 1,
    borderColor: Colors.border.default,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    flexShrink: 0,
  },
});
