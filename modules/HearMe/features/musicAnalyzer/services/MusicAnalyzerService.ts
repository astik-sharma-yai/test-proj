import { MusicAnalysis, NotationType } from '../types';
import { getSpotifyAnalysis } from '../utils/spotifyUtils';
import { analyzeKey, getScale, detectModalChanges } from '../utils/musicTheoryUtils';
import { FirebaseMusicAnalyzer } from '../utils/firebaseUtils';
import { NotationGenerator } from '../utils/notationUtils';

const globalConsole = globalThis.console;

declare global {
  interface Window {
    process: {
      env: {
        SPOTIFY_API_KEY: string;
        SPOTIFY_CLIENT_ID: string;
        SPOTIFY_CLIENT_SECRET: string;
      };
    };
  }
}

export class MusicAnalyzerService {
  private static instance: MusicAnalyzerService;
  private spotifyApiKey: string;
  private firebaseAnalyzer: FirebaseMusicAnalyzer;
  private notationGenerator: NotationGenerator;

  private constructor() {
    this.spotifyApiKey = globalThis.process?.env?.SPOTIFY_API_KEY || '';
    this.firebaseAnalyzer = new FirebaseMusicAnalyzer();
    this.notationGenerator = new NotationGenerator();
  }

  public static getInstance(): MusicAnalyzerService {
    if (!MusicAnalyzerService.instance) {
      MusicAnalyzerService.instance = new MusicAnalyzerService();
    }
    return MusicAnalyzerService.instance;
  }

  public setSpotifyApiKey(key: string): void {
    this.spotifyApiKey = key;
  }

  public async analyzeMusic(audioData: string): Promise<MusicAnalysis> {
    try {
      const spotifyAnalysis = await getSpotifyAnalysis(audioData, this.spotifyApiKey);
      const keyAnalysis = await analyzeKey(audioData);
      const scale = await getScale(audioData);
      const modalChanges = await detectModalChanges(audioData);

      return {
        ...spotifyAnalysis,
        musicTheory: {
          key: keyAnalysis.key,
          mode: keyAnalysis.mode,
          scale,
        },
        modalChanges,
      };
    } catch (error) {
      globalConsole.error('Music analysis error:', error);
      throw new Error('Failed to analyze music');
    }
  }

  public async generateNotation(analysis: MusicAnalysis, type: NotationType): Promise<string> {
    try {
      return this.notationGenerator.generateNotation(analysis, type);
    } catch (error) {
      globalConsole.error('Error generating notation:', error);
      throw new Error('Failed to generate notation');
    }
  }

  public async saveAnalysis(userId: string, analysis: MusicAnalysis): Promise<string> {
    try {
      return await this.firebaseAnalyzer.saveAnalysis(userId, analysis);
    } catch (error) {
      globalConsole.error('Error saving analysis:', error);
      throw new Error('Failed to save analysis');
    }
  }

  public async getUserAnalyses(
    userId: string
  ): Promise<Array<{ id: string; analysis: MusicAnalysis }>> {
    try {
      return await this.firebaseAnalyzer.getUserAnalyses(userId);
    } catch (error) {
      globalConsole.error('Error fetching analyses:', error);
      throw new Error('Failed to fetch analyses');
    }
  }

  public async deleteAnalysis(analysisId: string): Promise<void> {
    try {
      await this.firebaseAnalyzer.deleteAnalysis(analysisId);
    } catch (error) {
      globalConsole.error('Error deleting analysis:', error);
      throw new Error('Failed to delete analysis');
    }
  }

  public async saveNotationToStorage(
    userId: string,
    analysisId: string,
    notationSvg: string
  ): Promise<string> {
    try {
      return await this.firebaseAnalyzer.saveNotationToStorage(userId, analysisId, notationSvg);
    } catch (error) {
      globalConsole.error('Error saving notation:', error);
      throw new Error('Failed to save notation');
    }
  }
}
