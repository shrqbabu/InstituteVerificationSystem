/**
 * Certificate Verification Result Component
 * Shows certificate details after verification with animation
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Certificate } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import Card from '../common/Card';
import Button from '../common/Button';

interface VerificationResultProps {
  certificate: Certificate;
  onDownload?: () => void;
  onShare?: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  certificate,
  onDownload,
  onShare,
}) => {
  const { theme } = useTheme();
  const { moderateScale, isTablet } = useResponsive();

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isValid = certificate.status === 'valid';
  const statusColor = isValid ? theme.colors.success : theme.colors.error;

  const InfoRow: React.FC<{ label: string; value: string; icon?: string }> = ({
    label,
    value,
    icon,
  }) => (
    <View
      style={[
        styles.infoRow,
        {
          borderBottomColor: theme.colors.border,
          paddingVertical: moderateScale(12),
        },
      ]}
    >
      <View style={styles.infoLeft}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={moderateScale(16)}
            color={theme.colors.primary}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          style={[
            styles.infoLabel,
            { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.infoValue,
          { color: theme.colors.text, fontSize: moderateScale(14) },
        ]}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <LinearGradient
          colors={
            isValid
              ? [theme.colors.success, '#15803D']
              : [theme.colors.error, '#B91C1C']
          }
          style={[
            styles.statusBanner,
            { borderRadius: theme.borderRadius.xl, padding: moderateScale(20) },
          ]}
        >
          <View style={styles.statusContent}>
            <View
              style={[
                styles.statusIconBg,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Ionicons
                name={isValid ? 'shield-checkmark' : 'shield-outline'}
                size={moderateScale(40)}
                color="#FFFFFF"
              />
            </View>
            <Text
              style={[
                styles.statusTitle,
                { fontSize: moderateScale(22), marginTop: moderateScale(12) },
              ]}
            >
              {isValid ? '✓ Certificate Verified' : '✗ Invalid Certificate'}
            </Text>
            <Text
              style={[
                styles.statusSubtitle,
                { fontSize: moderateScale(13) },
              ]}
            >
              {isValid
                ? 'This is an authentic certificate issued by the institute'
                : 'This certificate could not be verified or has been revoked'}
            </Text>
          </View>
        </LinearGradient>

        {/* Certificate Details */}
        <Card style={{ marginTop: moderateScale(16) }}>
          {/* Institute Header */}
          <View
            style={[
              styles.instituteHeader,
              {
                borderBottomColor: theme.colors.border,
                paddingBottom: moderateScale(16),
                marginBottom: moderateScale(8),
              },
            ]}
          >
            <View
              style={[
                styles.instituteLogo,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.instituteLogoText}>ICV</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  styles.instituteName,
                  { color: theme.colors.primary, fontSize: moderateScale(16) },
                ]}
              >
                Institute Certificate
              </Text>
              <Text
                style={[
                  styles.instituteSubname,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: moderateScale(12),
                  },
                ]}
              >
                Verification System
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: statusColor, fontSize: moderateScale(11) },
                ]}
              >
                {certificate.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Student Photo */}
          {certificate.photoUrl ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: certificate.photoUrl }}
                style={[
                  styles.studentPhoto,
                  {
                    borderRadius: theme.borderRadius.round,
                    borderColor: theme.colors.primary,
                    width: moderateScale(80),
                    height: moderateScale(80),
                  },
                ]}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Info Rows */}
          <InfoRow
            label="Student Name"
            value={certificate.studentName}
            icon="person-outline"
          />
          <InfoRow
            label="Course Name"
            value={certificate.courseName}
            icon="book-outline"
          />
          <InfoRow
            label="Certificate ID"
            value={certificate.certificateId}
            icon="id-card-outline"
          />
          <InfoRow
            label="Issue Date"
            value={new Date(certificate.issueDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            icon="calendar-outline"
          />
          <InfoRow
            label="Duration"
            value={certificate.duration}
            icon="time-outline"
          />
          {certificate.grade && (
            <InfoRow
              label="Grade"
              value={certificate.grade}
              icon="ribbon-outline"
            />
          )}
          {certificate.instructorName && (
            <InfoRow
              label="Instructor"
              value={certificate.instructorName}
              icon="school-outline"
            />
          )}
          {certificate.expiryDate && (
            <InfoRow
              label="Valid Until"
              value={new Date(certificate.expiryDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              icon="calendar-clear-outline"
            />
          )}

          {/* QR Code */}
          <View
            style={[
              styles.qrContainer,
              {
                marginTop: moderateScale(16),
                paddingTop: moderateScale(16),
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.qrLabel,
                {
                  color: theme.colors.textSecondary,
                  fontSize: moderateScale(12),
                  marginBottom: moderateScale(12),
                },
              ]}
            >
              QR CODE
            </Text>
            <QRCode
              value={`https://verify.institute.com/${certificate.certificateId}`}
              size={moderateScale(isTablet ? 160 : 120)}
              color={theme.colors.text}
              backgroundColor={theme.colors.card}
            />
            <Text
              style={[
                styles.qrSubtext,
                {
                  color: theme.colors.textSecondary,
                  fontSize: moderateScale(10),
                  marginTop: moderateScale(8),
                },
              ]}
            >
              Scan to verify authenticity
            </Text>
          </View>

          {/* Verification Count */}
          <View
            style={[
              styles.verifyCount,
              {
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.md,
                padding: moderateScale(12),
                marginTop: moderateScale(16),
              },
            ]}
          >
            <Ionicons
              name="eye-outline"
              size={moderateScale(16)}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.verifyCountText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: moderateScale(12),
                  marginLeft: 8,
                },
              ]}
            >
              Verified {certificate.verifiedCount} times
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        {isValid && (
          <View
            style={[
              styles.actionButtons,
              { marginTop: moderateScale(16), gap: moderateScale(12) },
            ]}
          >
            {onDownload && (
              <Button
                title="Download PDF"
                onPress={onDownload}
                variant="primary"
                fullWidth
                icon={
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                }
              />
            )}
            {onShare && (
              <Button
                title="Share Certificate"
                onPress={onShare}
                variant="outline"
                fullWidth
                icon={
                  <Ionicons
                    name="share-outline"
                    size={18}
                    color="#1565C0"
                  />
                }
              />
            )}
          </View>
        )}

        {/* Security Notice */}
        <View
          style={[
            styles.securityNotice,
            {
              backgroundColor: theme.colors.info + '15',
              borderRadius: theme.borderRadius.lg,
              padding: moderateScale(12),
              marginTop: moderateScale(16),
              marginBottom: moderateScale(24),
              borderLeftColor: theme.colors.info,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.colors.info}
          />
          <Text
            style={[
              styles.securityText,
              { color: theme.colors.info, fontSize: moderateScale(12) },
            ]}
          >
            This verification is secured by the Institute Certificate Verification System.
            Do not trust certificates that cannot be verified through this system.
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statusBanner: {
    overflow: 'hidden',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  instituteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  instituteLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instituteLogoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  instituteName: {
    fontWeight: '700',
  },
  instituteSubname: {
    fontWeight: '400',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  studentPhoto: {
    borderWidth: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  qrContainer: {
    alignItems: 'center',
    borderTopWidth: 0.5,
  },
  qrLabel: {
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  qrSubtext: {
    textAlign: 'center',
  },
  verifyCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyCountText: {
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'column',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
  },
  securityText: {
    marginLeft: 8,
    flex: 1,
    fontWeight: '400',
    lineHeight: 18,
  },
});

export default VerificationResult;
