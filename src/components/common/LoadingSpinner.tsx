/**
 * Loading Spinner Component
 * Full screen and inline loading states
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
  size = 'large',
}) => {
  const { theme } = useTheme();

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.loadingCard,
            {
              backgroundColor: theme.colors.card,
              borderRadius: theme.borderRadius.xl,
              ...theme.shadows.large,
            },
          ]}
        >
          <ActivityIndicator
            size={size}
            color={theme.colors.primary}
          />
          {message && (
            <Text
              style={[
                styles.loadingText,
                {
                  color: theme.colors.textSecondary,
                  marginTop: theme.spacing.sm,
                },
              ]}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <Text style={[styles.inlineText, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
    minWidth: 160,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inline: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineText: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default LoadingSpinner;
