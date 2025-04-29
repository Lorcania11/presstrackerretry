// Define interfaces for type safety
interface MatchTeam {
  id: string;
  name: string;
  scores?: (number | null)[];
  color?: string;
  initial?: string;
}

interface HoleScore {
  teamId: string;
  score: number | null;
}

interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
  holeStarted?: number;
  amount?: number;
}

interface Hole {
  number: number;
  scores: HoleScore[];
  presses: Press[];
  isComplete: boolean;
}

interface MatchPlayResult {
  status: string;
  winner: string | null;
  details: {
    team1Wins: number;
    team2Wins: number;
    halvedHoles: number;
    completedHoles: number;
    holesRemaining: number;
    isMatchOver: boolean;
  } | string;
}

interface StrokePlayTeamResult {
  teamId: string;
  teamName: string;
  totalScore: number;
  completedHoles: number;
  average: number;
  position?: number;
}

interface StrokePlayResult {
  status: string;
  winner: string | null;
  details: StrokePlayTeamResult[];
}

interface HoleResult {
  winner?: string | null;
  status?: string;
  difference?: number;
}

interface PressResult extends Press {
  status: string;
  winner: string | null;
}

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
};

export const formatGameType = (type: string): string => {
  switch (type) {
    case 'front':
    case 'front9':
      return 'Front 9';
    case 'back':
    case 'back9':
      return 'Back 9';
    case 'total':
    case 'total18':
      return 'Total 18';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const calculateMatchPlay = (teams: MatchTeam[], holes: Hole[]): MatchPlayResult => {
  // This is a simplified match play calculation
  // Assuming only 2 teams for match play
  if (teams.length !== 2) return { status: 'Invalid', details: 'Match play requires exactly 2 teams', winner: null };
  
  const team1 = teams[0];
  const team2 = teams[1];
  
  let team1Wins = 0;
  let team2Wins = 0;
  let halvedHoles = 0;
  let completedHoles = 0;
  
  holes.forEach((hole: Hole) => {
    if (hole.isComplete) {
      completedHoles++;
      const team1ScoreObj = hole.scores.find((s: HoleScore) => s.teamId === team1.id);
      const team2ScoreObj = hole.scores.find((s: HoleScore) => s.teamId === team2.id);
      const team1Score = team1ScoreObj?.score;
      const team2Score = team2ScoreObj?.score;
      
      if (team1Score !== null && team1Score !== undefined && 
          team2Score !== null && team2Score !== undefined) {
        if (team1Score < team2Score) {
          team1Wins++;
        } else if (team2Score < team1Score) {
          team2Wins++;
        } else {
          halvedHoles++;
        }
      }
    }
  });
  
  const holesRemaining = holes.length - completedHoles;
  const difference = team1Wins - team2Wins;
  
  // Calculate if the match is mathematically over
  const isMatchOver = Math.abs(difference) > holesRemaining;
  
  // Format the status message
  let status = '';
  let winner = null;
  
  if (isMatchOver) {
    if (difference > 0) {
      status = `${team1.name} wins ${difference} & ${holesRemaining}`;
      winner = team1.id;
    } else {
      status = `${team2.name} wins ${-difference} & ${holesRemaining}`;
      winner = team2.id;
    }
  } else if (holesRemaining === 0) {
    if (difference > 0) {
      status = `${team1.name} wins ${difference} UP`;
      winner = team1.id;
    } else if (difference < 0) {
      status = `${team2.name} wins ${-difference} UP`;
      winner = team2.id;
    } else {
      status = 'Match Halved';
    }
  } else {
    if (difference > 0) {
      status = `${team1.name} ${difference} UP through ${completedHoles}`;
    } else if (difference < 0) {
      status = `${team2.name} ${-difference} UP through ${completedHoles}`;
    } else {
      status = `All Square through ${completedHoles}`;
    }
  }
  
  return {
    status,
    winner,
    details: {
      team1Wins,
      team2Wins,
      halvedHoles,
      completedHoles,
      holesRemaining,
      isMatchOver
    }
  };
};

export const calculateStrokePlay = (teams: MatchTeam[], holes: Hole[]): StrokePlayResult => {
  const results: StrokePlayTeamResult[] = teams.map((team: MatchTeam) => {
    const totalScore = holes.reduce((total: number, hole: Hole) => {
      const score = hole.scores.find((s: HoleScore) => s.teamId === team.id)?.score || 0;
      return total + score;
    }, 0);
    
    const completedHoles = holes.filter((hole: Hole) => 
      hole.scores.find((s: HoleScore) => s.teamId === team.id)?.score !== null
    ).length;
    
    return {
      teamId: team.id,
      teamName: team.name,
      totalScore,
      completedHoles,
      average: completedHoles > 0 ? totalScore / completedHoles : 0
    };
  }).sort((a: StrokePlayTeamResult, b: StrokePlayTeamResult) => a.totalScore - b.totalScore);
  
  // Add position and determine winner
  let currentPosition = 1;
  let currentScore = results[0].totalScore;
  
  results.forEach((result: StrokePlayTeamResult, index: number) => {
    if (result.totalScore > currentScore) {
      currentPosition = index + 1;
      currentScore = result.totalScore;
    }
    result.position = currentPosition;
  });
  
  const winner = results[0].totalScore < results[1].totalScore ? results[0].teamId : null;
  const isTied = results[0].totalScore === results[1].totalScore;
  
  let status = '';
  if (isTied) {
    status = `Tied at ${results[0].totalScore}`;
  } else {
    const leader = results[0];
    const difference = results[1].totalScore - leader.totalScore;
    status = `${leader.teamName} leads by ${difference}`;
  }
  
  return {
    status,
    winner,
    details: results
  };
};

export const calculateHoleResult = (hole: Hole, teams: MatchTeam[], playFormat: "match" | "stroke"): HoleResult | null => {
  if (!hole.isComplete || teams.length !== 2) return null;
  
  const team1Score = hole.scores.find((s: HoleScore) => s.teamId === teams[0].id)?.score;
  const team2Score = hole.scores.find((s: HoleScore) => s.teamId === teams[1].id)?.score;
  
  if (team1Score === null || team1Score === undefined || 
      team2Score === null || team2Score === undefined) return null;
  
  if (playFormat === 'match') {
    if (team1Score < team2Score) {
      return { winner: teams[0].id, status: 'WIN' };
    } else if (team2Score < team1Score) {
      return { winner: teams[1].id, status: 'WIN' };
    } else {
      return { winner: null, status: 'HALVED' };
    }
  } else {
    // For stroke play, just return the difference
    return { difference: team1Score - team2Score };
  }
};

export const calculatePressResults = (teams: MatchTeam[], holes: Hole[], playFormat: "match" | "stroke"): PressResult[] => {
  // Only calculate between 2 teams
  if (teams.length !== 2 || !holes || !holes.length) return [];
  
  const team1 = teams[0];
  const team2 = teams[1];
  
  // Extract all presses from holes
  const presses = holes.flatMap(hole => 
    (hole.presses || []).map((press: Press) => ({
      ...press,
      holeStarted: hole.number,
    }))
  );
  
  if (!presses.length) return [];
  
  return presses.map((press: Press) => {
    // Ensure holeStarted is defined with a safe default value if undefined
    const holeStarted = press.holeStarted || 1;
    
    // Filter for relevant holes - only look at holes from where the press started
    const relevantHoles = holes.filter(
      hole => hole.number >= holeStarted && hole.isComplete
    );
    
    // Get the press type to determine range of holes to consider
    const pressType = press.pressType;
    let minHole = 1;
    let maxHole = 18;
    
    // Set min and max hole numbers based on press type
    if (pressType === 'front9') {
      minHole = 1;
      maxHole = 9;
    } else if (pressType === 'back9') {
      minHole = 10;
      maxHole = 18;
    } else if (pressType === 'total18') {
      // For total press, consider if it started on front 9 or back 9
      if (holeStarted >= 1 && holeStarted <= 9) {
        minHole = holeStarted;  // Start from the hole where the press was made
        maxHole = 18;  // End at hole 18
      } else if (holeStarted >= 10 && holeStarted <= 18) {
        minHole = holeStarted;  // Start from the hole where the press was made
        maxHole = 18;  // End at hole 18
      }
    }
    
    // Filter holes further to include only those within the press type range
    const pressHoles = relevantHoles.filter(hole => 
      hole.number >= minHole && hole.number <= maxHole
    );
    
    // Rest of the calculation logic remains the same
    if (playFormat === 'match') {
      let team1Wins = 0;
      let team2Wins = 0;
      let halvedHoles = 0;
      let completedHoles = 0;
      
      pressHoles.forEach((hole: Hole) => {
        const team1Score = hole.scores.find((s: HoleScore) => s.teamId === team1.id)?.score;
        const team2Score = hole.scores.find((s: HoleScore) => s.teamId === team2.id)?.score;
        
        // Only count holes where both teams have entered a score
        if (team1Score !== null && team1Score !== undefined && 
            team2Score !== null && team2Score !== undefined) {
          completedHoles++;
          if (team1Score < team2Score) {
            team1Wins++;
          } else if (team2Score < team1Score) {
            team2Wins++;
          } else {
            halvedHoles++;
          }
        }
      });
      
      // If no completed holes, return early with a pending status
      if (completedHoles === 0) {
        return {
          ...press,
          status: 'No holes completed',
          winner: null,
        };
      }
      
      // Calculate max possible holes based on press type
      const maxPossibleHoles = (pressType === 'front9' ? 9 : (pressType === 'back9' ? 9 : 18));
      const holesRemaining = maxPossibleHoles - completedHoles;
      const difference = team1Wins - team2Wins;
      
      // Determine if the press match is mathematically over
      const isMatchOver = Math.abs(difference) > holesRemaining;
      
      let status = '';
      let winner = null;
      
      if (isMatchOver) {
        if (difference > 0) {
          status = `${team1.name} wins ${difference} & ${holesRemaining}`;
          winner = team1.id;
        } else {
          status = `${team2.name} wins ${-difference} & ${holesRemaining}`;
          winner = team2.id;
        }
      } else if (holesRemaining === 0) {
        if (difference > 0) {
          status = `${team1.name} wins ${difference} UP`;
          winner = team1.id;
        } else if (difference < 0) {
          status = `${team2.name} wins ${-difference} UP`;
          winner = team2.id;
        } else {
          status = 'Press Halved';
        }
      } else {
        if (difference > 0) {
          status = `${team1.name} ${difference} UP through ${completedHoles}`;
        } else if (difference < 0) {
          status = `${team2.name} ${-difference} UP through ${completedHoles}`;
        } else {
          status = `All Square through ${completedHoles}`;
        }
      }
      
      return {
        ...press,
        status,
        winner,
      };
      
    } else {
      // For stroke play, compare total strokes
      let team1Total = 0;
      let team2Total = 0;
      let completedHoles = 0;
      
      pressHoles.forEach((hole: Hole) => {
        const team1Score = hole.scores.find((s: HoleScore) => s.teamId === team1.id)?.score;
        const team2Score = hole.scores.find((s: HoleScore) => s.teamId === team2.id)?.score;
        
        // Only count holes where both teams have entered a score
        if (team1Score !== null && team1Score !== undefined && 
            team2Score !== null && team2Score !== undefined) {
          team1Total += team1Score;
          team2Total += team2Score;
          completedHoles++;
        }
      });
      
      // If no completed holes, return early with a pending status
      if (completedHoles === 0) {
        return {
          ...press,
          status: 'No holes completed',
          winner: null,
        };
      }
      
      const maxPossibleHoles = (pressType === 'front9' ? 9 : (pressType === 'back9' ? 9 : 18));
      const isComplete = completedHoles === maxPossibleHoles;
      
      let status = '';
      let winner = null;
      
      if (team1Total < team2Total) {
        const diff = team2Total - team1Total;
        status = isComplete 
          ? `${team1.name} wins by ${diff}`
          : `${team1.name} leads by ${diff} through ${completedHoles}`;
        winner = isComplete ? team1.id : null;
      } else if (team2Total < team1Total) {
        const diff = team1Total - team2Total;
        status = isComplete 
          ? `${team2.name} wins by ${diff}`
          : `${team2.name} leads by ${diff} through ${completedHoles}`;
        winner = isComplete ? team2.id : null;
      } else {
        status = isComplete ? 'Press is tied' : `Tied through ${completedHoles}`;
        winner = null;
      }
      
      return {
        ...press,
        status,
        winner,
      };
    }
  });
};

// Helper to get the proper press amount
const getPressAmount = (pressType: string, teams: MatchTeam[]): number => {
  // Default values if not found
  const defaultAmounts = {
    'front9': 10,
    'back9': 10, 
    'total18': 10
  };
  
  // Note: In a full implementation, you'd retrieve this from the match's gameFormats
  // This is just a placeholder implementation
  return defaultAmounts[pressType as keyof typeof defaultAmounts] || 10;
};