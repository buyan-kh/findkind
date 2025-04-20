import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import Card from '@/components/UI/Card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  style?: ViewStyle;
}

const FeatureCard = ({ title, description, icon, style }: FeatureCardProps) => {
  const translateY = new Animated.Value(20);
  const opacity = new Animated.Value(0);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <Card style={{ ...styles.card, ...(style as any) }}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacingLarge,
    marginVertical: SIZES.spacingMedium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLarge,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: SIZES.borderRadiusLarge,
    marginRight: SIZES.spacingLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.spacingSmall,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    lineHeight: SIZES.medium * 1.5,
  },
});

export default FeatureCard;
