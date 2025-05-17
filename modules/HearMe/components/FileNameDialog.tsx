import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { FileNameDialogProps } from '../types';

const FileNameDialog: React.FC<FileNameDialogProps> = ({
  visible,
  initialFileName = '',
  onSave,
  onCancel,
}) => {
  const [fileName, setFileName] = useState(initialFileName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setFileName(initialFileName);
    }
  }, [visible, initialFileName]);

  const handleSave = async () => {
    if (!fileName.trim()) return;

    try {
      setIsSaving(true);
      await onSave(fileName.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-lg p-6 w-4/5 max-w-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            {initialFileName ? 'Edit File Name' : 'Save Recording'}
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
            placeholder="Enter file name"
            value={fileName}
            onChangeText={setFileName}
            autoFocus
          />

          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onCancel}
              className="px-4 py-2 rounded-lg"
              disabled={isSaving}
            >
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-500 px-4 py-2 rounded-lg"
              disabled={isSaving || !fileName.trim()}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FileNameDialog;
