// matches.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, BellOff } from 'lucide-react-native';
import Header from '@/components/common/Header';
import MatchCard, { MatchItem } from '@/components/search/MatchCard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import axios from 'axios';

// point this at your FastAPI server
const API_BASE = 'https://cd30-128-120-27-122.ngrok-free.app';

export default function MatchesScreen() {
  const router = useRouter();

  // search form
  const [phoneSearch, setPhoneSearch] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);

  // tabs + data
  const [activeTab, setActiveTab] = useState<'myReports' | 'potentialMatches'>(
    'myReports'
  );
  const [myReports, setMyReports] = useState<MatchItem[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // map your own reports → MatchItem
  const mapMyReport = (r: any): MatchItem & { found?: boolean } => {
    // r._id may arrive as { $oid: "…" } or plain string
    const rawId = r._id ?? r.id;
    const id =
      typeof rawId === 'object' && rawId !== null && '$oid' in rawId
        ? rawId.$oid
        : String(rawId);
  
    return {
      id,                       // always a unique string
      name: r.full_name,
      description: r.description,
      image: r.photo_url,
      lastSeen: r.missing_since,
      location: r.last_seen_location
        ? `${r.last_seen_location.lat.toFixed(4)}, ${r.last_seen_location.lon.toFixed(4)}`
        : '',
      matchPercentage: 0,
      contactPhone: r.phone_number,
      found: r.found || false,  // backend sets this field
    };
  };

  // map potential sighting → MatchItem
  const mapPotential = (r: any): MatchItem => ({
    id: r.id,
    name: '',
    description: r.description,
    image: r.image_url,
    lastSeen: r.created,
    location:
      (r.last_seen_location || r.search_location)
        ? `${(r.last_seen_location || r.search_location).lat.toFixed(4)}, ${(r.last_seen_location || r.search_location).lon.toFixed(4)}`
        : '',
    matchPercentage: parseFloat((r.combined_score ?? 0).toFixed(2)),
    contactPhone: r.contact ?? r.phone_number,
  });

  const handleSearch = async () => {
    if (!phoneSearch.trim()) {
      return Alert.alert('Validation', 'Enter your phone number first.');
    }
    setSearching(true);
    setLoading(true);

    try {
      const [resReports, resMatches] = await Promise.all([
        axios.get(`${API_BASE}/my-reports`, {
          params: { phone_number: phoneSearch.trim() },
        }),
        axios.get(`${API_BASE}/potential-matches`, {
          params: { phone_number: phoneSearch.trim() },
        }),
      ]);

      setMyReports(resReports.data.reports.map(mapMyReport));
      setPotentialMatches(resMatches.data.matches.map(mapPotential));
      // ▸ dedup by ID  ─────────────────────────────────────────────
      const unique: Record<string, MatchItem> = {};
      resMatches.data.matches.forEach((m: any) => {
        const mapped = mapPotential(m);
        unique[mapped.id] = mapped;     // overwrite duplicates
      });
      setPotentialMatches(Object.values(unique));
      setActiveTab('myReports');
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Search failed',
        err.response?.data?.detail || err.message || 'Please try again.'
      );
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleCardPress = (item: MatchItem) => {
    Alert.alert(item.name, item.description, [{ text: 'OK' }]);
  };

    const handleContact = (match: MatchItem) => {
      Alert.alert(
        'Contact',
        `Call ${match.contactPhone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              const telUrl = `tel:${match.contactPhone}`;
              Linking.canOpenURL(telUrl).then((supported) => {
                if (supported) {
                  Linking.openURL(telUrl);
                } else {
                  Alert.alert('Error', 'Unable to open phone dialer');
                }
              });
            },
          },
        ],
        { cancelable: true }
      );
    };

  const handleReportPress = () => {
    router.push('/report');
  };

  // MARK REPORT AS FOUND
  const handleMarkFound = async (id: string) => {
    try {
      await axios.patch(`${API_BASE}/my-reports/${id}/found`, { found: true });
      // update local list
      setMyReports(current =>
        current.map(r => (r.id === id ? { ...r, found: true } : r))
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not mark as found');
    }
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
        hideName={activeTab === 'potentialMatches'}
      />
      {/* Green tick overlay when report is marked found */}
      {activeTab === 'myReports' && item.found && (
        <View style={styles.tickContainer}>
          <Text style={styles.tick}>✔</Text>
        </View>
      )}
      {activeTab === 'myReports' && !item.found && (
        <Button
          title="Mark as Found"
          onPress={() => handleMarkFound(item.id.toString())}
          style={styles.foundButton}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="My Matches" useGradient={false} />

      {/* PHONE SEARCH */}
      <View style={styles.searchContainer}>
        <Input
          label="Your Phone Number"
          placeholder="e.g. 4083938414"
          value={phoneSearch}
          onChangeText={setPhoneSearch}
          keyboardType="phone-pad"
          editable={!searching}
        />
        <Button
          title={searching ? 'Searching…' : 'Search Reports'}
          onPress={handleSearch}
          disabled={searching}
          style={styles.searchButton}
        />
      </View>

      {/* TABS */}
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
                <Text style={styles.badgeText}>
                  {potentialMatches.length}
                </Text>
              </View>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'myReports' ? myReports : potentialMatches}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  searchContainer: {
    paddingHorizontal: SIZES.spacingLarge,
    paddingTop: SIZES.spacing,
    backgroundColor: COLORS.white,
  },
  searchButton: {
    marginTop: SIZES.spacingSmall,
    ...Platform.select({ ios: { alignSelf: 'flex-end' } }),
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
  foundButton: {
    marginTop: SIZES.spacingSmall,
    marginHorizontal: SIZES.spacingLarge,
    backgroundColor: COLORS.success,
  },
  tickContainer: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    backgroundColor: COLORS.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 16,
  },
});
