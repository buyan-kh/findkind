// MySightingsScreen.tsx  (replace your old MySearchesScreen)
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
import Header from '@/components/common/Header';
import MatchCard, { MatchItem } from '@/components/search/MatchCard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import axios from 'axios';

const API_BASE = 'https://cd30-128-120-27-122.ngrok-free.app';

export default function MySightingsScreen() {
  // phone + fetch state
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // list of sightings
  const [sightings, setSightings] = useState<(MatchItem & { resolved?: boolean })[]>([]);

  // ── map document → MatchItem
  const mapSearch = (r: any): MatchItem & { resolved?: boolean } => ({
    id:
      typeof r._id === 'object' && r._id !== null && '$oid' in r._id
        ? r._id.$oid
        : String(r._id),
    name: r.name || r.full_name || 'Sighting',
    description: r.description,
    image: r.photo_url || r.image_url,
    lastSeen: r.created,           // ←  ‘created’ field in sighting_reports
    location: r.location           // already formatted on server; if not:
      ? `${r.location.lat.toFixed(4)}, ${r.location.lon.toFixed(4)}`: '',
    matchPercentage: 0,
    contactPhone: r.phone_number,
    resolved: r.resolved || false,
  });

  // ── fetch sightings
  const handleSearch = async () => {
    if (!phone.trim()) return Alert.alert('Validation', 'Enter your phone number.');
    setSearching(true);
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/my-searches`, {
        params: { phone_number: phone.trim() },
      });
      setSightings(res.data.searches.map(mapSearch));
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || err.message || 'Try again.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // ── dial phone (from potential matches list)
  const handleContact = (item: MatchItem) => {
    const url = `tel:${item.contactPhone}`;
    Linking.canOpenURL(url).then(s => (s ? Linking.openURL(url) : Alert.alert('Unable to open dialer')));
  };

  // ── simple detail popup
  const handleCardPress = (item: MatchItem) =>
    Alert.alert(item.name, item.description, [{ text: 'OK' }]);

  // ── key extractor (guaranteed unique)
  const keyExtractor = (item: MatchItem, index: number) => `${item.id}-${index}`;

  // ── progress numbers
  const resolvedCount = sightings.filter(s => s.resolved).length;
  const total = sightings.length;

  return (
    <View style={styles.container}>
      <Header title="Your Sightings" useGradient={false} />

      {/* PHONE ENTRY */}
      <View style={styles.searchBox}>
        <Input
          label="Phone Number"
          placeholder="e.g. 4083938414"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!searching}
        />
        <Button
          title={searching ? 'Fetching…' : 'Fetch Sightings'}
          onPress={handleSearch}
          disabled={searching}
          style={styles.fetchBtn}
        />
      </View>

      {/* LIST */}
      {loading ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={sightings}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No sightings yet. Enter your phone number above.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <MatchCard match={item} expanded={false} onContact={handleContact} hideName={true} highlightImportant={true}/>
              {item.resolved && (
                <View style={styles.tickBox}>
                  <Text style={styles.tick}>✔</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  searchBox: {
    paddingHorizontal: SIZES.spacingLarge,
    paddingTop: SIZES.spacing,
    backgroundColor: COLORS.white,
  },
  fetchBtn: {
    marginTop: SIZES.spacingSmall,
    ...Platform.select({ ios: { alignSelf: 'flex-end' } }),
  },
  progress: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    paddingHorizontal: SIZES.spacingLarge,
    paddingVertical: SIZES.spacingSmall,
  },
  listContent: {
    padding: SIZES.spacing,
    paddingBottom: SIZES.spacingXXLarge,
  },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: FONTS.medium, fontSize: SIZES.large, color: COLORS.gray },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.spacingXLarge,
    textAlign: 'center',
  },
  tickBox: {
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
  tick: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 16, lineHeight: 16 },
});
