// components/ScoreInput/types.ts
export interface Team {
  name: string;
  initial: string;
  color: string;
}

export interface Teams {
  [key: string]: Team;
}

export interface Scores {
  [key: string]: string;
}

export interface Press {
  pressingTeam: string;
  targetTeam: string;
  type: string;
}

export interface MatchTeam {
  id: string;
  name: string;
  scores: (number | null)[];
}

export interface MatchData {
  id: string;
  title: string;
  teams: MatchTeam[];
  presses: Array<{
    id: string;
    fromTeamId: string;
    toTeamId: string;
    holeIndex: number;
    pressType: string;
  }>;
  holes: Array<{
    number: number;
    scores: Array<{
      teamId: string;
      score: number | null;
    }>;
    presses: any[];
    isComplete: boolean;
  }>;
  enablePresses: boolean;
  gameFormats: Array<{
    type: string;
    betAmount: number;
  }>;
}