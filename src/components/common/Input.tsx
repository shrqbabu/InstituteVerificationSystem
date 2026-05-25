/**
 * Responsive Input Component
 * Supports validation states, icons, and various input types
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  required = false,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const { moderateScale } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    textInputProps.onFocus?.(null as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    textInputProps.onBlur?.(null as any);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? theme.colors.error : theme.colors.border,
      error ? theme.colors.error : theme.colors.primary,
    ],
  });

  const labelColor = error
    ? theme.colors.error
    : isFocused
    ? theme.colors.primary
    : theme.colors.textSecondary;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text
        style={[
          styles.label,
          theme.typography.label,
          { color: labelColor, marginBottom: moderateScale(6) },
        ]}
      >
        {label}
        {required && <Text style={{ color: theme.colors.error }}> *</Text>}
      </Text>

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            paddingHorizontal: moderateScale(12),
            ...theme.shadows.small,
          },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={moderateScale(20)}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          {...textInputProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: moderateScale(14),
              paddingVertical: moderateScale(12),
              flex: 1,
            },
          ]}
        />

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={moderateScale(20)}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Right Icon */}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon as any}
              size={moderateScale(20)}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error or Hint */}
      {error ? (
        <View style={styles.messageRow}>
          <Ionicons
            name="alert-circle-outline"
            size={12}
            color={theme.colors.error}
          />
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.error, fontSize: moderateScale(12) },
            ]}
          >
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text
          style={[
            styles.hintText,
            { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  input: {
    paddingHorizontal: 4,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  hintText: {
    marginTop: 4,
  },
});

export default Input;
