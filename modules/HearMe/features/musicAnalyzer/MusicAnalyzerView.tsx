import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { MusicAnalyzerService } from './services/MusicAnalyzerService';
import { MusicAnalysis } from './types';
import { useAuth } from '../../../../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const COLORS = {
  background: '#f5f5f5',
  white: '#ffffff',
} as const;

export const MusicAnalyzerView: React.FC = () => {
  const [audioData, setAudioData] = useState<string>('');
  const [analysis, setAnalysis] = useState<MusicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const analyzer = MusicAnalyzerService.getInstance();

  const handleAnalyze = useCallback(async () => {
    if (!audioData) {
      Alert.alert('Error', 'Please provide audio data first');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzer.analyzeMusic(audioData);
      setAnalysis(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze music');
    } finally {
      setLoading(false);
    }
  }, [audioData]);

  const handleSaveAnalysis = useCallback(async () => {
    if (!analysis || !user) {
      Alert.alert('Error', 'No analysis to save or user not logged in');
      return;
    }

    setSaving(true);
    try {
      await analyzer.saveAnalysis(user.uid, analysis);
      Alert.alert('Success', 'Analysis saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save analysis');
    } finally {
      setSaving(false);
    }
  }, [analysis, user]);

  const handleExportPDF = useCallback(async () => {
    if (!analysis) {
      Alert.alert('Error', 'No analysis to export');
      return;
    }

    setExporting(true);
    try {
      const notationSvg = await analyzer.generateNotation(analysis, 'sheet');
      if (user) {
        const downloadUrl = await analyzer.saveNotationToStorage(user.uid, 'latest', notationSvg);
        if (Platform.OS === 'web') {
          // For web, create a download link
          const link = globalThis.document.createElement('a');
          link.href = downloadUrl;
          link.download = 'music-analysis.svg';
          globalThis.document.body.appendChild(link);
          link.click();
          globalThis.document.body.removeChild(link);
        } else {
          // For mobile, download and share
          const fileUri = FileSystem.documentDirectory + 'music-analysis.svg';
          await FileSystem.writeAsStringAsync(fileUri, notationSvg);
          await Sharing.shareAsync(fileUri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export analysis');
    } finally {
      setExporting(false);
    }
  }, [analysis, user]);

  const handleSendEmail = useCallback(async () => {
    if (!analysis || !email) {
      Alert.alert('Error', 'No analysis to send or email not provided');
      return;
    }

    setExporting(true);
    try {
      const notationSvg = await analyzer.generateNotation(analysis, 'sheet');
      if (user) {
        await analyzer.saveNotationToStorage(user.uid, 'latest', notationSvg);
        // Here you would typically call your email service
        Alert.alert('Success', 'Analysis sent to email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send analysis');
    } finally {
      setExporting(false);
    }
  }, [analysis, email, user]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Music Analyzer</Text>
        <TextInput
          label="Audio Data (Base64)"
          value={audioData}
          onChangeText={setAudioData}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleAnalyze}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Analyze Music
        </Button>

        {analysis && (
          <View style={styles.results}>
            <Text style={styles.subtitle}>Analysis Results</Text>
            <Text style={styles.sectionTitle}>Instruments</Text>
            {analysis.instruments.map((instrument, index) => (
              <Text key={index}>
                {instrument.name} ({instrument.confidence.toFixed(2)})
              </Text>
            ))}

            <Text style={styles.sectionTitle}>Notes</Text>
            {analysis.notes.map((note, index) => (
              <Text key={index}>
                {note.pitch} ({note.duration}s)
              </Text>
            ))}

            <Text style={styles.sectionTitle}>Chords</Text>
            {analysis.chords.map((chord, index) => (
              <Text key={index}>
                {chord.name} ({chord.duration}s)
              </Text>
            ))}

            <Text style={styles.sectionTitle}>Music Theory</Text>
            <Text>Key: {analysis.musicTheory.key}</Text>
            <Text>Mode: {analysis.musicTheory.mode}</Text>
            <Text>Scale: {analysis.musicTheory.scale.join(', ')}</Text>

            <Text style={styles.sectionTitle}>Modal Changes</Text>
            {analysis.modalChanges.map((change, index) => (
              <Text key={index}>
                {change.fromMode} → {change.toMode} at {change.timestamp}s
              </Text>
            ))}

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleSaveAnalysis}
                loading={saving}
                disabled={saving}
                style={styles.actionButton}
              >
                Save Analysis
              </Button>

              <Button
                mode="contained"
                onPress={handleExportPDF}
                loading={exporting}
                disabled={exporting}
                style={styles.actionButton}
              >
                Export as PDF
              </Button>

              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.emailInput}
              />

              <Button
                mode="contained"
                onPress={handleSendEmail}
                loading={exporting}
                disabled={exporting || !email}
                style={styles.actionButton}
              >
                Send to Email
              </Button>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  results: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  actions: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 8,
  },
  emailInput: {
    marginBottom: 8,
  },
});
