/**
 * Admin Dashboard Screen
 * Overview with statistics, recent certificates, and quick actions
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useDashboardStats } from '../../hooks/useCertificates';
import DashboardCard from '../../components/admin/DashboardCard';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const AdminDashboard: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { moderateScale, isTablet } = useResponsive();
  const navigation = useNavigation<any>();
  const { stats, isLoading, error } = useDashboardStats();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  // ============================================================
  // Dashboard Stats Cards Data
  // ============================================================
  const statCards = [
    {
      title: 'Total Certificates',
      value: stats?.totalCertificates || 0,
      icon: 'document-text',
      color: '#1565C0',
      colorEnd: '#1976D2',
      subtitle: 'All time',
    },
    {
      title: 'Valid Certificates',
      value: stats?.validCertificates || 0,
      icon: 'shield-checkmark',
      color: '#16A34A',
      colorEnd: '#15803D',
      subtitle: 'Active',
    },
    {
      title: 'Total Verifications',
      value: stats?.totalVerifications || 0,
      icon: 'eye',
      color: '#7C3AED',
      colorEnd: '#6D28D9',
      subtitle: 'All time',
    },
    {
      title: 'Total Downloads',
      value: stats?.totalDownloads || 0,
      icon: 'download',
      color: '#D97706',
      colorEnd: '#B45309',
      subtitle: 'All time',
    },
  ];

  // ============================================================
  // Quick Actions
  // ============================================================
  const quickActions = [
    {
      label: 'Add Certificate',
      icon: 'add-circle-outline',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('AddCertificate'),
    },
    {
      label: 'View All',
      icon: 'list-outline',
      color: theme.colors.success,
      onPress: () => navigation.navigate('CertificateList'),
    },
    {
      label: 'Settings',
      icon: 'settings-outline',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('AdminSettings'),
    },
    {
      label: 'Logout',
      icon: 'log-out-outline',
      color: theme.colors.error,
      onPress: logout,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primary}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={[
            styles.header,
            { paddingHorizontal: moderateScale(20), paddingVertical: moderateScale(24) },
          ]}
        >
          <View style={styles.headerTop}>
            {/* Menu Button */}
            <TouchableOpacity
              onPress={() => (navigation as any).openDrawer()}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={toggleTheme} style={styles.headerBtn}>
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminSettings')}
                style={styles.headerBtn}
              >
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <View style={styles.adminAvatarSmall}>
              <Text style={styles.adminAvatarTextSmall}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text
                style={[
                  styles.welcomeGreeting,
                  { fontSize: moderateScale(14) },
                ]}
              >
                Welcome back,
              </Text>
              <Text
                style={[
                  styles.welcomeName,
                  { fontSize: moderateScale(isTablet ? 24 : 20) },
                ]}
              >
                {user?.displayName || 'Administrator'}
              </Text>
              <Text
                style={[
                  styles.welcomeDate,
                  { fontSize: moderateScale(12) },
                ]}
              >
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: moderateScale(16) }}>
          {/* Statistics Cards */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontSize: moderateScale(18),
                marginBottom: moderateScale(12),
              },
            ]}
          >
            Overview
          </Text>

          <View style={styles.statsGrid}>
            {statCards.map((card, index) => (
              <DashboardCard
                key={card.title}
                {...card}
                index={index}
              />
            ))}
          </View>

          {/* Quick Actions */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontSize: moderateScale(18),
                marginBottom: moderateScale(12),
                marginTop: moderateScale(24),
              },
            ]}
          >
            Quick Actions
          </Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={action.onPress}
                style={[
                  styles.quickActionItem,
                  {
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.borderRadius.xl,
                    padding: moderateScale(16),
                    width: isTablet ? '22%' : '47%',
                    margin: '1.5%',
                    ...theme.shadows.small,
                  },
                ]}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    {
                      backgroundColor: action.color + '15',
                      borderRadius: theme.borderRadius.lg,
                      padding: moderateScale(12),
                      marginBottom: moderateScale(8),
                    },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={moderateScale(24)}
                    color={action.color}
                  />
                </View>
                <Text
                  style={[
                    styles.quickActionLabel,
                    { color: theme.colors.text, fontSize: moderateScale(13) },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Certificates */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontSize: moderateScale(18),
                marginBottom: moderateScale(12),
                marginTop: moderateScale(24),
              },
            ]}
          >
            Recent Certificates
          </Text>

          {stats?.recentCertificates?.length === 0 ? (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.textSecondary, fontSize: moderateScale(14) },
                  ]}
                >
                  No certificates yet. Add your first certificate!
                </Text>
                <Button
                  title="Add Certificate"
                  onPress={() => navigation.navigate('AddCertificate')}
                  variant="primary"
                  size="sm"
                  style={{ marginTop: 12 }}
                />
              </View>
            </Card>
          ) : (
            stats?.recentCertificates?.map((cert) => (
              <Card
                key={cert.certificateId}
                onPress={() =>
                  navigation.navigate('CertificateDetail', {
                    certificateId: cert.id,
                  })
                }
                style={{ marginBottom: moderateScale(8) }}
              >
                <View style={styles.certRow}>
                  {/* Status indicator */}
                  <View
                    style={[
                      styles.certStatusDot,
                      {
                        backgroundColor:
                          cert.status === 'valid'
                            ? theme.colors.success
                            : theme.colors.error,
                      },
                    ]}
                  />

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.certName,
                        { color: theme.colors.text, fontSize: moderateScale(15) },
                      ]}
                      numberOfLines={1}
                    >
                      {cert.studentName}
                    </Text>
                    <Text
                      style={[
                        styles.certCourse,
                        {
                          color: theme.colors.textSecondary,
                          fontSize: moderateScale(12),
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {cert.courseName}
                    </Text>
                    <Text
                      style={[
                        styles.certId,
                        {
                          color: theme.colors.primary,
                          fontSize: moderateScale(11),
                        },
                      ]}
                    >
                      {cert.certificateId}
                    </Text>
                  </View>

                  <View style={styles.certRight}>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            cert.status === 'valid'
                              ? theme.colors.success + '20'
                              : theme.colors.error + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          {
                            color:
                              cert.status === 'valid'
                                ? theme.colors.success
                                : theme.colors.error,
                            fontSize: moderateScale(10),
                          },
                        ]}
                      >
                        {cert.status.toUpperCase()}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.textSecondary}
                      style={{ marginTop: 4 }}
                    />
                  </View>
                </View>
              </Card>
            ))
          )}

          {/* View All Button */}
          {(stats?.recentCertificates?.length || 0) > 0 && (
            <Button
              title="View All Certificates"
              onPress={() => navigation.navigate('CertificateList')}
              variant="outline"
              fullWidth
              style={{ marginTop: moderateScale(12), marginBottom: moderateScale(24) }}
              icon={
                <Ionicons name="arrow-forward-outline" size={18} color="#1565C0" />
              }
              iconPosition="right"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerBtn: {
    padding: 8,
    marginLeft: 4,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatarSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  adminAvatarTextSmall: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  welcomeGreeting: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },
  welcomeName: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  welcomeDate: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-1.5%',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-1.5%',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    alignSelf: 'center',
  },
  quickActionLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '400',
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  certStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    flexShrink: 0,
  },
  certName: {
    fontWeight: '600',
  },
  certCourse: {
    marginTop: 2,
  },
  certId: {
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  certRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusChipText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AdminDashboard;
