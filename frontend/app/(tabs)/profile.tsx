import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, EyeOff } from 'lucide-react-native';
import Header from '@/components/common/Header';
import MatchCard, { MatchItem } from '@/components/search/MatchCard';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

export default function MySearchesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'mySearches' | 'potentialMissingMatches'
  >('mySearches');
  const [mySearches, setMySearches] = useState<MatchItem[]>([]);
  const [potentialMissingMatches, setPotentialMissingMatches] = useState<
    MatchItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch data
    setTimeout(() => {
      const mockSearches: MatchItem[] = [
        {
          id: '1',
          name: 'Spotted Golden Retriever',
          description:
            'Golden retriever seen near Central Park, friendly and had a blue collar.',
          image:
            'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-15',
          location: 'Central Park, New York',
          matchPercentage: 0,
          contactPhone: '555-123-4567',
        },
        {
          id: '2',
          name: 'Siamese Cat',
          description:
            'Siamese cat found near residential area, appears to be lost.',
          image:
            'https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-12',
          location: 'Park Avenue, Portland',
          matchPercentage: 0,
          contactPhone: '555-987-6543',
        },
      ];

      const mockPotentialMissingMatches: MatchItem[] = [
        {
          id: '3',
          name: 'Max (Golden Retriever)',
          description:
            'Lost friendly golden retriever, 3 years old, wearing a blue collar with tags.',
          image:
            'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-06-15',
          location: 'Central Park, New York',
          matchPercentage: 89,
          contactPhone: '555-222-3333',
        },
        {
          id: '4',
          name: 'Bella (Siamese Cat)',
          description:
            'Lost Siamese cat with blue eyes, cream colored body with dark brown points. Very friendly.',
          image:
            'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-10',
          location: 'Main Street, Portland',
          matchPercentage: 76,
          contactPhone: '555-444-5555',
        },
      ];

      setMySearches(mockSearches);
      setPotentialMissingMatches(mockPotentialMissingMatches);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCardPress = (item: MatchItem) => {
    // In a production app, this would navigate to a detail screen
    Alert.alert(item.name, item.description, [{ text: 'OK' }]);
  };

  const handleContact = (match: MatchItem) => {
    Alert.alert('Contact', `Would you like to contact about ${match.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => {
          // In a real app, this would use Linking.openURL(`tel:${match.contactPhone}`)
          Alert.alert('Calling', `Calling ${match.contactPhone}`);
        },
      },
    ]);
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {activeTab === 'mySearches' ? (
        <>
          <Search color={COLORS.gray} size={SIZES.xxlarge} />
          <Text style={styles.emptyTitle}>No Searches Yet</Text>
          <Text style={styles.emptyText}>
            You haven't searched for any pets or people yet.
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
          >
            <Text style={styles.searchButtonText}>Report Sighting</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <EyeOff color={COLORS.gray} size={SIZES.xxlarge} />
          <Text style={styles.emptyTitle}>No Missing Matches</Text>
          <Text style={styles.emptyText}>
            Your sightings haven't matched any missing reports yet.
          </Text>
        </>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <MatchCard
        match={item}
        expanded={activeTab === 'potentialMissingMatches'}
        onContact={handleContact}
        showPercentage={activeTab === 'potentialMissingMatches'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="My Searches" useGradient={false} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mySearches' && styles.activeTab]}
          onPress={() => setActiveTab('mySearches')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'mySearches' && styles.activeTabText,
            ]}
          >
            My Searches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'potentialMissingMatches' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('potentialMissingMatches')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'potentialMissingMatches' && styles.activeTabText,
            ]}
          >
            Potential Missing
            {potentialMissingMatches.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {potentialMissingMatches.length}
                </Text>
              </View>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'mySearches' ? mySearches : potentialMissingMatches
          }
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacingLarge,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.spacingLarge,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SIZES.spacing,
    paddingBottom: SIZES.spacingXXLarge,
  },
  emptyContainer: {
    padding: SIZES.spacingXLarge,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.darkGray,
    marginTop: SIZES.spacingLarge,
    marginBottom: SIZES.spacingSmall,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.spacingLarge,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadius,
  },
  searchButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.gray,
  },
  badge: {
    backgroundColor: COLORS.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.spacingSmall,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xsmall,
    color: COLORS.white,
  },
});
