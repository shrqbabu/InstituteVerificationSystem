/**
 * Admin Navigator
 * Drawer + Stack navigation for admin panel
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AddCertificate from '../screens/admin/AddCertificate';
import EditCertificate from '../screens/admin/EditCertificate';
import CertificateList from '../screens/admin/CertificateList';
import AdminSettings from '../screens/admin/AdminSettings';
import CertificateDetail from '../screens/certificate/CertificateDetail';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// ============================================================
// Custom Drawer Content
// ============================================================
const CustomDrawerContent: React.FC<any> = ({ navigation, state }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { moderateScale, isTablet } = useResponsive();

  const menuItems = [
    { name: 'AdminDashboard', label: 'Dashboard', icon: 'grid-outline' },
    { name: 'CertificateList', label: 'Certificates', icon: 'document-text-outline' },
    { name: 'AddCertificate', label: 'Add Certificate', icon: 'add-circle-outline' },
    { name: 'AdminSettings', label: 'Settings', icon: 'settings-outline' },
  ];

  const currentRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View
        style={[
          styles.drawerHeader,
          { backgroundColor: theme.colors.primary, paddingTop: 60 },
        ]}
      >
        <View style={styles.adminAvatar}>
          <Text style={styles.adminAvatarText}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>
        <Text
          style={[styles.adminName, { fontSize: moderateScale(18) }]}
          numberOfLines={1}
        >
          {user?.displayName || 'Admin'}
        </Text>
        <Text
          style={[styles.adminEmail, { fontSize: moderateScale(12) }]}
          numberOfLines={1}
        >
          {user?.email}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              style={[
                styles.menuItem,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary + '20'
                    : 'transparent',
                  borderRadius: theme.borderRadius.lg,
                  marginHorizontal: moderateScale(8),
                  marginVertical: moderateScale(2),
                  paddingVertical: moderateScale(12),
                  paddingHorizontal: moderateScale(16),
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={moderateScale(22)}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.menuLabel,
                  {
                    color: isActive ? theme.colors.primary : theme.colors.text,
                    fontSize: moderateScale(15),
                    fontWeight: isActive ? '700' : '500',
                    marginLeft: 14,
                  },
                ]}
              >
                {item.label}
              </Text>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={logout}
        style={[
          styles.logoutButton,
          {
            borderTopColor: theme.colors.border,
            paddingHorizontal: moderateScale(24),
            paddingVertical: moderateScale(20),
          },
        ]}
      >
        <Ionicons
          name="log-out-outline"
          size={moderateScale(22)}
          color={theme.colors.error}
        />
        <Text
          style={[
            styles.logoutText,
            { color: theme.colors.error, fontSize: moderateScale(15) },
          ]}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================
// Admin Navigator
// ============================================================
const AdminNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isTablet } = useResponsive();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: isTablet ? 'permanent' : 'slide',
        drawerStyle: {
          width: isTablet ? 280 : 300,
          backgroundColor: theme.colors.surface,
        },
        swipeEdgeWidth: 50,
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
      <Drawer.Screen name="CertificateList" component={CertificateList} />
      <Drawer.Screen name="AddCertificate" component={AddCertificate} />
      <Drawer.Screen name="EditCertificate" component={EditCertificate} />
      <Drawer.Screen name="AdminSettings" component={AdminSettings} />
      <Drawer.Screen name="CertificateDetail" component={CertificateDetail} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  adminAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  adminName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  adminEmail: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  menuLabel: {
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: '60%',
    borderRadius: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  logoutText: {
    fontWeight: '600',
    marginLeft: 14,
  },
});

export default AdminNavigator;
