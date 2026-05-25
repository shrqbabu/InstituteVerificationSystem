/**
 * Responsive Hook
 * Provides screen size information and scaling utilities
 */

import { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { ResponsiveConfig } from '../types';

const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

// Base dimensions for scaling (designed for 375px wide phone)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const useResponsive = (): ResponsiveConfig => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setDimensions({
          width: window.width,
          height: window.height,
        });
      }
    );

    return () => subscription.remove();
  }, []);

  const { width, height } = dimensions;
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isPhone = width < 768;

  // Scale function - scales based on screen width
  const scale = useCallback(
    (size: number): number => {
      return (width / BASE_WIDTH) * size;
    },
    [width]
  );

  // Moderate scale - less aggressive scaling
  const moderateScale = useCallback(
    (size: number, factor: number = 0.5): number => {
      return size + (scale(size) - size) * factor;
    },
    [scale]
  );

  return {
    isPhone,
    isTablet,
    isLandscape,
    screenWidth: width,
    screenHeight: height,
    scale,
    moderateScale,
  };
};

// ============================================================
// Responsive Value Helper
// ============================================================
export const useResponsiveValue = <T>(
  phoneValue: T,
  tabletValue: T
): T => {
  const { isTablet } = useResponsive();
  return isTablet ? tabletValue : phoneValue;
};
