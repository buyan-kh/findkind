import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import Header from '@/components/common/Header';
import PhotoUpload from '@/components/report/PhotoUpload';
import LocationPicker from '@/components/report/LocationPicker';
import TypeSelector, { ReportType } from '@/components/report/TypeSelector';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import axios from 'axios';

// Ngrok public URL forwarding to local FastAPI
const API_BASE = 'https://cd30-128-120-27-122.ngrok-free.app';

interface ReportForm {
  type: ReportType;
  name: string;
  description: string;
  photoUri: string;
  contactPhone: string;
  location: { latitude: number; longitude: number } | null;
  missingSince: string;      // ISO date string
  reward: string;            // optional
}

export default function ReportScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<ReportForm>({
    type: 'pet',
    name: '',
    description: '',
    photoUri: '',
    contactPhone: '',
    location: null,
    missingSince: '',
    reward: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ReportForm, string>>>({});

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission needed', 'Enable photo access in Settings.');
      }
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Permission needed', 'Enable location access in Settings.');
      }
    })();
  }, []);

  const handleChange = (field: keyof ReportForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ReportForm, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone number is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.missingSince) newErrors.missingSince = 'Select missing date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Form Incomplete', 'Fill all required fields.');
      return;
    }
    setIsLoading(true);
    const data = new FormData();
    if (formData.photoUri) {
      const uriParts = formData.photoUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split('.').pop() || 'jpg';
      data.append('photo', {
        uri: formData.photoUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    }
    data.append('type', formData.type === 'person' ? '0' : '1');
    data.append('full_name', formData.name);
    data.append('description', formData.description);
    data.append('phone_number', formData.contactPhone);
    data.append('lat', String(formData.location!.latitude));
    data.append('lon', String(formData.location!.longitude));
    data.append('missing_since', formData.missingSince);
    if (formData.reward.trim()) {
      data.append('reward', formData.reward);
    }

    try {
      await axios.post(
        `${API_BASE}/report-missing`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000,
        }
      );
      Alert.alert(
        'Report Submitted',
        'Your report has been submitted.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                type: 'pet',
                name: '',
                description: '',
                photoUri: '',
                contactPhone: '',
                location: null,
                missingSince: '',
                reward: '',
              });
              router.push('/matches');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Submission Failed', error.response?.data?.detail || error.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Header title="Report Missing" showBackButton useGradient={false} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report Missing Person or Pet</Text>
        <Text style={styles.subtitle}>Help others identify your missing loved one</Text>
        <TypeSelector selectedType={formData.type} onSelectType={type => handleChange('type', type)} />
        <PhotoUpload onImageSelected={uri => handleChange('photoUri', uri)} isOptional title="Add a Photo (Optional)" />
        <Input
          label="Name"
          placeholder="Enter name"
          value={formData.name}
          onChangeText={text => handleChange('name', text)}
          error={errors.name}
        />
        <Input
          label="Description"
          placeholder="Details (age, clothing...)"
          value={formData.description}
          onChangeText={text => handleChange('description', text)}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />
        <LocationPicker onLocationSelected={loc => handleChange('location', loc)} />
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

        {/* Date Picker for Missing Since */}
        <View style={{ marginTop: SIZES.spacingLarge }}>
          <Text style={styles.label}>Missing Since</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{formData.missingSince || 'Select date'}</Text>
          </TouchableOpacity>
          {errors.missingSince && <Text style={styles.errorText}>{errors.missingSince}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={
                formData.missingSince ? new Date(formData.missingSince) : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  const iso = date.toISOString().split('T')[0];
                  handleChange('missingSince', iso);
                }
              }}
            />
          )}
        </View>

        <Input
          label="Reward (optional)"
          placeholder="Enter reward amount"
          value={formData.reward}
          onChangeText={text => handleChange('reward', text)}
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          value={formData.contactPhone}
          onChangeText={text => handleChange('contactPhone', text)}
          keyboardType="phone-pad"
          error={errors.contactPhone}
        />
        <Button
          title={isLoading ? 'Submitting...' : 'Submit Report'}
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          icon={!isLoading && <Send color={COLORS.white} size={SIZES.medium} />}
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
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollView: { flex: 1 },
  content: { padding: SIZES.spacingLarge, paddingBottom: SIZES.spacingXXLarge },
  title: { fontFamily: FONTS.bold, fontSize: SIZES.xxlarge, color: COLORS.black, marginBottom: SIZES.spacingSmall },
  subtitle: { fontFamily: FONTS.regular, fontSize: SIZES.medium, color: COLORS.gray, marginBottom: SIZES.spacingXLarge },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.large, color: COLORS.black, marginTop: SIZES.spacingLarge, marginBottom: SIZES.spacingLarge },
  label: { fontFamily: FONTS.semiBold, fontSize: SIZES.base, marginBottom: 4 },
  dateButton: { padding: SIZES.spacingSmall, borderWidth: 1, borderColor: COLORS.gray, borderRadius: 4 },
  dateText: { fontFamily: FONTS.regular, fontSize: SIZES.base },
  submitButton: { marginTop: SIZES.spacingLarge, marginBottom: SIZES.spacingXLarge, ...SHADOWS.medium },
  submitButtonText: { color: COLORS.white, fontFamily: FONTS.bold },
  errorText: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: COLORS.error, marginTop: 4 },
});
