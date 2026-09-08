/**
 * JourneySetup — Destination input and journey start form
 *
 * Mock implementation — autocomplete replaced with static suggestions.
 * Backend: replace with real Places API autocomplete.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJourneyStore } from '../../store/useJourneyStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Heading3, Body, BodySmall, BodySecondary, Label } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FontFamily, FontSize } from '../../constants/typography';
import { MOCK_DESTINATIONS, MOCK_TRUSTED_CONTACTS } from '../../lib/mockData';

// ── Component ────────────────────────────────────────────────────────────────

export function JourneySetup() {
  const [searchText, setSearchText] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<
    (typeof MOCK_DESTINATIONS)[0] | null
  >(null);
  const [shareWithContacts, setShareWithContacts] = useState(true);

  const startJourney = useJourneyStore((s) => s.startJourney);
  const shareJourney = useJourneyStore((s) => s.shareWithContacts);

  const filteredDestinations = searchText.length > 0
    ? MOCK_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(searchText.toLowerCase()) ||
          d.address.toLowerCase().includes(searchText.toLowerCase())
      )
    : MOCK_DESTINATIONS;

  function handleSelectDestination(dest: (typeof MOCK_DESTINATIONS)[0]) {
    setSelectedDestination(dest);
    setSearchText(dest.name);
  }

  function handleStartJourney() {
    if (!selectedDestination) return;
    startJourney({
      name: selectedDestination.name,
      address: selectedDestination.address,
      estimatedTime: selectedDestination.estimatedTime,
    });
    if (shareWithContacts) {
      shareJourney();
    }
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search Input */}
      <View style={styles.section}>
        <Label style={styles.sectionLabel}>Where are you going?</Label>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="map-search"
            size={20}
            color={Colors.text.tertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (text !== selectedDestination?.name) {
                setSelectedDestination(null);
              }
            }}
            returnKeyType="search"
            autoCapitalize="words"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setSelectedDestination(null);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={Colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Destination suggestions */}
      <View style={styles.section}>
        <Label style={styles.sectionLabel}>
          {searchText.length > 0 ? 'Search Results' : 'Suggested Destinations'}
        </Label>

        {filteredDestinations.map((dest) => (
          <DestinationItem
            key={dest.id}
            destination={dest}
            isSelected={selectedDestination?.id === dest.id}
            onPress={() => handleSelectDestination(dest)}
          />
        ))}

        {filteredDestinations.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="map-marker-off"
              size={32}
              color={Colors.text.tertiary}
            />
            <BodySecondary align="center" style={styles.emptyText}>
              No destinations found for "{searchText}"
            </BodySecondary>
          </View>
        )}
      </View>

      {/* Share with contacts toggle */}
      <View style={styles.section}>
        <Card variant="default" padding="md">
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShareWithContacts(!shareWithContacts)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={Colors.brand.primary}
                style={styles.toggleIcon}
              />
              <View>
                <Body>Share with trusted contacts</Body>
                <BodySmall color={Colors.text.secondary}>
                  {MOCK_TRUSTED_CONTACTS.filter((c) => c.isEmergencyContact).length} contacts will be notified
                </BodySmall>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                shareWithContacts ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  shareWithContacts ? styles.thumbOn : styles.thumbOff,
                ]}
              />
            </View>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Start Journey Button */}
      <View style={styles.section}>
        <Button
          label="Start Journey"
          variant="primary"
          size="lg"
          disabled={!selectedDestination}
          onPress={handleStartJourney}
          leftIcon={
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={Colors.white}
            />
          }
        />
        {!selectedDestination && (
          <BodySmall
            align="center"
            color={Colors.text.tertiary}
            style={styles.hint}
          >
            Select a destination to begin journey protection
          </BodySmall>
        )}
      </View>

      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

type DestinationItemProps = {
  destination: (typeof MOCK_DESTINATIONS)[0];
  isSelected: boolean;
  onPress: () => void;
};

function DestinationItem({ destination, isSelected, onPress }: DestinationItemProps) {
  return (
    <TouchableOpacity
      style={[styles.destItem, isSelected && styles.destItemSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.destIcon, isSelected && styles.destIconSelected]}>
        <MaterialCommunityIcons
          name="map-marker"
          size={18}
          color={isSelected ? Colors.brand.primary : Colors.text.secondary}
        />
      </View>
      <View style={styles.destInfo}>
        <Body
          style={isSelected ? { color: Colors.brand.primary } : undefined}
          numberOfLines={1}
        >
          {destination.name}
        </Body>
        <BodySmall numberOfLines={1}>{destination.address}</BodySmall>
      </View>
      <View style={styles.destMeta}>
        <BodySmall color={Colors.text.secondary}>{destination.estimatedTime}</BodySmall>
        <BodySmall color={Colors.text.tertiary}>{destination.distance}</BodySmall>
      </View>
    </TouchableOpacity>
  );
}

// Suppress unused import
void FlatList;

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.input,
    borderWidth: 1,
    borderColor: Colors.border.default,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bodyRegular,
    paddingVertical: 4,
  },
  // Destination items
  destItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing[1.5],
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.surface.primary,
    gap: Spacing.sm,
  },
  destItemSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.tint,
  },
  destIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destIconSelected: {
    backgroundColor: Colors.brand.tint,
  },
  destInfo: {
    flex: 1,
  },
  destMeta: {
    alignItems: 'flex-end',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    marginTop: Spacing.sm,
  },
  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  toggleIcon: {},
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: Colors.brand.primary,
  },
  toggleOff: {
    backgroundColor: Colors.surface.tertiary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  // Hint text
  hint: {
    marginTop: Spacing.sm,
  },
  bottomSpacer: {
    height: 40,
  },
});
