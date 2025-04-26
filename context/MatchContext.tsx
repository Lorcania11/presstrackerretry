// context/MatchContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface Team {
  id: string;
  name: string;
  initial: string;
  color: string;
  scores: (number | null)[];
}

export interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
}

export interface Match {
  id: string;
  title: string;
  teams: Team[];
  presses: Press[];
  gameFormats: Array<{ type: string; betAmount: number }>;
  playFormat: 'stroke' | 'match';
  enablePresses: boolean;
  createdAt: string;
  isComplete: boolean;
  front9Scores?: number[];
  back9Scores?: number[];
}

interface MatchContextType {
  teams: Team[];
  currentMatch: Match | null;
  showBack9: boolean;
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setCurrentMatch: React.Dispatch<React.SetStateAction<Match | null>>;
  setShowBack9: React.Dispatch<React.SetStateAction<boolean>>;
  updateScore: (teamId: string, holeIndex: number, score: number | null) => void;
  addPress: (fromTeamId: string, toTeamId: string, holeIndex: number, pressType: string) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [showBack9, setShowBack9] = useState<boolean>(false);

  const updateScore = (teamId: string, holeIndex: number, score: number | null) => {
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.id === teamId) {
          const newScores = [...team.scores];
          newScores[holeIndex] = score;
          return { ...team, scores: newScores };
        }
        return team;
      })
    );
    
    if (currentMatch) {
      setCurrentMatch(prev => {
        if (!prev) return null;
        
        const updatedTeams = prev.teams.map(team => {
          if (team.id === teamId) {
            const newScores = [...team.scores];
            newScores[holeIndex] = score;
            return { ...team, scores: newScores };
          }
          return team;
        });
        
        return { ...prev, teams: updatedTeams };
      });
    }
  };
  
  const addPress = (fromTeamId: string, toTeamId: string, holeIndex: number, pressType: string) => {
    if (currentMatch) {
      const newPress = {
        id: Math.random().toString(36).substring(2, 9),
        fromTeamId,
        toTeamId,
        holeIndex,
        pressType
      };
      
      setCurrentMatch(prev => {
        if (!prev) return null;
        return {
          ...prev,
          presses: [...prev.presses, newPress]
        };
      });
    }
  };

  return (
    <MatchContext.Provider 
      value={{ 
        teams, 
        setTeams, 
        currentMatch, 
        setCurrentMatch, 
        showBack9, 
        setShowBack9,
        updateScore,
        addPress
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatchContext = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatchContext must be used within a MatchProvider');
  }
  return context;
};