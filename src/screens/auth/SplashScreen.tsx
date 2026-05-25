/**
 * Splash Screen
 * Animated intro screen with institute branding
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreenExpo from 'expo-splash-screen';
import { useTheme } from '../../context/ThemeContext';

SplashScreenExpo.preventAutoHideAsync();

const SplashScreen: React.FC = () => {
  const { theme } = useTheme();

  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide expo splash screen
    SplashScreenExpo.hideAsync();

    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#1565C0', '#0D47A1', '#01579B']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <View style={styles.logoBg}>
          <Ionicons name="school" size={60} color="#FFFFFF" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.title}>Institute</Text>
        <Text style={styles.titleBold}>Certificate Verification</Text>
        <Text style={styles.titleSystem}>System</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={{ opacity: subtitleOpacity, marginTop: 16 }}>
        <Text style={styles.subtitle}>
          Authentic. Secure. Verified.
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingFill,
              { opacity: subtitleOpacity },
            ]}
          />
        </View>
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 300,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleTop: {
    width: 400,
    height: 400,
    top: -150,
    right: -100,
  },
  circleBottom: {
    width: 300,
    height: 300,
    bottom: -100,
    left: -80,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  titleBold: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleSystem: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 2,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: 200,
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});

export default SplashScreen;
