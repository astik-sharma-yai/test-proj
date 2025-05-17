import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RecordingsListProps } from '../types';

const RecordingsList: React.FC<RecordingsListProps> = ({
  recordings,
  onEditRecording,
  onDeleteRecording,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Your Recordings</Text>
      {recordings.length === 0 ? (
        <Text className="text-gray-500 text-center">No recordings yet</Text>
      ) : (
        recordings.map(recording => (
          <View key={recording.id} className="border-b border-gray-200 py-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">{recording.fileName}</Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(recording.createdAt).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity onPress={() => onEditRecording(recording)} className="p-2">
                  <Text className="text-blue-500">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeleteRecording(recording)} className="p-2">
                  <Text className="text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default RecordingsList;
