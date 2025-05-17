import { Audio } from 'expo-av';

export interface Recording {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  fileType: 'mp3' | 'wav';
}

export interface RecordingState {
  recording: Audio.Recording | null;
  isRecording: boolean;
  isUploading: boolean;
  recordings: Recording[];
}

export interface RecordingControlsProps {
  isRecording: boolean;
  isUploading: boolean;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  onUploadFile: () => Promise<void>;
}

export interface RecordingsListProps {
  recordings: Recording[];
  onEditRecording: (recording: Recording) => Promise<void>;
  onDeleteRecording: (recording: Recording) => Promise<void>;
}

export interface FileNameDialogProps {
  visible: boolean;
  initialFileName?: string;
  onSave: (fileName: string) => Promise<void>;
  onCancel: () => void;
}
