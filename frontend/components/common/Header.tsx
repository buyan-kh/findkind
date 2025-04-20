import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showShareButton?: boolean;
  transparent?: boolean;
  useGradient?: boolean;
  onShare?: () => void;
}

const Header = ({
  title,
  showBackButton = false,
  showShareButton = false,
  transparent = false,
  useGradient = false,
  onShare,
}: HeaderProps) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const renderButton = (icon: React.ReactNode, onPress: () => void) => (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={onPress}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      {icon}
    </TouchableOpacity>
  );

  if (transparent) {
    return (
      <View style={styles.transparentContainer}>
        <View style={styles.row}>
          {showBackButton &&
            renderButton(
              <ArrowLeft color={COLORS.white} size={24} />,
              handleGoBack
            )}
          {showShareButton &&
            renderButton(
              <Share2 color={COLORS.white} size={24} />,
              onShare || (() => {})
            )}
        </View>
      </View>
    );
  }

  if (useGradient) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.left}>
            {showBackButton &&
              renderButton(
                <ArrowLeft color={COLORS.white} size={24} />,
                handleGoBack
              )}
          </View>

          <Text
            style={[styles.title, { color: COLORS.white }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={styles.right}>
            {showShareButton &&
              renderButton(
                <Share2 color={COLORS.white} size={24} />,
                onShare || (() => {})
              )}
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.whiteContainer}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showBackButton &&
            renderButton(
              <ArrowLeft color={COLORS.primary} size={24} />,
              handleGoBack
            )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>
          {showShareButton &&
            renderButton(
              <Share2 color={COLORS.primary} size={24} />,
              onShare || (() => {})
            )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight,
  },
  whiteContainer: {
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparentContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: SIZES.spacing,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    textAlign: 'center',
  },
  iconButton: {
    padding: SIZES.spacingSmall,
    borderRadius: SIZES.borderRadiusSmall,
  },
});

export default Header;
