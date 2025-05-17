import * as music21 from 'music21j';
import { MusicTheory, ModalChange } from '../types';

const globalConsole = globalThis.console;

interface Music21Stream {
  fromAudioBuffer(buffer: AudioBuffer): Promise<void>;
  analyze(type: string): { tonic: { name: string }; mode: string };
  getScale(): { pitches: Array<{ name: string }> };
  getElementsByClass(type: string): {
    length: number;
    get(index: number): Music21Stream | null;
  };
  offset: number;
}

async function base64ToAudioBuffer(base64Audio: string): Promise<AudioBuffer> {
  // Remove the data URL prefix if present
  const base64Data = base64Audio.replace(/^data:audio\/\w+;base64,/, '');

  // Convert base64 to ArrayBuffer
  const binaryString = globalThis.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create AudioContext and decode the audio data
  const audioContext = new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
  return await audioContext.decodeAudioData(bytes.buffer);
}

export const analyzeKey = async (audioData: string): Promise<{ key: string; mode: string }> => {
  try {
    const audioBuffer = await base64ToAudioBuffer(audioData);
    const stream = new music21.stream.Stream() as unknown as Music21Stream;
    await stream.fromAudioBuffer(audioBuffer);
    const keyAnalysis = stream.analyze('key');
    return {
      key: keyAnalysis.tonic.name,
      mode: keyAnalysis.mode,
    };
  } catch (error) {
    globalConsole.error('Error analyzing key:', error);
    throw new Error('Failed to analyze key');
  }
};

export const getScale = async (audioData: string): Promise<string[]> => {
  try {
    const audioBuffer = await base64ToAudioBuffer(audioData);
    const stream = new music21.stream.Stream() as unknown as Music21Stream;
    await stream.fromAudioBuffer(audioBuffer);
    return stream.getScale().pitches.map((pitch: { name: string }) => pitch.name);
  } catch (error) {
    globalConsole.error('Error getting scale:', error);
    throw new Error('Failed to get scale');
  }
};

export const detectModalChanges = async (audioData: string): Promise<ModalChange[]> => {
  try {
    const audioBuffer = await base64ToAudioBuffer(audioData);
    const stream = new music21.stream.Stream() as unknown as Music21Stream;
    await stream.fromAudioBuffer(audioBuffer);
    const segments = stream.getElementsByClass('Measure');
    const modalChanges: ModalChange[] = [];

    for (let i = 1; i < segments.length; i++) {
      const prevSegment = segments.get(i - 1);
      const currentSegment = segments.get(i);

      if (prevSegment && currentSegment) {
        const prevKey = prevSegment.analyze('key');
        const currentKey = currentSegment.analyze('key');

        if (prevKey.mode !== currentKey.mode) {
          modalChanges.push({
            fromMode: prevKey.mode,
            toMode: currentKey.mode,
            timestamp: currentSegment.offset,
          });
        }
      }
    }

    return modalChanges;
  } catch (error) {
    globalConsole.error('Error detecting modal changes:', error);
    throw new Error('Failed to detect modal changes');
  }
};

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
    atob: (str: string) => string;
  }
}

export class MusicTheoryAnalyzer {
  public async analyzeMusicTheory(audioData: string): Promise<MusicTheory> {
    try {
      // Convert base64 audio to a format Music21 can process
      const audioBuffer = await base64ToAudioBuffer(audioData);

      // Create a Music21 stream from the audio
      const stream = new music21.stream.Stream() as unknown as Music21Stream;
      await stream.fromAudioBuffer(audioBuffer);

      // Analyze key and mode
      const keyAnalysis = stream.analyze('key');
      const key = keyAnalysis.tonic.name;
      const mode = keyAnalysis.mode;

      // Get scale
      const scale = stream.getScale().pitches.map((pitch: { name: string }) => pitch.name);

      return {
        key,
        mode,
        scale,
      };
    } catch (error) {
      globalConsole.error('Music21 analysis error:', error);
      throw new Error('Failed to analyze music theory');
    }
  }

  public analyzeModalChanges(stream: Music21Stream): ModalChange[] {
    const modalChanges: ModalChange[] = [];
    const segments = stream.getElementsByClass('Measure');

    for (let i = 1; i < segments.length; i++) {
      const prevSegment = segments.get(i - 1);
      const currentSegment = segments.get(i);

      if (prevSegment && currentSegment) {
        const prevKey = prevSegment.analyze('key');
        const currentKey = currentSegment.analyze('key');

        if (prevKey.mode !== currentKey.mode) {
          modalChanges.push({
            fromMode: prevKey.mode,
            toMode: currentKey.mode,
            timestamp: currentSegment.offset,
          });
        }
      }
    }

    return modalChanges;
  }
}
