declare module 'music21j' {
  export namespace stream {
    export class Stream {
      fromAudioBuffer(buffer: AudioBuffer): Promise<void>;
      analyze(type: string): { tonic: { name: string }; mode: string };
      getScale(): { pitches: Array<{ name: string }> };
      getElementsByClass(className: string): StreamIterator<Music21Object>;
    }

    export class StreamIterator<T> {
      length: number;
      get(index: number): T;
    }
  }

  export class Music21Object {
    analyze(type: string): { tonic: { name: string }; mode: string };
    offset: number;
  }
}
