import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import Header from '@/components/common/Header';
import PhotoUpload from '@/components/report/PhotoUpload';
import LocationPicker from '@/components/report/LocationPicker';
import TypeSelector, { ReportType } from '@/components/report/TypeSelector';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';

interface ReportForm {
  type: ReportType;
  name: string;
  description: string;
  photoUri: string;
  contactPhone: string;
  location: { latitude: number; longitude: number } | null;
}

export default function ReportScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ReportForm>({
    type: 'pet',
    name: '',
    description: '',
    photoUri: '',
    contactPhone: '',
    location: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ReportForm, string>>
  >({});

  const handleChange = (field: keyof ReportForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReportForm, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Form Incomplete', 'Please fill all required fields.');
      return;
    }

    setIsLoading(true);

    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Report Submitted',
        "Your report has been submitted successfully. We'll notify you of any potential matches.",
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate to home or matches
              setFormData({
                type: 'pet',
                name: '',
                description: '',
                photoUri: '',
                contactPhone: '',
                location: null,
              });
              router.push('/matches');
            },
          },
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Header title="Report Missing" showBackButton useGradient={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Report Missing Person or Pet</Text>
        <Text style={styles.subtitle}>
          Provide details about your missing loved one to help others identify
          them
        </Text>

        <TypeSelector
          selectedType={formData.type}
          onSelectType={(type) => handleChange('type', type)}
        />

        <PhotoUpload
          onImageSelected={(uri) => handleChange('photoUri', uri)}
          isOptional={true}
          title="Add a Photo (Optional)"
        />
        {errors.photoUri && (
          <Text style={styles.errorText}>{errors.photoUri}</Text>
        )}

        <Input
          label="Name"
          placeholder="Enter name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          error={errors.name}
        />

        <Input
          label="Description"
          placeholder="Provide details like age, appearance, clothing, etc."
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />

        <LocationPicker
          onLocationSelected={(location) => handleChange('location', location)}
        />
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}

        <Text style={styles.sectionTitle}>Contact Information</Text>

        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          value={formData.contactPhone}
          onChangeText={(text) => handleChange('contactPhone', text)}
          keyboardType="phone-pad"
          error={errors.contactPhone}
        />

        <Button
          title={isLoading ? 'Submitting...' : 'Submit Report'}
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          icon={
            !isLoading ? (
              <Send color={COLORS.white} size={SIZES.medium} />
            ) : undefined
          }
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
          gradient
          size="large"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.spacingLarge,
    paddingBottom: SIZES.spacingXXLarge,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.black,
    marginBottom: SIZES.spacingSmall,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.spacingXLarge,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.black,
    marginTop: SIZES.spacingLarge,
    marginBottom: SIZES.spacingLarge,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: SIZES.spacingLarge,
    marginBottom: SIZES.spacingXLarge,
    ...SHADOWS.medium,
  },
  submitButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: -SIZES.spacing,
    marginBottom: SIZES.spacing,
  },
});
