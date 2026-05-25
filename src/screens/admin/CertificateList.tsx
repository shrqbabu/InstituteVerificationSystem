/**
 * Certificate List Screen
 * Searchable, filterable list of all certificates with admin actions
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useCertificates } from '../../hooks/useCertificates';
import { Certificate } from '../../types';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const CertificateList: React.FC = () => {
  const { theme } = useTheme();
  const { moderateScale, isTablet } = useResponsive();
  const navigation = useNavigation<any>();
  const { certificates, isLoading, error, refresh, removeCertificate } =
    useCertificates(true); // real-time

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // ============================================================
  // Filter certificates
  // ============================================================
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        !searchQuery ||
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' || cert.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchQuery, selectedStatus]);

  // ============================================================
  // Delete certificate
  // ============================================================
  const handleDelete = (cert: Certificate) => {
    Alert.alert(
      'Delete Certificate',
      `Are you sure you want to delete the certificate for ${cert.studentName}?\n\nCertificate ID: ${cert.certificateId}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(cert.id!);
              await removeCertificate(cert.id!);
              Alert.alert('✅ Deleted', 'Certificate has been deleted successfully.');
            } catch (error: any) {
              Alert.alert('❌ Error', error.message);
            } finally {
              setIsDeleting(null);
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // Status filter options
  // ============================================================
  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Expired', value: 'expired' },
    { label: 'Revoked', value: 'revoked' },
  ];

  // ============================================================
  // Certificate item renderer
  // ============================================================
  const renderItem = ({ item }: { item: Certificate }) => {
    const statusColor = {
      valid: theme.colors.success,
      invalid: theme.colors.error,
      expired: theme.colors.warning,
      revoked: theme.colors.textSecondary,
    }[item.status] || theme.colors.textSecondary;

    return (
      <Card
        style={{ marginBottom: moderateScale(8), marginHorizontal: moderateScale(16) }}
        onPress={() =>
          navigation.navigate('CertificateDetail', { certificateId: item.id })
        }
      >
        <View style={styles.certItem}>
          {/* Status bar */}
          <View style={[styles.certStatusBar, { backgroundColor: statusColor }]} />

          <View style={styles.certContent}>
            {/* Top row */}
            <View style={styles.certTopRow}>
              <Text
                style={[
                  styles.certName,
                  { color: theme.colors.text, fontSize: moderateScale(15) },
                ]}
                numberOfLines={1}
              >
                {item.studentName}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: statusColor, fontSize: moderateScale(10) },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Course */}
            <Text
              style={[
                styles.certCourse,
                { color: theme.colors.textSecondary, fontSize: moderateScale(13) },
              ]}
              numberOfLines={1}
            >
              {item.courseName} • {item.duration}
            </Text>

            {/* ID and Date */}
            <View style={styles.certMeta}>
              <Text
                style={[
                  styles.certId,
                  { color: theme.colors.primary, fontSize: moderateScale(11) },
                ]}
              >
                {item.certificateId}
              </Text>
              <Text
                style={[
                  styles.certDate,
                  { color: theme.colors.textSecondary, fontSize: moderateScale(11) },
                ]}
              >
                {new Date(item.issueDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.certActions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EditCertificate', { certificateId: item.id })
                }
                style={[
                  styles.actionBtn,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: theme.colors.primary, fontSize: moderateScale(12) },
                  ]}
                >
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item)}
                
