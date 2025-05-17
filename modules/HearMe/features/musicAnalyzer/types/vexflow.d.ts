declare class Vex {
  static Factory: {
    Renderer: new (
      width: number,
      height: number
    ) => {
      getContext: () => Vex.Context;
      getSVG: () => string;
    };
  };
  static Flow: {
    Stave: new (x: number, y: number, width: number) => Vex.Stave;
    TabStave: new (x: number, y: number, width: number) => Vex.Stave;
    StaveNote: new (options: { keys: string[]; duration: string }) => Vex.StaveNote;
    TabNote: new (options: {
      positions: Array<{ str: number; fret: number }>;
      duration: string;
    }) => Vex.StaveNote;
    Voice: new (options: { num_beats: number; beat_value: number }) => Vex.Voice;
    Formatter: new () => Vex.Formatter;
    Beam: {
      generateBeams: (notes: Vex.StaveNote[]) => Vex.Beam[];
    };
  };
  static Context: {
    new (): {
      fillRect: (x: number, y: number, width: number, height: number) => void;
      fillText: (text: string, x: number, y: number) => void;
      stroke: () => void;
      beginPath: () => void;
      moveTo: (x: number, y: number) => void;
      lineTo: (x: number, y: number) => void;
      closePath: () => void;
    };
  };
  static Stave: {
    new (
      x: number,
      y: number,
      width: number
    ): {
      setContext: (context: Vex.Context) => Vex.Stave;
      draw: () => void;
      addClef: (clef: string) => void;
      addTimeSignature: (timeSignature: string) => void;
    };
  };
  static StaveNote: {
    new (options: { keys: string[]; duration: string }): {
      setContext: (context: Vex.Context) => Vex.StaveNote;
      draw: () => void;
    };
  };
  static Voice: {
    new (options: { num_beats: number; beat_value: number }): {
      addTickables: (notes: Vex.StaveNote[]) => void;
      draw: (context: Vex.Context, stave: Vex.Stave) => void;
    };
  };
  static Formatter: {
    new (): {
      joinVoices: (voices: Vex.Voice[]) => Vex.Formatter;
      format: (voices: Vex.Voice[], width: number) => void;
    };
  };
  static Beam: {
    new (notes: Vex.StaveNote[]): {
      setContext: (context: Vex.Context) => Vex.Beam;
      draw: () => void;
    };
    generateBeams: (notes: Vex.StaveNote[]) => Vex.Beam[];
  };
}

declare module 'vexflow' {
  export interface Context {
    render(): void;
  }
}
