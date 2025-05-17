import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ReadMeScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-blue-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Read Me</Text>
      </View>

      <View className="flex-1 p-4">
        <Text className="text-lg text-gray-600">
          Welcome to the Read Me module. This is where text-related functionality will be
          implemented.
        </Text>
      </View>
    </View>
  );
};

export default ReadMeScreen;
