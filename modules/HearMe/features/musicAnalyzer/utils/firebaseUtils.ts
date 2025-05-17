import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { MusicAnalysis } from '../types';
import { db, storage } from '../../../config/firebase';

const globalConsole = globalThis.console;

export class FirebaseMusicAnalyzer {
  private readonly COLLECTION_NAME = 'music_analyses';

  public async saveAnalysis(userId: string, analysis: MusicAnalysis): Promise<string> {
    try {
      // Save analysis data to Firestore
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        userId,
        analysis,
        createdAt: new Date().toISOString(),
      });

      return docRef.id;
    } catch (error) {
      globalConsole.error('Error saving analysis:', error);
      throw new Error('Failed to save analysis');
    }
  }

  public async getUserAnalyses(
    userId: string
  ): Promise<Array<{ id: string; analysis: MusicAnalysis }>> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        analysis: doc.data().analysis as MusicAnalysis,
      }));
    } catch (error) {
      globalConsole.error('Error fetching analyses:', error);
      throw new Error('Failed to fetch analyses');
    }
  }

  public async deleteAnalysis(analysisId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, analysisId));
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
      const storageRef = ref(storage as any, `users/${userId}/notations/${analysisId}.svg`);
      await uploadString(storageRef, notationSvg, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      globalConsole.error('Error saving notation:', error);
      throw new Error('Failed to save notation');
    }
  }

  public async saveAnalysisToFirestore(
    userId: string,
    analysisId: string,
    analysis: MusicAnalysis
  ): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId, 'analyses', analysisId), {
        ...analysis,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      globalConsole.error('Error saving analysis to Firestore:', error);
      throw new Error('Failed to save analysis');
    }
  }

  public async getAnalysisFromFirestore(
    userId: string,
    analysisId: string
  ): Promise<MusicAnalysis> {
    try {
      const docRef = doc(db, 'users', userId, 'analyses', analysisId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Analysis not found');
      }

      return docSnap.data() as MusicAnalysis;
    } catch (error) {
      globalConsole.error('Error getting analysis from Firestore:', error);
      throw new Error('Failed to get analysis');
    }
  }

  public async updateAnalysisInFirestore(
    userId: string,
    analysisId: string,
    updates: Partial<MusicAnalysis>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'analyses', analysisId);
      await updateDoc(docRef, updates);
    } catch (error) {
      globalConsole.error('Error updating analysis in Firestore:', error);
      throw new Error('Failed to update analysis');
    }
  }
}
