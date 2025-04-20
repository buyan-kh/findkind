import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, Search as SearchIcon } from 'lucide-react-native';
import Header from '@/components/common/Header';
import PhotoUpload from '@/components/report/PhotoUpload';
import LocationPicker from '@/components/report/LocationPicker';
import TypeSelector, { ReportType } from '@/components/report/TypeSelector';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import MatchCard, { MatchItem } from '@/components/search/MatchCard';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';

export default function SearchScreen() {
  const [reportType, setReportType] = useState<ReportType>('pet');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchItem[]>([]);

  const handlePhotoSelected = (uri: string) => {
    setPhotoUploaded(!!uri);
  };

  const handleLocationSelected = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setLocation(location);
  };

  const handleSearch = () => {
    // Validate required fields
    if (!location) {
      Alert.alert(
        'Location Required',
        'Please select a location where you saw this individual'
      );
      return;
    }

    if (!contactPhone.trim()) {
      Alert.alert(
        'Contact Information Required',
        'Please provide your phone number so owners can contact you'
      );
      return;
    }

    setIsSearching(true);

    // Simulate API search with delayed response
    setTimeout(() => {
      const mockResults: MatchItem[] = [
        {
          id: '1',
          name: 'Max (Golden Retriever)',
          description:
            'Friendly golden retriever, 3 years old, wearing a blue collar with tags.',
          image:
            'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-06-15',
          location: 'Central Park, New York',
          matchPercentage: 89,
          contactPhone: '555-123-4567',
        },
        {
          id: '2',
          name: 'Buddy (Labrador Mix)',
          description:
            'Black and white Labrador mix, medium size, has a small scar on his right ear.',
          image:
            'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-06-12',
          location: 'Downtown, Seattle',
          matchPercentage: 72,
          contactPhone: '555-987-6543',
        },
        {
          id: '3',
          name: 'Charlie (Golden Mix)',
          description:
            'Golden mix with light brown fur, very shy around strangers but friendly once comfortable.',
          image:
            'https://images.pexels.com/photos/3361739/pexels-photo-3361739.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-06-10',
          location: 'Riverside Park, Chicago',
          matchPercentage: 63,
          contactPhone: '555-345-6789',
        },
      ];

      setMatchResults(mockResults);
      setIsSearching(false);
    }, 2000);
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
          title={isSearching ? 'Searching...' : 'Lookout'}
          onPress={handleSearch}
          disabled={isSearching}
          loading={isSearching}
          icon={
            !isSearching ? (
              <SearchIcon color={COLORS.white} size={SIZES.medium} />
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
