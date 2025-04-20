import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, Send } from 'lucide-react-native';
import Header from '@/components/common/Header';
import PhotoUpload from '@/components/report/PhotoUpload';
import LocationPicker from '@/components/report/LocationPicker';
import TypeSelector, { ReportType } from '@/components/report/TypeSelector';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import MatchCard, { MatchItem } from '@/components/search/MatchCard';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import axios from 'axios';
 
const API_BASE = 'https://cd30-128-120-27-122.ngrok-free.app';

export default function SearchScreen() {
  const [reportType, setReportType] = useState<ReportType>('pet');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchItem[]>([]);

  const handlePhotoSelected = (uri: string) => setPhotoUri(uri);

  const handleLocationSelected = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setLocation(location);
  };

  const handleSubmit = async () => {
    if (!location) {
      return Alert.alert(
        'Validation',
        'Please drop a pin for the sighting location first.'
      );
    }
    if (!description.trim()) {
      return Alert.alert('Validation', 'Enter a short description of what you saw.');
    }
    if (!contactPhone.trim()) {
      return Alert.alert('Validation', 'Please provide your phone number.');
    }
    setIsSearching(true);

    try {
      // build multipart form‑data
      const data = new FormData();
      data.append('type', reportType === 'person' ? '1' : '0');
      data.append('lat', String(location.latitude));
      data.append('lon', String(location.longitude));
      data.append('description', description);
      data.append('phone_number', contactPhone.trim());
      if (photoUri) {
        const name = photoUri.split('/').pop() ?? 'photo.jpg';
        const ext  = name.split('.').pop() || 'jpg';
        data.append('photo', { uri: photoUri, name, type: `image/${ext}` } as any);
      }

      await axios.post(`${API_BASE}/report-sighting`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });

      Alert.alert(
        'Thank you!',
        'Your sighting has been submitted. We’ll notify you if it matches a missing report.'
      );

      // reset form
      setPhotoUri(null);
      setLocation(null);
      setDescription('');
      setContactPhone('');
      setMatchResults([]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || err.message || 'Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleContact = (match: MatchItem) => {
    Alert.alert(
      'Contact Owner',
      `Would you like to contact the owner of ${match.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, this would use Linking.openURL(`tel:${match.contactPhone}`)
            Alert.alert('Calling', `Calling ${match.contactPhone}`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Report Sighting" showBackButton useGradient={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Seen a Missing Person or Pet?</Text>
        <Text style={styles.subtitle}>
          Report a sighting and help reunite them with their family
        </Text>

        <TypeSelector selectedType={reportType} onSelectType={setReportType} />

        <PhotoUpload
          onImageSelected={handlePhotoSelected}
          isOptional={true}
          title="Add a Photo (Optional)"
        />

        <LocationPicker onLocationSelected={handleLocationSelected} />

        <Input
          label="Description"
          placeholder="Provide any details about the sighting"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <Text style={styles.sectionTitle}>Your Contact Information</Text>
        <Text style={styles.sectionSubtitle}>
          We'll share this with owners of potential matches
        </Text>

        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
        />

        <Button
          title={isSearching ? 'Submitting…' : 'Submit Sighting'}
          onPress={handleSubmit}
          disabled={isSearching}
          loading={isSearching}
          icon={
            !isSearching ? (
              <Send color={COLORS.white} size={SIZES.medium} />
            ) : undefined
          }
          style={styles.searchButton}
          textStyle={styles.searchButtonText}
          gradient
          size="large"
        />

        {matchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Matching Missing Reports</Text>
            <Text style={styles.resultsSubtitle}>
              We found {matchResults.length} potential matches to your sighting
            </Text>

            {matchResults.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                expanded
                onContact={handleContact}
                showPercentage={true}
              />
            ))}

            <Text style={styles.disclaimer}>
              Please contact the owner only if you're confident about the match.
              False reports can cause distress.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  searchButton: {
    marginTop: SIZES.spacingLarge,
    marginBottom: SIZES.spacingXLarge,
    ...SHADOWS.medium,
  },
  searchButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  resultsContainer: {
    marginTop: SIZES.spacingXLarge,
  },
  resultsTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.black,
    marginBottom: SIZES.spacingSmall,
  },
  resultsSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.spacingLarge,
  },
  disclaimer: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SIZES.spacingLarge,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.black,
    marginTop: SIZES.spacingLarge,
    marginBottom: SIZES.spacingSmall,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.spacingLarge,
  },
});
