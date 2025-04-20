import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import Button from '@/components/UI/Button';

interface LocationPickerProps {
  onLocationSelected: (location: { latitude: number; longitude: number }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const LocationPicker = ({ 
  onLocationSelected, 
  initialLocation 
}: LocationPickerProps) => {
  const [location, setLocation] = useState<Region | null>(
    initialLocation 
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } 
      : null
  );
  const [markerLocation, setMarkerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarkerLocation(initialLocation);
    }
  }, [initialLocation]);

  const getUserLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Location permission is required to use this feature'
        );
        setLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setLocation(newRegion);
      setMarkerLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      
      onLocationSelected({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setMarkerLocation(coordinate);
    onLocationSelected(coordinate);
  };

  if (Platform.OS === 'web' && !mapSupported()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Last Seen Location</Text>
        <View style={styles.unsupportedContainer}>
          <Text style={styles.unsupportedText}>
            Maps are not fully supported in this browser. Please enter an address manually.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last Seen Location</Text>
      <Text style={styles.subtitle}>
        Tap on the map to mark the location or use your current location
      </Text>

      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={location}
            region={location}
            onPress={handleMapPress}
          >
            {markerLocation && (
              <Marker
                coordinate={markerLocation}
                title="Last Seen Here"
                description="This is where they were last seen"
              />
            )}
          </MapView>
        ) : (
          <View style={styles.placeholderContainer}>
            <MapPin color={COLORS.primary} size={SIZES.xxlarge} />
            <Text style={styles.placeholderText}>Select a location</Text>
          </View>
        )}
      </View>

      <Button
        title={loading ? "Getting location..." : "Use My Current Location"}
        onPress={getUserLocation}
        style={styles.button}
        disabled={loading}
        loading={loading}
        icon={<MapPin color={COLORS.white} size={SIZES.medium} />}
      />

      {markerLocation && (
        <Text style={styles.locationText}>
          Selected: {markerLocation.latitude.toFixed(6)}, {markerLocation.longitude.toFixed(6)}
        </Text>
      )}
    </View>
  );
};

// Helper function to check if maps are supported in the web browser
const mapSupported = () => {
  try {
    // This is a basic check, might need to be improved
    return typeof window !== 'undefined' && 
           typeof window.navigator !== 'undefined' && 
           typeof window.navigator.geolocation !== 'undefined';
  } catch (e) {
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.spacingLarge,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.black,
    marginBottom: SIZES.spacingSmall,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.spacingLarge,
  },
  mapContainer: {
    height: 250,
    borderRadius: SIZES.borderRadiusLarge,
    overflow: 'hidden',
    marginBottom: SIZES.spacingLarge,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  button: {
    marginBottom: SIZES.spacing,
  },
  locationText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
  },
  placeholderText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.spacing,
  },
  unsupportedContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: SIZES.borderRadiusLarge,
    padding: SIZES.spacingLarge,
  },
  unsupportedText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default LocationPicker;