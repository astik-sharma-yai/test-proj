export interface MusicAnalysis {
  instruments: Instrument[];
  notes: Note[];
  chords: Chord[];
  musicTheory: MusicTheory;
  modalChanges: ModalChange[];
}

export interface Instrument {
  name: string;
  confidence: number;
  notes: Note[];
}

export interface Note {
  pitch: string;
  octave: number;
  startTime: number;
  duration: number;
  instrument: string;
}

export interface Chord {
  name: string;
  startTime: number;
  duration: number;
  notes: string[];
}

export interface MusicTheory {
  key: string;
  mode: string;
  scale: string[];
}

export interface ModalChange {
  fromMode: string;
  toMode: string;
  timestamp: number;
}

export type NotationType = 'sheet' | 'tab';
