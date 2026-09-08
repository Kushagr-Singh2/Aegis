/**
 * Root index — App entry redirect
 *
 * Redirects to the main tabs after the app has initialized.
 * Handles onboarding flow routing.
 */

import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/colors';

export default function Index() {
  const status = useAppStore((s) => s.status);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
