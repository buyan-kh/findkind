import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Cat } from 'lucide-react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';

export type ReportType = 'person' | 'pet';

interface TypeSelectorProps {
  selectedType: ReportType;
  onSelectType: (type: ReportType) => void;
}

const TypeSelector = ({ selectedType, onSelectType }: TypeSelectorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are you reporting?</Text>
      <Text style={styles.subtitle}>
        Select whether you're reporting a person or a pet
      </Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedType === 'person' && styles.selectedOption,
          ]}
          onPress={() => onSelectType('person')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              selectedType === 'person' && styles.selectedIconContainer,
            ]}
          >
            <User
              color={selectedType === 'person' ? COLORS.white : COLORS.primary}
              size={SIZES.xlarge}
            />
          </View>
          <Text
            style={[
              styles.optionText,
              selectedType === 'person' && styles.selectedOptionText,
            ]}
          >
            Person
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            selectedType === 'pet' && styles.selectedOption,
          ]}
          onPress={() => onSelectType('pet')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              selectedType === 'pet' && styles.selectedIconContainer,
            ]}
          >
            <Cat
              color={selectedType === 'pet' ? COLORS.white : COLORS.primary}
              size={SIZES.xlarge}
            />
          </View>
          <Text
            style={[
              styles.optionText,
              selectedType === 'pet' && styles.selectedOptionText,
            ]}
          >
            Pet
          </Text>
        </TouchableOpacity>
      </View>
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
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacingMedium,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.ultraLightGray,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacingMedium,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
});

export default TypeSelector;
