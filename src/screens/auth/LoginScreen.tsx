/**
 * Login Screen
 * Admin authentication with responsive layout
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginScreen: React.FC = () => {
  const { login, isLoading, clearError } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { moderateScale, isTablet, screenWidth } = useResponsive();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ============================================================
  // Validation
  // ============================================================
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // Shake animation for error
  // ============================================================
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  // ============================================================
  // Handle Login
  // ============================================================
  const handleLogin = async () => {
    clearError();
    setLoginError(null);

    if (!validate()) {
      triggerShake();
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (error: any) {
      setLoginError(error.message);
      triggerShake();
    }
  };

  const cardWidth = isTablet ? Math.min(screenWidth * 0.5, 480) : '100%';

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: moderateScale(isTablet ? 40 : 20) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Theme Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.themeToggle}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBg}>
                <Ionicons name="school" size={moderateScale(40)} color="#FFFFFF" />
              </View>
            </View>

            <Text
              style={[
                styles.welcomeText,
                { fontSize: moderateScale(16) },
              ]}
            >
              Welcome to
            </Text>
            <Text
              style={[
                styles.appName,
                { fontSize: moderateScale(isTablet ? 28 : 22) },
              ]}
            >
              Certificate Verification
            </Text>
            <Text
              style={[
                styles.appName,
                { fontSize: moderateScale(isTablet ? 28 : 22) },
              ]}
            >
              System
            </Text>
          </View>

          {/* Login Card */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [{ translateX: shakeAnim }],
                alignSelf: 'center',
                width: cardWidth as any,
              },
            ]}
          >
            <Card shadow="large" padding="lg">
              {/* Card Title */}
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: theme.colors.text,
                    fontSize: moderateScale(22),
                    marginBottom: moderateScale(6),
                  },
                ]}
              >
                Admin Login
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: moderateScale(13),
                    marginBottom: moderateScale(24),
                  },
                ]}
              >
                Sign in to access the admin panel
              </Text>

              {/* Error Banner */}
              {loginError && (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: theme.colors.error + '15',
                      borderRadius: theme.borderRadius.md,
                      borderLeftColor: theme.colors.error,
                      padding: moderateScale(12),
                      marginBottom: moderateScale(16),
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: theme.colors.error,
                        fontSize: moderateScale(13),
                      },
                    ]}
                  >
                    {loginError}
                  </Text>
                </View>
              )}

              {/* Email Input */}
              <Input
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail-outline"
                placeholder="admin@institute.com"
                returnKeyType="next"
                required
              />

              {/* Password Input */}
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                leftIcon="lock-closed-outline"
                placeholder="Enter your password"
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                required
              />

              {/* Login Button */}
              <Button
                title={isLoading ? 'Signing in...' : 'Sign In'}
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="lg"
                fullWidth
                style={{ marginTop: moderateScale(8) }}
                icon={
                  !isLoading
                    ? <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                    : undefined
                }
              />

              {/* Public Access */}
              <View style={[styles.dividerRow, { marginVertical: moderateScale(16) }]}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text
                  style={[
                    styles.dividerText,
                    { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
                  ]}
                >
                  OR
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <Button
                title="Verify Certificate (Public)"
                onPress={() => navigation.goBack()}
                variant="outline"
                size="md"
                fullWidth
                icon={
                  <Ionicons name="shield-checkmark-outline" size={18} color="#1565C0" />
                }
              />
            </Card>
          </Animated.View>

          {/* Footer */}
          <Text
            style={[
              styles.footer,
              { color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(12) },
            ]}
          >
            © 2026 Institute Certificate Verification System
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  bgCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    left: -60,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBg: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
    marginBottom: 4,
  },
  appName: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
  },
  cardWrapper: {},
  cardTitle: {
    fontWeight: '800',
  },
  cardSubtitle: {
    fontWeight: '400',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    marginTop: 32,
  },
});

export default LoginScreen;
