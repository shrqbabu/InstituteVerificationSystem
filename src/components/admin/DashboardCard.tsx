/**
 * Dashboard Statistics Card
 * Responsive card showing key metrics
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  colorEnd?: string;
  subtitle?: string;
  index?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  colorEnd,
  subtitle,
  index = 0,
}) => {
  const { theme } = useTheme();
  const { moderateScale, isTablet } = useResponsive();

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        width: isTablet ? '22%' : '47%',
        margin: '1.5%',
      }}
    >
      <LinearGradient
        colors={[color, colorEnd || color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderRadius: theme.borderRadius.xl,
            padding: moderateScale(16),
            ...theme.shadows.medium,
          },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: theme.borderRadius.lg,
              padding: moderateScale(8),
              alignSelf: 'flex-start',
              marginBottom: moderateScale(12),
            },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={moderateScale(24)}
            color="#FFFFFF"
          />
        </View>

        {/* Value */}
        <Text
          style={[
            styles.value,
            {
              color: '#FFFFFF',
              fontSize: moderateScale(isTablet ? 32 : 26),
              marginBottom: moderateScale(4),
            },
          ]}
        >
          {value}
        </Text>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: 'rgba(255,255,255,0.85)',
              fontSize: moderateScale(12),
            },
          ]}
        >
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: 'rgba(255,255,255,0.65)',
                fontSize: moderateScale(11),
                marginTop: moderateScale(2),
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  iconContainer: {},
  value: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontWeight: '400',
  },
});

export default DashboardCard;
