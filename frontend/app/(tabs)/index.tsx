import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Camera,
  Compass,
  BellRing,
  Heart,
  Navigation,
} from 'lucide-react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import AnimatedGradient from '@/components/common/AnimatedGradient';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Ensure the background is visible
  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content');
    }
  }, []);

  const handleReportPress = () => {
    router.push('/report');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <View style={styles.mainContainer}>
      <AnimatedGradient />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Find Kind</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.heroSubtitle}>
                Let's help them find their way home ❤️
              </Text>
            </View>
            <View style={styles.heroButtons}>
              <View style={styles.reportButton}>
                <Navigation
                  size={22}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Button
                  title="Report Missing"
                  onPress={handleReportPress}
                  style={styles.heroButton}
                  variant="primary"
                  size="large"
                />
              </View>
              <Button
                title="I've Seen Someone"
                onPress={handleSearchPress}
                variant="secondary"
                style={styles.searchButton}
                size="large"
                textStyle={styles.searchButtonText}
              />
            </View>
          </View>
        </View>

        {/* How it Works Section */}
        <Card glass style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Camera color={COLORS.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Report Missing</Text>
              <Text style={styles.featureDescription}>
                Upload a photo, add details and location of your lost loved one.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Compass color={COLORS.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Community Searching</Text>
              <Text style={styles.featureDescription}>
                Others in the community can report sightings with photos and
                locations.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <MapPin color={COLORS.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Matching</Text>
              <Text style={styles.featureDescription}>
                Our AI system compares photos to find potential matches.
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, { marginBottom: 0 }]}>
            <View style={styles.iconCircle}>
              <BellRing color={COLORS.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Get Notified</Text>
              <Text style={styles.featureDescription}>
                Receive instant notifications when there's a potential match.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SIZES.spacingXXLarge,
  },
  hero: {
    height: 420,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    marginBottom: 0,
  },
  heroContent: {
    position: 'relative',
    top: 90,
    left: 0,
    right: 0,
    padding: SIZES.spacingXLarge,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 56,
    color: COLORS.white,
    marginBottom: SIZES.spacing,
    lineHeight: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingXLarge,
    justifyContent: 'center',
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.large,
    color: COLORS.white,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heartIcon: {
    marginLeft: 8,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: SIZES.spacingLarge,
    marginTop: SIZES.spacingLarge,
  },
  reportButton: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusLarge,
    ...SHADOWS.medium,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  buttonIcon: {
    marginRight: -4,
    zIndex: 1,
  },
  heroButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  searchButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(5px)',
    ...SHADOWS.small,
  },
  searchButtonText: {
    color: COLORS.white,
  },
  sectionContainer: {
    margin: SIZES.spacingLarge,
    marginTop: -70,
    marginHorizontal: SIZES.spacingSmall,
    paddingHorizontal: SIZES.spacingLarge,
    paddingVertical: SIZES.spacingXLarge,
    paddingBottom: SIZES.spacingXXLarge,
    borderWidth: 0,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.darkGray,
    marginBottom: SIZES.spacingXLarge,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SIZES.spacingXLarge,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(209, 250, 229, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacingLarge,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.darkGray,
    marginBottom: SIZES.spacingSmall,
  },
  featureDescription: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 22,
  },
});
