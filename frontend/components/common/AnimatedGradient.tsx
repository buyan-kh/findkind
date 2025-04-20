import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '@/constants/theme';

// Beautiful green colors matching the reference image
const COLORS = [
  '#0e5c45', // Dark Green
  '#10785a', // Deep Green
  '#0a4331', // Very Dark Green
  '#16946b', // Medium Green
  '#22a27b', // Light Green
  '#2ca382', // Lighter Green
  '#064330', // Forest Green
  '#34b996', // Bright Green
  '#1d7c65', // Medium Forest Green
];

const AnimatedGradient = () => {
  // Create reference positions for static blobs
  const positions = [
    { x: 120, y: 140 },
    { x: 260, y: 90 },
    { x: 60, y: 320 },
    { x: 240, y: 380 },
    { x: 180, y: 220 },
  ];

  return (
    <View style={styles.container}>
      {/* Base gradient layer for the background - match the reference precisely */}
      <LinearGradient
        colors={['#0e5c45', '#138561', '#1aa97a', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.3, 0.55, 0.85]}
        style={styles.baseGradient}
      />

      {/* Static blobs that don't blink */}
      <View
        style={[
          styles.gradientBlob,
          {
            left: positions[0].x,
            top: positions[0].y,
            backgroundColor: COLORS[0],
          },
        ]}
      />
      <View
        style={[
          styles.gradientBlob,
          {
            left: positions[1].x,
            top: positions[1].y,
            backgroundColor: COLORS[3],
            width: 320,
            height: 320,
            marginLeft: -160,
            marginTop: -160,
          },
        ]}
      />
      <View
        style={[
          styles.gradientBlob,
          {
            left: positions[2].x,
            top: positions[2].y,
            backgroundColor: COLORS[5],
            width: 280,
            height: 280,
            marginLeft: -140,
            marginTop: -140,
          },
        ]}
      />
      <View
        style={[
          styles.gradientBlob,
          {
            left: positions[3].x,
            top: positions[3].y,
            backgroundColor: COLORS[1],
            width: 300,
            height: 300,
            marginLeft: -150,
            marginTop: -150,
          },
        ]}
      />
      <View
        style={[
          styles.gradientBlob,
          {
            left: positions[4].x,
            top: positions[4].y,
            backgroundColor: COLORS[2],
            width: 250,
            height: 250,
            marginLeft: -125,
            marginTop: -125,
          },
        ]}
      />

      {/* White gradient overlay to create smooth blur effect from 50% to 100% white */}
      <LinearGradient
        colors={['rgba(48, 153, 122, 0.7)', 'rgba(255,255,255,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.blurOverlay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0e5c45',
    zIndex: -1,
    overflow: 'hidden',
  },
  baseGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  gradientBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
});

export default AnimatedGradient;
