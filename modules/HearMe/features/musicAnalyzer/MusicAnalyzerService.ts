import {
  MusicAnalysis,
  NotationType,
  Instrument,
  Note,
  Chord,
  MusicTheory,
  ModalChange,
} from './types';
import SpotifyWebApi from 'spotify-web-api-node';
import * as music21 from 'music21j';
import { Vex } from 'vexflow';

interface SpotifySegment {
  start: number;
  duration: number;
  pitches: number[];
  confidence: number;
  chord?: string;
}

// Use the global fetch and atob functions
const globalFetch = (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init);
const globalAtob = (encodedString: string) => globalThis.atob(encodedString);
const globalConsole = globalThis.console;

// Type assertion for AudioContext
const getAudioContext = () => {
  const AudioContext = globalThis.AudioContext || (globalThis as any).webkitAudioContext;
  return new AudioContext();
};

export class MusicAnalyzerService {
  private static instance: MusicAnalyzerService;
  private spotifyApi: SpotifyWebApi | null = null;

  private constructor() {}

  public static getInstance(): MusicAnalyzerService {
    if (!MusicAnalyzerService.instance) {
      MusicAnalyzerService.instance = new MusicAnalyzerService();
    }
    return MusicAnalyzerService.instance;
  }

  public setSpotifyApiKey(clientId: string, clientSecret: string) {
    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
    });
  }

  public async analyzeAudio(audioFile: File): Promise<MusicAnalysis> {
    if (!this.spotifyApi) {
      throw new Error('Spotify API not configured');
    }

    const audioData = await this.fileToBase64(audioFile);
    const spotifyAnalysis = await this.getSpotifyAnalysis(audioData);
    const theoryAnalysis = await this.analyzeMusicTheory(audioData);

    return {
      instruments: spotifyAnalysis.instruments,
      notes: spotifyAnalysis.notes,
      chords: spotifyAnalysis.chords,
      musicTheory: theoryAnalysis,
      modalChanges: theoryAnalysis.modalChanges || [],
    };
  }

  private async getSpotifyAnalysis(audioData: string): Promise<{
    instruments: Instrument[];
    notes: Note[];
    chords: Chord[];
  }> {
    if (!this.spotifyApi) {
      throw new Error('Spotify API not configured');
    }

    try {
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body['access_token']);

      const uploadResponse = await globalFetch('https://api.spotify.com/v1/audio-analysis', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.body['access_token']}`,
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
          name: this.detectInstrument(segment.pitches),
          confidence: segment.confidence,
          notes: this.extractNotes(segment),
        }));

      const notes: Note[] = analysis.segments.flatMap((segment: SpotifySegment) =>
        this.extractNotes(segment)
      );

      const chords: Chord[] = analysis.segments
        .filter((segment: SpotifySegment) => segment.chord)
        .map((segment: SpotifySegment) => ({
          name: segment.chord!,
          startTime: segment.start,
          duration: segment.duration,
          notes: this.chordToNotes(segment.chord!),
        }));

      return { instruments, notes, chords };
    } catch (error) {
      globalConsole.error('Spotify analysis error:', error);
      throw new Error('Failed to analyze audio with Spotify');
    }
  }

  private detectInstrument(pitches: number[]): string {
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
  }

  private extractNotes(segment: SpotifySegment): Note[] {
    return segment.pitches
      .map((pitch: number, index: number) => ({
        pitch: this.pitchIndexToNote(index),
        octave: Math.floor(index / 12) + 4,
        startTime: segment.start,
        duration: segment.duration,
        instrument: this.detectInstrument(segment.pitches),
      }))
      .filter((note: Note) => note.pitch !== '');
  }

  private pitchIndexToNote(index: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[index % 12];
  }

  private chordToNotes(chord: string): string[] {
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
  }

  private async analyzeMusicTheory(
    audioData: string
  ): Promise<MusicTheory & { modalChanges: ModalChange[] }> {
    try {
      const audioBuffer = await this.base64ToAudioBuffer(audioData);
      const stream = new music21.stream.Stream();
      await stream.fromAudioBuffer(audioBuffer);

      const keyAnalysis = stream.analyze('key');
      const key = keyAnalysis.tonic.name;
      const mode = keyAnalysis.mode;

      const scale = stream.getScale().pitches.map((pitch: { name: string }) => pitch.name);

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

      return {
        key,
        mode,
        scale,
        modalChanges,
      };
    } catch (error) {
      globalConsole.error('Music21 analysis error:', error);
      throw new Error('Failed to analyze music theory');
    }
  }

  private async base64ToAudioBuffer(base64Audio: string): Promise<AudioBuffer> {
    const base64Data = base64Audio.replace(/^data:audio\/\w+;base64,/, '');
    const binaryString = globalAtob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioContext = getAudioContext();
    return await audioContext.decodeAudioData(bytes.buffer);
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  public generateNotation(analysis: MusicAnalysis, type: NotationType) {
    if (type === 'sheet') {
      return this.generateSheetMusic(analysis);
    } else {
      return this.generateTab(analysis);
    }
  }

  private generateSheetMusic(analysis: MusicAnalysis): string {
    try {
      const factory = new Vex.Factory.Renderer(600, 200);
      const context = factory.getContext();
      const stave = new Vex.Flow.Stave(10, 0, 580);

      stave.addClef('treble');
      stave.addTimeSignature('4/4');

      const notes = analysis.notes.map(note => {
        const staveNote = new Vex.Flow.StaveNote({
          keys: [`${note.pitch}/${note.octave}`],
          duration: this.getDuration(note.duration),
        });
        return staveNote;
      });

      const voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
      });
      voice.addTickables(notes);

      const formatter = new Vex.Flow.Formatter();
      formatter.joinVoices([voice]).format([voice], 580);

      stave.setContext(context).draw();
      voice.draw(context, stave);

      return factory.getSVG();
    } catch (error) {
      // eslint-disable-next-line no-console
      globalConsole.error('Sheet music generation error:', error);
      throw new Error('Failed to generate sheet music');
    }
  }

  private generateTab(analysis: MusicAnalysis): string {
    try {
      const factory = new Vex.Factory.Renderer(600, 200);
      const context = factory.getContext();
      const stave = new Vex.Flow.TabStave(10, 0, 580);

      stave.addTimeSignature('4/4');

      const notes = analysis.notes.map(note => {
        const tabNote = new Vex.Flow.TabNote({
          positions: [this.getTabPosition(note)],
          duration: this.getDuration(note.duration),
        });
        return tabNote;
      });

      const voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
      });
      voice.addTickables(notes);

      const formatter = new Vex.Flow.Formatter();
      formatter.joinVoices([voice]).format([voice], 580);

      stave.setContext(context).draw();
      voice.draw(context, stave);

      return factory.getSVG();
    } catch (error) {
      // eslint-disable-next-line no-console
      globalConsole.error('Tab generation error:', error);
      throw new Error('Failed to generate tab');
    }
  }

  private getDuration(duration: number): string {
    const durations: Record<number, string> = {
      0.25: '16',
      0.5: '8',
      1: 'q',
      2: 'h',
      4: 'w',
    };
    return durations[duration] || 'q';
  }

  private getTabPosition(note: Note): { str: number; fret: number } {
    const noteToFret: Record<string, number> = {
      E: 0,
      F: 1,
      'F#': 2,
      G: 3,
      'G#': 4,
      A: 5,
      'A#': 6,
      B: 7,
      C: 8,
      'C#': 9,
      D: 10,
      'D#': 11,
    };

    const fret = noteToFret[note.pitch] || 0;
    const string = Math.floor(Math.random() * 6) + 1;

    return { str: string, fret };
  }

  public async saveAnalysis(analysis: MusicAnalysis): Promise<string> {
    // TODO: Implement actual storage logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _analysis = analysis;
    return 'analysis-saved-id';
  }

  public async exportToPDF(analysis: MusicAnalysis, type: NotationType): Promise<Blob> {
    try {
      const svg = this.generateNotation(analysis, type);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Add the SVG to the PDF
      doc.addImage(svg, 'SVG', 10, 10, 190, 0);

      return doc.output('blob');
    } catch (error) {
      // eslint-disable-next-line no-console
      globalConsole.error('PDF export error:', error);
      throw new Error('Failed to export to PDF');
    }
  }

  public async sendToEmail(analysis: MusicAnalysis, email: string): Promise<void> {
    try {
      const pdfBlob = await this.exportToPDF(analysis, 'sheet');
      const formData = new FormData();
      formData.append('email', email);
      formData.append('subject', 'Your Music Analysis');
      formData.append('attachment', pdfBlob, 'music-analysis.pdf');

      const response = await globalThis.fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      globalConsole.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  }
}
