import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '@/constants/theme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'small' | 'medium' | 'large';
  touchable?: boolean;
  gradient?: boolean;
  glass?: boolean;
  neumorphic?: boolean;
  onPress?: () => void;
}

const Card = ({
  children,
  style,
  elevation = 'medium',
  touchable = false,
  gradient = false,
  glass = false,
  neumorphic = false,
  onPress,
  ...props
}: CardProps) => {
  const cardStyles = [
    styles.card,
    styles[`${elevation}Card`],
    neumorphic && styles.neumorphicCard,
    glass && styles.glassCard,
    style,
  ];

  const renderContent = () => {
    if (gradient) {
      return (
        <LinearGradient
          colors={GRADIENTS.hope as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      );
    }

    if (glass) {
      return (
        <View style={styles.glassInner}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={20}
              style={StyleSheet.absoluteFill}
              tint="light"
            />
          ) : null}
          <View style={styles.glassContent}>{children}</View>
        </View>
      );
    }

    return children;
  };

  if (touchable) {
    return (
      <TouchableOpacity
        style={cardStyles}
        activeOpacity={0.8}
        onPress={onPress}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLarge,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.cardPadding,
  },
  gradient: {
    flex: 1,
    padding: SIZES.cardPadding,
  },
  smallCard: {
    ...SHADOWS.small,
  },
  mediumCard: {
    ...SHADOWS.medium,
  },
  largeCard: {
    ...SHADOWS.large,
  },
  neumorphicCard: {
    backgroundColor: COLORS.background,
    borderWidth: 0,
    ...SHADOWS.neumorphic,
    shadowColor: COLORS.glassShadow,
    // Add inner shadow
    borderRadius: SIZES.borderRadiusLarge,
    borderColor: COLORS.glassHighlight,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  glassCard: {
    backgroundColor: 'transparent',
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    borderWidth: 1,
    ...SHADOWS.small,
  },
  glassInner: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: SIZES.borderRadiusLarge - 1,
    overflow: 'hidden',
  },
  glassContent: {
    padding: SIZES.cardPadding,
    flex: 1,
  },
});

export default Card;
