import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import storage from '@react-native-firebase/storage';
import { db } from '../../../firebaseConfig';
import { Recording } from '../types';

export const requestRecordingPermissions = async (): Promise<boolean> => {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (granted) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const startRecording = async (): Promise<Audio.Recording> => {
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  return recording;
};

export const stopRecording = async (recording: Audio.Recording): Promise<string | null> => {
  await recording.stopAndUnloadAsync();
  return recording.getURI();
};

export const pickAudioFile = async (): Promise<{ uri: string; name: string } | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/mpeg', 'audio/wav'],
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      return {
        uri: result.uri,
        name: result.name,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const uploadRecording = async (
  uri: string,
  fileName: string,
  userId: string
): Promise<boolean> => {
  try {
    const timestamp = new Date().getTime();
    const storageRef = storage().ref(`recordings/${userId}/${timestamp}_${fileName}`);

    await storageRef.putFile(uri);
    const downloadUrl = await storageRef.getDownloadURL();

    await addDoc(collection(db, 'recordings'), {
      userId,
      fileName,
      fileUrl: downloadUrl,
      createdAt: new Date().toISOString(),
      fileType: fileName.includes('.mp3') ? 'mp3' : 'wav',
    });

    return true;
  } catch (error) {
    return false;
  }
};

export const loadUserRecordings = async (userId: string): Promise<Recording[]> => {
  try {
    const q = query(collection(db, 'recordings'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Recording[];
  } catch (error) {
    return [];
  }
};
