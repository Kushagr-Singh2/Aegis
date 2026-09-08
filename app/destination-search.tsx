/**
 * Destination Search Screen (Phase 2)
 *
 * Full-screen search experience:
 * - Search bar (auto-focused)
 * - Current location
 * - Favourites
 * - Recent destinations
 * - Suggested destinations
 * - Live-filtered search results
 *
 * Selecting any destination navigates to /route-preview
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SearchBar } from '../src/components/search/SearchBar';
import { LocationSection } from '../src/components/search/LocationSection';
import { DestinationList, type DestinationItem } from '../src/components/search/DestinationList';
import { Heading2, Label, BodySmall } from '../src/components/ui/Typography';
import { Colors } from '../src/constants/colors';
import { BorderRadius, Spacing } from '../src/constants/spacing';
import {
  MOCK_FAVOURITE_DESTINATIONS,
  MOCK_RECENT_SHORTCUTS,
  MOCK_SUGGESTED_DESTINATIONS,
  MOCK_DESTINATIONS,
} from '../src/lib/mockData';
import { useJourneyStore } from '../src/store/useJourneyStore';

// Convert mock data into DestinationItem shape
function toFavItem(f: typeof MOCK_FAVOURITE_DESTINATIONS[0]): DestinationItem {
  return {
    id: f.id,
    name: f.name,
    address: f.address,
    icon: f.icon,
    distance: f.distance,
    estimatedTime: f.estimatedTime,
  };
}

function toRecentItem(r: typeof MOCK_RECENT_SHORTCUTS[0]): DestinationItem {
  return {
    id: r.id,
    name: r.title,
    address: r.subtitle,
    icon: r.icon.replace('-outline', ''),
    distance: r.distance,
    estimatedTime: r.estimatedTime,
  };
}

function toSuggestedItem(s: typeof MOCK_SUGGESTED_DESTINATIONS[0]): DestinationItem {
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    distance: s.distance,
    estimatedTime: s.estimatedTime,
    badge: s.reason,
  };
}

function toSearchItem(d: typeof MOCK_DESTINATIONS[0]): DestinationItem {
  return {
    id: d.id,
    name: d.name,
    address: d.address,
    distance: d.distance,
    estimatedTime: d.estimatedTime,
  };
}

const ALL_SEARCH_POOL: DestinationItem[] = [
  ...MOCK_FAVOURITE_DESTINATIONS.map(toFavItem),
  ...MOCK_RECENT_SHORTCUTS.map(toRecentItem),
  ...MOCK_SUGGESTED_DESTINATIONS.map(toSuggestedItem),
  ...MOCK_DESTINATIONS.map(toSearchItem),
];

// Deduplicate by name
const UNIQUE_POOL = ALL_SEARCH_POOL.filter(
  (item, idx, arr) => arr.findIndex((x) => x.name === item.name) === idx
);

export default function DestinationSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSelectedRoute = useJourneyStore((s) => s.setSelectedRoute);

  const [query, setQuery] = useState('');

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    return UNIQUE_POOL.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
    );
  }, [query, isSearching]);

  const handleSelectDestination = (item: DestinationItem) => {
    // Clear route so user must pick one in Route Preview
    setSelectedRoute(null);
    router.push({
      pathname: '/route-preview',
      params: {
        destName: item.name,
        destAddress: item.address,
        destEta: item.estimatedTime ?? '24 min',
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
        <Heading2 style={styles.title}>Where are you going?</Heading2>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search destination..."
          autoFocus
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          /* ── Search Results ─────────────────────────────────────── */
          <Section label="SEARCH RESULTS">
            <DestinationList
              items={searchResults}
              onSelect={handleSelectDestination}
              emptyMessage={`No results for "${query}"`}
            />
          </Section>
        ) : (
          <>
            {/* ── Current Location ───────────────────────────────── */}
            <LocationSection onPress={() => {}} />

            {/* ── Favourites ─────────────────────────────────────── */}
            <Section label="FAVOURITES">
              <DestinationList
                items={MOCK_FAVOURITE_DESTINATIONS.map(toFavItem)}
                onSelect={handleSelectDestination}
              />
            </Section>

            {/* ── Recent ─────────────────────────────────────────── */}
            <Section label="RECENT">
              <DestinationList
                items={MOCK_RECENT_SHORTCUTS.map(toRecentItem)}
                onSelect={handleSelectDestination}
              />
            </Section>

            {/* ── Suggested ──────────────────────────────────────── */}
            <Section label="SUGGESTED FOR YOU">
              <DestinationList
                items={MOCK_SUGGESTED_DESTINATIONS.map(toSuggestedItem)}
                onSelect={handleSelectDestination}
              />
            </Section>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <Label style={sectionStyles.label}>{label}</Label>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 2,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface.secondary,
  },
  title: {
    flex: 1,
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
});
