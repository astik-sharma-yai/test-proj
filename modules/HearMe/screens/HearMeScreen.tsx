import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useAuth } from '../../../context/AuthContext';
import RecordingControls from '../components/RecordingControls';
import RecordingsList from '../components/RecordingsList';
import FileNameDialog from '../components/FileNameDialog';
import {
  requestRecordingPermissions,
  startRecording,
  stopRecording,
  pickAudioFile,
  uploadRecording,
  loadUserRecordings,
  updateRecordingFileName,
  deleteRecording,
} from '../utils/recordingUtils';
import { Recording } from '../types';

const HearMeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [showFileNameDialog, setShowFileNameDialog] = useState(false);
  const [tempRecordingUri, setTempRecordingUri] = useState<string | null>(null);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);

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

      if (uri) {
        setTempRecordingUri(uri);
        setShowFileNameDialog(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleUploadFile = async () => {
    try {
      const result = await pickAudioFile();
      if (result && user) {
        setTempRecordingUri(result.uri);
        setShowFileNameDialog(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handleSaveFileName = async (fileName: string) => {
    if (!user || !tempRecordingUri) return;

    try {
      setIsUploading(true);
      const success = await uploadRecording(tempRecordingUri, fileName, user.uid);
      if (success) {
        await loadRecordings();
        Alert.alert('Success', 'Recording saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save recording');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording');
    } finally {
      setIsUploading(false);
      setShowFileNameDialog(false);
      setTempRecordingUri(null);
    }
  };

  const handleEditRecording = async (recording: Recording) => {
    setEditingRecording(recording);
    setShowFileNameDialog(true);
  };

  const handleUpdateFileName = async (newFileName: string) => {
    if (!editingRecording) return;

    try {
      setIsUploading(true);
      const success = await updateRecordingFileName(editingRecording.id, newFileName);
      if (success) {
        await loadRecordings();
        Alert.alert('Success', 'Recording updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update recording');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update recording');
    } finally {
      setIsUploading(false);
      setShowFileNameDialog(false);
      setEditingRecording(null);
    }
  };

  const handleDeleteRecording = async (recording: Recording) => {
    Alert.alert('Delete Recording', 'Are you sure you want to delete this recording?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsUploading(true);
            const success = await deleteRecording(recording);
            if (success) {
              await loadRecordings();
              Alert.alert('Success', 'Recording deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete recording');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete recording');
          } finally {
            setIsUploading(false);
          }
        },
      },
    ]);
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

        <RecordingsList
          recordings={recordings}
          onEditRecording={handleEditRecording}
          onDeleteRecording={handleDeleteRecording}
        />

        <FileNameDialog
          visible={showFileNameDialog}
          initialFileName={editingRecording?.fileName}
          onSave={editingRecording ? handleUpdateFileName : handleSaveFileName}
          onCancel={() => {
            setShowFileNameDialog(false);
            setTempRecordingUri(null);
            setEditingRecording(null);
          }}
        />
      </View>
    </View>
  );
};

export default HearMeScreen;
