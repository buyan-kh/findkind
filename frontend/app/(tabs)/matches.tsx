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
import { Bell, BellOff } from 'lucide-react-native';
import Header from '@/components/common/Header';
import MatchCard, { MatchItem } from '@/components/search/MatchCard';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

export default function MatchesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'myReports' | 'potentialMatches'>(
    'myReports'
  );
  const [myReports, setMyReports] = useState<MatchItem[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch data
    setTimeout(() => {
      const mockReports: MatchItem[] = [
        {
          id: '1',
          name: 'Bella (Siamese Cat)',
          description:
            'Siamese cat with blue eyes, cream colored body with dark brown points. Very friendly.',
          image:
            'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-10',
          location: 'Main Street, Portland',
          matchPercentage: 0,
          contactPhone: '555-123-4567',
        },
        {
          id: '2',
          name: 'Rex (German Shepherd)',
          description:
            'German Shepherd, black and tan, wearing red collar with silver tag.',
          image:
            'https://images.pexels.com/photos/333083/pexels-photo-333083.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-05',
          location: 'Central Park, New York',
          matchPercentage: 0,
          contactPhone: '555-987-6543',
        },
      ];

      const mockMatches: MatchItem[] = [
        {
          id: '3',
          name: 'Similar to Bella',
          description:
            'Siamese cat spotted near Park Ave, looks very similar to your Bella.',
          image:
            'https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-12',
          location: 'Park Avenue, Portland',
          matchPercentage: 87,
          contactPhone: '555-222-3333',
        },
        {
          id: '4',
          name: 'Similar to Rex',
          description:
            'German Shepherd seen in downtown area, matches description of Rex.',
          image:
            'https://images.pexels.com/photos/236622/pexels-photo-236622.jpeg?auto=compress&cs=tinysrgb&w=600',
          lastSeen: '2023-07-07',
          location: 'Downtown, New York',
          matchPercentage: 72,
          contactPhone: '555-444-5555',
        },
      ];

      setMyReports(mockReports);
      setPotentialMatches(mockMatches);
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

  const handleReportPress = () => {
    router.push('/report');
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {activeTab === 'myReports' ? (
        <>
          <Bell color={COLORS.gray} size={SIZES.xxlarge} />
          <Text style={styles.emptyTitle}>No Missing Reports Yet</Text>
          <Text style={styles.emptyText}>
            You haven't reported any missing pets or people yet.
          </Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportPress}
          >
            <Text style={styles.reportButtonText}>Report Missing</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <BellOff color={COLORS.gray} size={SIZES.xxlarge} />
          <Text style={styles.emptyTitle}>No Sightings Yet</Text>
          <Text style={styles.emptyText}>
            When someone reports a sighting that matches your description, it
            will appear here.
          </Text>
        </>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <MatchCard
        match={item}
        expanded={activeTab === 'potentialMatches'}
        onContact={handleContact}
        showPercentage={activeTab === 'potentialMatches'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="My Matches" useGradient={false} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myReports' && styles.activeTab]}
          onPress={() => setActiveTab('myReports')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'myReports' && styles.activeTabText,
            ]}
          >
            My Missing Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'potentialMatches' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('potentialMatches')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'potentialMatches' && styles.activeTabText,
            ]}
          >
            Potential Sightings
            {potentialMatches.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{potentialMatches.length}</Text>
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
          data={activeTab === 'myReports' ? myReports : potentialMatches}
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
  reportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadius,
  },
  reportButtonText: {
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
