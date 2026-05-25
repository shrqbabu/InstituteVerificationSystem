/**
 * Add Certificate Screen
 * Form to create new certificates with image upload
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { createCertificate } from '../../services/firebase/firestore';
import { uploadStudentPhoto } from '../../services/firebase/storage';
import { CertificateFormData, CertificateStatus } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ============================================================
// Course options
// ============================================================
const COURSES = [
  'Full Stack Development',
  'Web Development',
  'Mobile App Development',
  'Data Science & AI',
  'Digital Marketing',
  'Graphic Design',
  'Cyber Security',
  'Cloud Computing',
  'Database Management',
  'Python Programming',
];

const STATUS_OPTIONS: { label: string; value: CertificateStatus; color: string }[] = [
  { label: 'Valid', value: 'valid', color: '#16A34A' },
  { label: 'Invalid', value: 'invalid', color: '#DC2626' },
  { label: 'Expired', value: 'expired', color: '#D97706' },
  { label: 'Revoked', value: 'revoked', color: '#6B7280' },
];

const AddCertificate: React.FC = () => {
  const { theme } = useTheme();
  const { moderateScale, isTablet } = useResponsive();
  const navigation = useNavigation<any>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const [formData, setFormData] = useState<CertificateFormData>({
    studentName: '',
    studentEmail: '',
    courseName: '',
    courseCode: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    duration: '',
    grade: '',
    instructorName: '',
    description: '',
    status: 'valid',
  });

  const [errors, setErrors] = useState<Partial<CertificateFormData>>({});

  // ============================================================
  // Update form field
  // ============================================================
  const updateField = (field: keyof CertificateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ============================================================
  // Validate form
  // ============================================================
  const validate = (): boolean => {
    const newErrors: Partial<CertificateFormData> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (formData.studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // Pick student photo
  // ============================================================
  const pickPhoto = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  // ============================================================
  // Take photo with camera
  // ============================================================
  const takePhoto = async () => {
    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  // ============================================================
  // Submit form
  // ============================================================
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      let photoUrl = '';

      // Upload photo if selected
      if (selectedPhoto) {
        setUploadProgress(0);
        const tempCertId = `CERT-${Date.now()}`;
        photoUrl = await uploadStudentPhoto(
          selectedPhoto,
          tempCertId,
          (progress) => setUploadProgress(progress)
        );
      }

      // Create certificate
      const certificate = await createCertificate(formData, undefined, photoUrl);

      Alert.alert(
        '✅ Certificate Created',
        `Certificate ID: ${certificate.certificateId}\n\nThe certificate has been successfully created.`,
        [
          {
            text: 'View Certificate',
            onPress: () => {
              navigation.navigate('CertificateDetail', {
                certificateId: certificate.id,
              });
            },
          },
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form
              setFormData({
                studentName: '',
                studentEmail: '',
                courseName: '',
                courseCode: '',
                issueDate: new Date().toISOString().split('T')[0],
                expiryDate: '',
                duration: '',
                grade: '',
                instructorName: '',
                description: '',
                status: 'valid',
              });
              setSelectedPhoto(null);
              setErrors({});
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Failed to create certificate');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // ============================================================
  // Section Header Component
  // ============================================================
  const SectionHeader: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
    <View
      style={[
        styles.sectionHeader,
        {
          borderLeftColor: theme.colors.primary,
          marginBottom: moderateScale(16),
          marginTop: moderateScale(8),
        },
      ]}
    >
      <Ionicons name={icon as any} size={moderateScale(18)} color={theme.colors.primary} />
      <Text
        style={[
          styles.sectionHeaderText,
          { color: theme.colors.text, fontSize: moderateScale(16) },
        ]}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            paddingHorizontal: moderateScale(16),
            paddingVertical: moderateScale(14),
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.colors.text, fontSize: moderateScale(18) },
          ]}
        >
          Add New Certificate
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            padding: moderateScale(16),
            maxWidth: isTablet ? 800 : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          {/* Photo Upload */}
          <Card style={{ marginBottom: moderateScale(16) }}>
            <SectionHeader title="Student Photo" icon="camera-outline" />

            <View style={styles.photoSection}>
              {/* Photo Preview */}
              {selectedPhoto ? (
                <TouchableOpacity onPress={pickPhoto}>
                  <Image
                    source={{ uri: selectedPhoto }}
                    style={[
                      styles.photoPreview,
                      {
                        borderRadius: theme.borderRadius.round,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={pickPhoto}
                  style={[
                    styles.photoPlaceholder,
                    {
                      backgroundColor: theme.colors.primary + '10',
                      borderColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.round,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={moderateScale(32)}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.photoPlaceholderText,
                      { color: theme.colors.primary, fontSize: moderateScale(12) },
                    ]}
                  >
                    Add Photo
                  </Text>
                </TouchableOpacity>
              )}

              {/* Photo buttons */}
              <View style={styles.photoButtons}>
                <Button
                  title="Gallery"
                  onPress={pickPhoto}
                  variant="outline"
                  size="sm"
                  icon={<Ionicons name="images-outline" size={16} color="#1565C0" />}
                  style={{ marginBottom: 8, minWidth: 110 }}
                />
                <Button
                  title="Camera"
                  onPress={takePhoto}
                  variant="outline"
                  size="sm"
                  icon={<Ionicons name="camera-outline" size={16} color="#1565C0" />}
                  style={{ minWidth: 110 }}
                />
                {selectedPhoto && (
                  <Button
                    title="Remove"
                    onPress={() => setSelectedPhoto(null)}
                    variant="ghost"
                    size="sm"
                    icon={<Ionicons name="trash-outline" size={16} color="#DC2626" />}
                    textStyle={{ color: '#DC2626' }}
                    style={{ marginTop: 8 }}
                  />
                )}
              </View>
            </View>
          </Card>

          {/* Student Information */}
          <Card style={{ marginBottom: moderateScale(16) }}>
            <SectionHeader title="Student Information" icon="person-outline" />

            <Input
              label="Student Name"
              value={formData.studentName}
              onChangeText={(text) => updateField('studentName', text)}
              error={errors.studentName}
              placeholder="Enter full name"
              leftIcon="person-outline"
              required
            />

            <Input
              label="Student Email"
              value={formData.studentEmail}
              onChangeText={(text) => updateField('studentEmail', text)}
              error={errors.studentEmail}
              placeholder="student@email.com"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Card>

          {/* Course Information */}
          <Card style={{ marginBottom: moderateScale(16) }}>
            <SectionHeader title="Course Information" icon="book-outline" />

            {/* Course Name Picker */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={[
                  styles.pickerLabel,
                  { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
                ]}
              >
                COURSE NAME *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCoursePicker(!showCoursePicker)}
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.courseName
                      ? theme.colors.error
                      : theme.colors.border,
                    borderRadius: theme.borderRadius.lg,
                    ...theme.shadows.small,
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.pickerText,
                    {
                      color: formData.courseName
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                      fontSize: moderateScale(14),
                    },
                  ]}
                >
                  {formData.courseName || 'Select a course...'}
                </Text>
                <Ionicons
                  name={showCoursePicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {errors.courseName && (
                <Text style={[styles.errorHint, { color: theme.colors.error }]}>
                  {errors.courseName}
                </Text>
              )}

              {/* Course Dropdown */}
              {showCoursePicker && (
                <View
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.lg,
                      ...theme.shadows.medium,
                    },
                  ]}
                >
                  {COURSES.map((course) => (
                    <TouchableOpacity
                      key={course}
                      onPress={() => {
                        updateField('courseName', course);
                        setShowCoursePicker(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        {
                          backgroundColor:
                            formData.courseName === course
                              ? theme.colors.primary + '15'
                              : 'transparent',
                          borderBottomColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          formData.courseName === course
                            ? 'checkmark-circle'
                            : 'ellipse-outline'
                        }
                        size={16}
                        color={
                          formData.courseName === course
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {
                            color:
                              formData.courseName === course
                                ? theme.colors.primary
                                : theme.colors.text,
                            fontSize: moderateScale(14),
                          },
                        ]}
                      >
                        {course}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Custom course input */}
                  <View style={[styles.dropdownItem, { borderBottomWidth: 0 }]}>
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color={theme.colors.secondary}
                    />
                    <Text style={[{ color: theme.colors.secondary, marginLeft: 8, fontSize: moderateScale(13) }]}>
                      Type custom course below
                    </Text>
                  </View>
                </View>
              )}

              {/* Custom course input */}
              {(showCoursePicker || formData.courseName) && (
                <Input
                  label=""
                  value={formData.courseName}
                  onChangeText={(text) => updateField('courseName', text)}
                  placeholder="Or type custom course name..."
                  containerStyle={{ marginTop: 8, marginBottom: 0 }}
                />
              )}
            </View>

            <Input
              label="Course Code"
              value={formData.courseCode}
              onChangeText={(text) => updateField('courseCode', text)}
              placeholder="e.g., CS-101"
              leftIcon="barcode-outline"
            />

            <Input
              label="Duration"
              value={formData.duration}
              onChangeText={(text) => updateField('duration', text)}
              error={errors.duration}
              placeholder="e.g., 6 Months"
              leftIcon="time-outline"
              required
            />

            <Input
              label="Instructor Name"
              value={formData.instructorName}
              onChangeText={(text) => updateField('instructorName', text)}
              placeholder="Course instructor"
              leftIcon="school-outline"
            />
          </Card>

          {/* Certificate Details */}
          <Card style={{ marginBottom: moderateScale(16) }}>
            <SectionHeader title="Certificate Details" icon="document-text-outline" />

            <Input
              label="Issue Date"
              value={formData.issueDate}
              onChangeText={(text) => updateField('issueDate', text)}
              error={errors.issueDate}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
              required
              hint="Format: YYYY-MM-DD (e.g., 2026-05-25)"
            />

            <Input
              label="Expiry Date (Optional)"
              value={formData.expiryDate}
              onChangeText={(text) => updateField('expiryDate', text)}
              placeholder="YYYY-MM-DD (leave blank for no expiry)"
              leftIcon="calendar-clear-outline"
            />

            <Input
              label="Grade (Optional)"
              value={formData.grade}
              onChangeText={(text) => updateField('grade', text)}
              placeholder="e.g., A+, Distinction, Merit"
              leftIcon="ribbon-outline"
            />

            {/* Status Picker */}
            <View>
              <Text
                style={[
                  styles.pickerLabel,
                  { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
                ]}
              >
                CERTIFICATE STATUS
              </Text>
              <View style={styles.statusOptions}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateField('status', option.value)}
                    style={[
                      styles.statusOption,
                      {
                        backgroundColor:
                          formData.status === option.value
                            ? option.color + '20'
                            : theme.colors.background,
                        borderColor:
                          formData.status === option.value
                            ? option.color
                            : theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 1.5,
                        padding: moderateScale(10),
                        margin: 4,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: option.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        {
                          color:
                            formData.status === option.value
                              ? option.color
                              : theme.colors.text,
                          fontSize: moderateScale(13),
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Description (Optional)"
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Additional notes about this certificate..."
              leftIcon="document-outline"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80 }}
            />
          </Card>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <Card style={{ marginBottom: moderateScale(16) }}>
              <Text
                style={[
                  styles.progressText,
                  { color: theme.colors.text, fontSize: moderateScale(14) },
                ]}
              >
                Uploading photo: {Math.round(uploadProgress)}%
              </Text>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${uploadProgress}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </Card>
          )}

          {/* Submit Buttons */}
          <Button
            title={isSubmitting ? 'Creating Certificate...' : 'Create Certificate'}
            onPress={handleSubmit}
            isLoading={isSubmitting}
            variant="primary"
            size="lg"
            fullWidth
            icon={
              !isSubmitting
                ? <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                : undefined
            }
            style={{ marginBottom: moderateScale(12) }}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            fullWidth
            style={{ marginBottom: moderateScale(32) }}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  sectionHeaderText: {
    fontWeight: '700',
    marginLeft: 8,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderWidth: 3,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    marginTop: 6,
    fontWeight: '600',
  },
  photoButtons: {
    flex: 1,
    alignItems: 'flex-start',
  },
  pickerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  pickerText: {
    flex: 1,
    fontWeight: '400',
  },
  errorHint: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  dropdownItemText: {
    fontWeight: '500',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOptionText: {
    fontWeight: '600',
  },
  progressText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default AddCertificate;
