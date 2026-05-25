/**
 * Public Navigator
 * Bottom tab navigation for public users
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

// Public Screens
import HomeScreen from '../screens/public/HomeScreen';
import VerifyScreen from '../screens/public/VerifyScreen';
import QRScanScreen from '../screens/public/QRScanScreen';
import CertificateDetail from '../screens/certificate/CertificateDetail';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ============================================================
// Home Stack (includes CertificateDetail)
// ============================================================
const HomeStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="CertificateDetail" component={CertificateDetail} />
  </Stack.Navigator>
);

const VerifyStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VerifyMain" component={VerifyScreen} />
    <Stack.Screen name="CertificateDetail" component={CertificateDetail} />
  </Stack.Navigator>
);

// ============================================================
// Public Navigator
// ============================================================
const PublicNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { moderateScale } = useResponsive();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          ...theme.shadows.medium,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: moderateScale(11),
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Verify: focused ? 'shield-checkmark' : 'shield-checkmark-outline',
            QRScan: focused ? 'qr-code' : 'qr-code-outline',
          };
          return (
            <Ionicons
              name={(icons[route.name] || 'help-outline') as any}
              size={moderateScale(22)}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Verify"
        component={VerifyStack}
        options={{ tabBarLabel: 'Verify' }}
      />
      <Tab.Screen
        name="QRScan"
        component={QRScanScreen}
        options={{ tabBarLabel: 'Scan QR' }}
      />
    </Tab.Navigator>
  );
};

export default PublicNavigator;
