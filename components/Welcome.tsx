import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ModuleCard = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    className="bg-white rounded-xl shadow-lg p-6 m-2"
  >
    <Text className="text-xl font-bold text-gray-800">{title}</Text>
  </TouchableOpacity>
);

const Welcome = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const modules = [
    { title: 'Hear Me', route: 'HearMe' },
    { title: 'Read Me', route: 'ReadMe' },
    { title: 'Write Me', route: 'WriteMe' },
    { title: 'Tell Me', route: 'TellMe' },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">
          Welcome, {user?.username || 'User'}!
        </Text>
      </View>

      <View className="flex-1 p-4">
        <Text className="text-lg text-gray-600 mb-6">Choose a module to begin:</Text>
        <View className="flex-row flex-wrap justify-center">
          {modules.map(module => (
            <ModuleCard
              key={module.route}
              title={module.title}
              onPress={() => navigation.navigate(module.route as never)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '45%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Welcome;
