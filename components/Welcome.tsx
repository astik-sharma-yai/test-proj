import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const Welcome: React.FC = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user?.username || 'User'}!</Text>
      <Text style={styles.subText}>This is where we'll build the actual app.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
});

export default Welcome;
