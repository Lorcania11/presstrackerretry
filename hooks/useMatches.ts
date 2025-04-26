import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Match interface based on how it's used in the codebase
interface MatchTeam {
  id: string;
  name: string;
  scores: (number | null)[];
  color?: string;
  initial?: string;
}

interface GameFormat {
  type: string;
  betAmount: number;
}

interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
}

interface Hole {
  number: number;
  scores: Array<{
    teamId: string;
    score: number | null;
  }>;
  presses: any[];
  isComplete: boolean;
}

interface Match {
  id: string;
  title: string;
  teams: MatchTeam[];
  gameFormats: GameFormat[];
  presses: Press[];
  holes: Hole[];
  playFormat: "match" | "stroke";
  enablePresses: boolean;
  createdAt: string;
  isComplete: boolean;
}

const STORAGE_KEY = 'golf_match_tracker_matches';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  
  const loadMatches = async (): Promise<Match[]> => {
    try {
      const storedMatches = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMatches) {
        const parsedMatches = JSON.parse(storedMatches) as Match[];
        setMatches(parsedMatches);
        return parsedMatches;
      }
      setMatches([]); // Ensure state is empty when no matches exist
      return [];
    } catch (error) {
      console.error('Error loading matches:', error);
      setMatches([]); // Reset state on error
      return [];
    }
  };
  
  const saveAllMatches = async (updatedMatches: Match[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMatches));
      setMatches(updatedMatches); // Update state after saving
    } catch (error) {
      console.error('Error saving matches:', error);
    }
  };
  
  const saveMatch = async (match: Match): Promise<Match | null> => {
    try {
      const currentMatches = await loadMatches();
      const existingIndex = currentMatches.findIndex(m => m.id === match.id);
      
      let updatedMatches;
      if (existingIndex !== -1) {
        updatedMatches = [
          ...currentMatches.slice(0, existingIndex),
          match,
          ...currentMatches.slice(existingIndex + 1)
        ];
      } else {
        updatedMatches = [...currentMatches, match];
      }
      
      await saveAllMatches(updatedMatches);
      return match;
    } catch (error) {
      console.error('Error saving match:', error);
      return null;
    }
  };
  
  const getMatch = async (matchId: string): Promise<Match | undefined> => {
    try {
      const currentMatches = await loadMatches();
      return currentMatches.find(match => match.id === matchId);
    } catch (error) {
      console.error('Error getting match:', error);
      return undefined;
    }
  };
  
  const updateMatch = async (updatedMatch: Match): Promise<Match | null> => {
    return saveMatch(updatedMatch);
  };
  
  const deleteMatch = async (matchId: string): Promise<boolean> => {
    try {
      const currentMatches = await loadMatches();
      const updatedMatches = currentMatches.filter(match => match.id !== matchId);
      await saveAllMatches(updatedMatches);
      return true;
    } catch (error) {
      console.error('Error deleting match:', error);
      return false;
    }
  };
  
  const clearAllMatches = async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMatches([]); // Immediately update state to empty array
      return true;
    } catch (error) {
      console.error('Error clearing matches:', error);
      return false;
    }
  };
  
  // Filter matches based on current state
  const activeMatches = matches.filter(match => !match.isComplete);
  const completedMatches = matches.filter(match => match.isComplete);
  
  return {
    matches,
    activeMatches,
    completedMatches,
    loadMatches,
    saveMatch,
    getMatch,
    updateMatch,
    deleteMatch,
    clearAllMatches
  };
};