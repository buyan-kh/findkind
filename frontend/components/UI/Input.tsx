import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle 
} from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = ({
  label,
  error,
  helper,
  containerStyle,
  icon,
  iconPosition = 'left',
  style,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus && props.onFocus(null as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur && props.onBlur(null as any);
  };

  const borderColor = error 
    ? COLORS.error 
    : isFocused 
      ? COLORS.primary 
      : COLORS.lightGray;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        { borderColor },
        icon && iconPosition === 'left' && styles.inputWithLeftIcon,
        icon && iconPosition === 'right' && styles.inputWithRightIcon,
      ]}>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        
        <TextInput
          style={[
            styles.input,
            style,
          ]}
          placeholderTextColor={COLORS.gray}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
      {!error && helper && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spacingLarge,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.spacingSmall,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.black,
    padding: SIZES.spacingLarge,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  iconLeft: {
    paddingLeft: SIZES.spacing,
  },
  iconRight: {
    paddingRight: SIZES.spacing,
  },
  error: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: SIZES.spacingSmall,
  },
  helper: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.spacingSmall,
  },
});

export default Input;