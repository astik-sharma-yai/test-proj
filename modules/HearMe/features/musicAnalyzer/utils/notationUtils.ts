import { Vex } from 'vexflow';
import { MusicAnalysis, NotationType, Note } from '../types';

const globalConsole = globalThis.console;

export class NotationGenerator {
  public generateNotation(analysis: MusicAnalysis, type: NotationType): string {
    if (type === 'sheet') {
      return this.generateSheetMusic(analysis);
    } else {
      return this.generateTab(analysis);
    }
  }

  private generateSheetMusic(analysis: MusicAnalysis): string {
    try {
      // Create a new VexFlow renderer
      const factory = new Vex.Factory.Renderer(600, 200);
      const context = factory.getContext();
      const stave = new Vex.Flow.Stave(10, 0, 580);

      // Add clef and time signature
      stave.addClef('treble');
      stave.addTimeSignature('4/4');

      // Create notes from the analysis
      const notes = analysis.notes.map(note => {
        const staveNote = new Vex.Flow.StaveNote({
          keys: [`${note.pitch}/${note.octave}`],
          duration: this.getDuration(note.duration),
        });
        return staveNote;
      });

      // Create a voice with the notes
      const voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
      });
      voice.addTickables(notes);

      // Format and draw
      const formatter = new Vex.Flow.Formatter();
      formatter.joinVoices([voice]).format([voice], 580);

      // Draw everything
      stave.setContext(context).draw();
      voice.draw(context, stave);

      // Convert to SVG
      return factory.getSVG();
    } catch (error) {
      globalConsole.error('Sheet music generation error:', error);
      throw new Error('Failed to generate sheet music');
    }
  }

  private generateTab(analysis: MusicAnalysis): string {
    try {
      // Create a new VexFlow renderer
      const factory = new Vex.Factory.Renderer(600, 200);
      const context = factory.getContext();
      const stave = new Vex.Flow.TabStave(10, 0, 580);

      // Add time signature
      stave.addTimeSignature('4/4');

      // Create tab notes from the analysis
      const notes = analysis.notes.map(note => {
        const tabNote = new Vex.Flow.TabNote({
          positions: [this.getTabPosition(note)],
          duration: this.getDuration(note.duration),
        });
        return tabNote;
      });

      // Create a voice with the notes
      const voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
      });
      voice.addTickables(notes);

      // Format and draw
      const formatter = new Vex.Flow.Formatter();
      formatter.joinVoices([voice]).format([voice], 580);

      // Draw everything
      stave.setContext(context).draw();
      voice.draw(context, stave);

      // Convert to SVG
      return factory.getSVG();
    } catch (error) {
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
    const string = Math.floor(Math.random() * 6) + 1; // Simplified string selection

    return { str: string, fret };
  }
}
