export interface Team {
  name: string;
  initial: string;
  color: string;
}

export interface Teams {
  [key: string]: Team;
}

export interface Scores {
  team1: string;
  team2: string;
  team3: string;
}

export interface Press {
  pressingTeam: string;
  targetTeam: string;
  type: string;
}
