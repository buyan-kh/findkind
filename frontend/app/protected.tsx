import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProtectedScreen() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('../login'); // Updated to point to the correct route
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is a protected screen.</Text>
      <Text style={styles.text}>Welcome, {user.username}!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginVertical: 8,
  },
});