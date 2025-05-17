import React from 'react';
import { View, Text } from 'react-native';
import { RecordingsListProps } from '../types';

const RecordingsList: React.FC<RecordingsListProps> = ({ recordings }) => {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Your Recordings</Text>
      {recordings.length === 0 ? (
        <Text className="text-gray-500 text-center">No recordings yet</Text>
      ) : (
        recordings.map(recording => (
          <View key={recording.id} className="border-b border-gray-200 py-3">
            <Text className="text-gray-800 font-medium">{recording.fileName}</Text>
            <Text className="text-gray-500 text-sm">
              {new Date(recording.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

export default RecordingsList;
