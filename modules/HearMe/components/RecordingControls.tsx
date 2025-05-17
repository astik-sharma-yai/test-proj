import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RecordingControlsProps } from '../types';

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isUploading,
  onStartRecording,
  onStopRecording,
  onUploadFile,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Record Audio</Text>
      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity
          onPress={isRecording ? onStopRecording : onStartRecording}
          className={`px-6 py-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
          disabled={isUploading}
        >
          <Text className="text-white font-semibold">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onUploadFile}
          className="px-6 py-3 bg-green-500 rounded-full"
          disabled={isRecording || isUploading}
        >
          <Text className="text-white font-semibold">Upload File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecordingControls;
