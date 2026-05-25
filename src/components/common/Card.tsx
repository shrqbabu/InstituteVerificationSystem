/**
 * Card Component
 * Responsive card with shadow and various layout options
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'md',
  shadow = 'medium',
  borderRadius = 'lg',
}) => {
  const { theme } = useTheme();
  const { moderateScale } = useResponsive();

  const paddingMap = {
    none: 0,
    sm: moderateScale(8),
    md: moderateScale(16),
    lg: moderateScale(24),
  };

  const shadowStyle = shadow === 'none' ? {} : theme.shadows[shadow];

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius[borderRadius],
    padding: paddingMap[padding],
    ...shadowStyle,
    borderWidth: theme.isDark ? 0.5 : 0,
    borderColor: theme.colors.border,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

export default Card;
