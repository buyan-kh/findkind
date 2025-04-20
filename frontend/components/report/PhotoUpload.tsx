import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import Button from '@/components/UI/Button';

interface PhotoUploadProps {
  onImageSelected: (uri: string) => void;
  initialImage?: string;
  isOptional?: boolean;
  title?: string;
}

const PhotoUpload = ({
  onImageSelected,
  initialImage,
  isOptional = false,
  title = 'Add a Photo',
}: PhotoUploadProps) => {
  const [image, setImage] = useState<string | null>(initialImage || null);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera permissions to make this work!',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled) {
          setImage(result.assets[0].uri);
          onImageSelected(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    } else {
      Alert.alert('Not supported', 'Camera is not available on web');
    }
  };

  const removeImage = () => {
    setImage(null);
    onImageSelected('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        Adding a clear photo greatly increases the chance of finding a match
      </Text>

      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <X color={COLORS.white} size={SIZES.large} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <View style={styles.iconContainer}>
            <ImagePlus color={COLORS.primary} size={SIZES.xxlarge} />
          </View>
          <Text style={styles.uploadText}>Upload or take a photo</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Gallery"
              onPress={pickImage}
              variant="outline"
              style={styles.button}
              icon={<ImagePlus color={COLORS.primary} size={SIZES.medium} />}
            />
            <Button
              title="Camera"
              onPress={takePhoto}
              style={styles.button}
              icon={<Camera color={COLORS.white} size={SIZES.medium} />}
            />
          </View>
        </View>
      )}
    </View>
  );
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
  uploadContainer: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: SIZES.borderRadiusLarge,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    padding: SIZES.spacingXLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadiusXLarge,
    marginBottom: SIZES.spacingLarge,
    ...SHADOWS.small,
  },
  uploadText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.darkGray,
    marginBottom: SIZES.spacingLarge,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.spacingLarge,
  },
  button: {
    minWidth: 120,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: SIZES.borderRadiusLarge,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: SIZES.borderRadiusLarge,
  },
  removeButton: {
    position: 'absolute',
    top: SIZES.spacing,
    right: SIZES.spacing,
    backgroundColor: COLORS.error,
    borderRadius: 20,
    padding: SIZES.spacingSmall,
  },
});

export default PhotoUpload;
