import { Instrument, Note, Chord } from '../types';

const globalFetch = (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init);
const globalConsole = globalThis.console;

interface SpotifySegment {
  start: number;
  duration: number;
  pitches: number[];
  confidence: number;
  chord?: string;
}

export const getSpotifyAnalysis = async (
  audioData: string,
  accessToken: string
): Promise<{
  instruments: Instrument[];
  notes: Note[];
  chords: Chord[];
}> => {
  try {
    const uploadResponse = await globalFetch('https://api.spotify.com/v1/audio-analysis', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'audio/wav',
      },
      body: audioData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to analyze audio with Spotify');
    }

    const analysis = await uploadResponse.json();

    const instruments: Instrument[] = analysis.segments
      .filter((segment: SpotifySegment) => segment.pitches.length > 0)
      .map((segment: SpotifySegment) => ({
        name: detectInstrument(segment.pitches),
        confidence: segment.confidence,
        notes: extractNotes(segment),
      }));

    const notes: Note[] = analysis.segments.flatMap((segment: SpotifySegment) =>
      extractNotes(segment)
    );

    const chords: Chord[] = analysis.segments
      .filter((segment: SpotifySegment) => segment.chord)
      .map((segment: SpotifySegment) => ({
        name: segment.chord!,
        startTime: segment.start,
        duration: segment.duration,
        notes: chordToNotes(segment.chord!),
      }));

    return { instruments, notes, chords };
  } catch (error) {
    globalConsole.error('Spotify analysis error:', error);
    throw new Error('Failed to analyze audio with Spotify');
  }
};

const detectInstrument = (pitches: number[]): string => {
  const dominantPitch = pitches.indexOf(Math.max(...pitches));
  const instrumentMap = [
    'Piano',
    'Guitar',
    'Bass',
    'Drums',
    'Violin',
    'Trumpet',
    'Saxophone',
    'Flute',
    'Clarinet',
    'Voice',
  ];
  return instrumentMap[dominantPitch % instrumentMap.length];
};

const extractNotes = (segment: SpotifySegment): Note[] => {
  return segment.pitches
    .map((pitch: number, index: number) => ({
      pitch: pitchIndexToNote(index),
      octave: Math.floor(index / 12) + 4,
      startTime: segment.start,
      duration: segment.duration,
      instrument: detectInstrument(segment.pitches),
    }))
    .filter((note: Note) => note.pitch !== '');
};

const pitchIndexToNote = (index: number): string => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return notes[index % 12];
};

const chordToNotes = (chord: string): string[] => {
  const root = chord.charAt(0);
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = notes.indexOf(root);

  if (chord.includes('maj')) {
    return [notes[rootIndex], notes[(rootIndex + 4) % 12], notes[(rootIndex + 7) % 12]];
  } else if (chord.includes('min')) {
    return [notes[rootIndex], notes[(rootIndex + 3) % 12], notes[(rootIndex + 7) % 12]];
  } else {
    return [notes[rootIndex]];
  }
};
