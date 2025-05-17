import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useAuth } from '../../../context/AuthContext';
import RecordingControls from '../components/RecordingControls';
import RecordingsList from '../components/RecordingsList';
import {
  requestRecordingPermissions,
  startRecording,
  stopRecording,
  pickAudioFile,
  uploadRecording,
  loadUserRecordings,
} from '../utils/recordingUtils';
import { Recording } from '../types';

const HearMeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    loadRecordings();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const loadRecordings = async () => {
    if (!user) return;
    const recordingsList = await loadUserRecordings(user.uid);
    setRecordings(recordingsList);
  };

  const handleStartRecording = async () => {
    try {
      const hasPermission = await requestRecordingPermissions();
      if (!hasPermission) {
        Alert.alert('Error', 'Microphone permission is required');
        return;
      }

      const newRecording = await startRecording();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      const uri = await stopRecording(recording);
      setRecording(null);
      setIsRecording(false);

      if (uri && user) {
        setIsUploading(true);
        const success = await uploadRecording(uri, 'recording', user.uid);
        if (success) {
          await loadRecordings();
          Alert.alert('Success', 'Recording uploaded successfully');
        } else {
          Alert.alert('Error', 'Failed to upload recording');
        }
        setIsUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleUploadFile = async () => {
    try {
      const result = await pickAudioFile();
      if (result && user) {
        setIsUploading(true);
        const success = await uploadRecording(result.uri, result.name, user.uid);
        if (success) {
          await loadRecordings();
          Alert.alert('Success', 'File uploaded successfully');
        } else {
          Alert.alert('Error', 'Failed to upload file');
        }
        setIsUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-blue-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Hear Me</Text>
      </View>

      <View className="flex-1 p-4">
        <RecordingControls
          isRecording={isRecording}
          isUploading={isUploading}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onUploadFile={handleUploadFile}
        />

        {isUploading && (
          <View className="items-center justify-center py-4">
            <ActivityIndicator size="large" color="#3b5998" />
            <Text className="text-gray-600 mt-2">Uploading...</Text>
          </View>
        )}

        <RecordingsList recordings={recordings} />
      </View>
    </View>
  );
};

export default HearMeScreen;
