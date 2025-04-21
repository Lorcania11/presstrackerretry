// MatchContext.tsx
import React, { createContext, useContext, useState } from 'react';

type PressType = 'f9' | 'b9' | 't';

interface Press {
  fromTeamId: number;
  toTeamId: number;
  holeIndex: number;
  pressType: PressType;
}

interface Team {
  id: number;
  name: string;
  scores: (number | null)[];
}

interface MatchState {
  teams: Team[];
  presses: Press[];
}

const defaultMatch: MatchState = {
  teams: [
    { id: 1, name: '', scores: Array(18).fill(null) },
    { id: 2, name: '', scores: Array(18).fill(null) },
    { id: 3, name: '', scores: Array(18).fill(null) }
  ],
  presses: []
};

export const MatchContext = createContext<{
  match: MatchState;
  setMatch: React.Dispatch<React.SetStateAction<MatchState>>;
}>({
  match: defaultMatch,
  setMatch: () => {}
});

export const MatchProvider = ({ children }: { children: React.ReactNode }) => {
  const [match, setMatch] = useState<MatchState>(defaultMatch);

  return (
    <MatchContext.Provider value={{ match, setMatch }}>
      {children}
    </MatchContext.Provider>
  );
};

export default MatchContext;
