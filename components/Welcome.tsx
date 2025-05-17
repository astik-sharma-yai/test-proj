import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const Welcome = () => {
  const { user } = useAuth();

  return (
    <View className="flex-1 justify-center items-center bg-secondary">
      <Text className="text-2xl font-bold mb-2.5 text-gray-800">
        Welcome, {user?.username || 'User'}!
      </Text>
      <Text className="text-base text-gray-600">This is where we'll build the actual app.</Text>
    </View>
  );
};
