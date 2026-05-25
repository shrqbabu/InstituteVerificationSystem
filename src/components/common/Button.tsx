/**
 * Responsive Button Component
 * Supports multiple variants, sizes, and loading states
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const { moderateScale } = useResponsive();

  // ============================================================
  // Size configurations
  // ============================================================
  const sizeConfig = {
    sm: {
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(16),
      fontSize: moderateScale(12),
      borderRadius: theme.borderRadius.md,
    },
    md: {
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(24),
      fontSize: moderateScale(14),
      borderRadius: theme.borderRadius.lg,
    },
    lg: {
      paddingVertical: moderateScale(16),
      paddingHorizontal: moderateScale(32),
      fontSize: moderateScale(16),
      borderRadius: theme.borderRadius.xl,
    },
  };

  const config = sizeConfig[size];
  const isDisabled = disabled || isLoading;

  // ============================================================
  // Render gradient or flat button
  // ============================================================
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          { width: fullWidth ? '100%' : 'auto' },
          style,
        ]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#9CA3AF', '#6B7280']
              : [theme.colors.primary, theme.colors.primaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            {
              paddingVertical: config.paddingVertical,
              paddingHorizontal: config.paddingHorizontal,
              borderRadius: config.borderRadius,
              opacity: isDisabled ? 0.7 : 1,
            },
          ]}
        >
          {renderContent(
            isLoading,
            icon,
            iconPosition,
            title,
            config.fontSize,
            '#FFFFFF',
            textStyle
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // ============================================================
  // Flat button styles
  // ============================================================
  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.colors.primary, text: '#FFFFFF' },
    secondary: { bg: theme.colors.secondary, text: '#FFFFFF' },
    outline: { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary },
    ghost: { bg: 'transparent', text: theme.colors.primary },
    danger: { bg: theme.colors.error, text: '#FFFFFF' },
  };

  const vs = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: vs.bg,
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: config.borderRadius,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border,
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
    >
      {renderContent(
        isLoading,
        icon,
        iconPosition,
        title,
        config.fontSize,
        vs.text,
        textStyle
      )}
    </TouchableOpacity>
  );
};

// ============================================================
// Content Renderer
// ============================================================
const renderContent = (
  isLoading: boolean,
  icon: React.ReactNode | undefined,
  iconPosition: 'left' | 'right',
  title: string,
  fontSize: number,
  color: string,
  textStyle?: TextStyle
) => {
  if (isLoading) {
    return <ActivityIndicator color={color} size="small" />;
  }

  return (
    <View style={styles.contentRow}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text
        style={[
          styles.buttonText,
          { fontSize, color },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
