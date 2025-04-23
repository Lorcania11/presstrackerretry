// context/MatchContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Team {
  id: string;
  name: string;
  scores: Array<number | null>;
}

interface MatchContextType {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  updateScore: (teamId: string, holeIndex: number, score: number | null) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);

  const updateScore = (teamId: string, holeIndex: number, score: number | null) => {
    setTeams(currentTeams => 
      currentTeams.map(team => 
        team.id === teamId 
          ? {
              ...team,
              scores: team.scores.map((s, idx) => 
                idx === holeIndex ? score : s
              )
            }
          : team
      )
    );
  };

  return (
    <MatchContext.Provider value={{ teams, setTeams, updateScore }}>
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