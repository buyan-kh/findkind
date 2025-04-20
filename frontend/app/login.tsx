import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Header from '@/components/common/Header';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      // Redirect to home after login
      router.push('/');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Login" showBackButton={false} useGradient={false} />
      <View style={styles.form}>
        <Input
          label="Username"
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title="Login"
          onPress={handleLogin}
          variant="primary"
          size="large"
          gradient
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.spacingLarge,
  },
  form: {
    marginTop: SIZES.spacingXLarge,
  },
});