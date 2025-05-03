// Utility functions for match calculations and helper methods

// Generate random IDs
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Define interfaces for proper type checking
export interface MatchPlayResult {
  team1Wins: number;
  team2Wins: number;
  halvedHoles: number;
  completedHoles: number;
  holesRemaining: number;
  isMatchOver: boolean;
  status: string;
}

export interface StrokePlayTeamResult {
  teamId: string;
  teamName: string;
  totalScore: number;
  completedHoles: number;
  average: number;
}

export interface StrokePlayResult {
  details: StrokePlayTeamResult[];
  teamLeading?: string;
  leadingBy?: number;
  status: string;
  isComplete: boolean;
}

/**
 * Calculate match play results based on completed holes
 * In match play, each hole is worth 1 point - a team either wins, loses, or halves the hole
 */
export function calculateMatchPlay(teams: any[], holes: any[]): MatchPlayResult {
  // Ensure we have exactly 2 teams
  if (teams.length !== 2) {
    return {
      team1Wins: 0,
      team2Wins: 0,
      halvedHoles: 0,
      completedHoles: 0,
      holesRemaining: 18,
      isMatchOver: false,
      status: "Invalid team count"
    };
  }
  
  const team1 = teams[0];
  const team2 = teams[1];
  
  let team1Wins = 0;
  let team2Wins = 0;
  let halvedHoles = 0;
  let completedHoles = 0;
  
  // Process each hole
  holes.forEach(hole => {
    if (hole.isComplete) {
      completedHoles++;
      
      // Find scores for both teams
      const team1ScoreObj = hole.scores.find((s: any) => s.teamId === team1.id);
      const team2ScoreObj = hole.scores.find((s: any) => s.teamId === team2.id);
      
      // Skip if either score is missing or null
      if (!team1ScoreObj || !team2ScoreObj || 
          team1ScoreObj.score === null || team2ScoreObj.score === null) {
        return;
      }
      
      const team1Score = team1ScoreObj.score;
      const team2Score = team2ScoreObj.score;
      
      // Match play logic - only the difference of win/loss matters, not by how many strokes
      if (team1Score < team2Score) {
        team1Wins++; // Team 1 wins the hole by 1 point (regardless of stroke differential)
      } else if (team2Score < team1Score) {
        team2Wins++; // Team 2 wins the hole by 1 point
      } else {
        halvedHoles++; // Tie on this hole - halved
      }
    }
  });
  
  // Calculate remaining holes
  const holesRemaining = 18 - completedHoles;
  
  // Calculate if match is over
  // A match is over if one team has more wins than the other team can possibly achieve
  const isMatchOver = (team1Wins > team2Wins + holesRemaining) || 
                      (team2Wins > team1Wins + holesRemaining);
  
  // Generate a status message
  let statusMessage = '';
  const netScore = team1Wins - team2Wins;
  
  if (netScore === 0) {
    statusMessage = "All Square";
  } else if (netScore > 0) {
    statusMessage = `${team1.name} ${netScore} UP`;
  } else {
    statusMessage = `${team2.name} ${Math.abs(netScore)} UP`;
  }
  
  // Return structured result
  return {
    team1Wins,
    team2Wins,
    halvedHoles,
    completedHoles,
    holesRemaining,
    isMatchOver,
    status: statusMessage
  };
}

/**
 * Calculate stroke play results based on completed holes
 * In stroke play, the actual score differential matters for each hole
 */
export function calculateStrokePlay(teams: any[], holes: any[]): StrokePlayResult {
  // Track detailed scores for each team
  const teamDetails = teams.map(team => ({
    teamId: team.id,
    name: team.name,
    totalScore: 0,
    holesPlayed: 0
  }));
  
  // Calculate each team's total score from completed holes
  holes.forEach(hole => {
    if (hole.isComplete) {
      hole.scores.forEach((score: any) => {
        if (score.score !== null) {
          const teamDetail = teamDetails.find(t => t.teamId === score.teamId);
          if (teamDetail) {
            teamDetail.totalScore += score.score;
            teamDetail.holesPlayed += 1;
          }
        }
      });
    }
  });
  
  // Create properly formatted team results
  const teamResults: StrokePlayTeamResult[] = teamDetails.map(team => ({
    teamId: team.teamId,
    teamName: team.name,
    totalScore: team.totalScore,
    completedHoles: team.holesPlayed,
    average: team.holesPlayed > 0 ? team.totalScore / team.holesPlayed : 0
  }));
  
  // Find the team with the lowest score (winner in stroke play)
  let leadingTeam: string | undefined;
  let leadingBy: number | undefined;
  
  if (teams.length === 2 && teamResults[0].completedHoles > 0 && teamResults[1].completedHoles > 0) {
    const team1 = teamResults[0];
    const team2 = teamResults[1];
    
    if (team1.totalScore < team2.totalScore) {
      leadingTeam = team1.teamName;
      leadingBy = team2.totalScore - team1.totalScore;
    } else if (team2.totalScore < team1.totalScore) {
      leadingTeam = team2.teamName;
      leadingBy = team1.totalScore - team2.totalScore;
    }
  }
  
  // Generate a status message
  let statusMessage = '';
  
  if (leadingTeam && leadingBy) {
    statusMessage = `${leadingTeam} leads by ${leadingBy} strokes`;
  } else if (teamResults.length >= 2 && 
             teamResults[0].completedHoles > 0 && 
             teamResults[1].completedHoles > 0 && 
             teamResults[0].totalScore === teamResults[1].totalScore) {
    statusMessage = "Match is tied";
  } else {
    statusMessage = "Scores not available";
  }
  
  // Determine if match is complete (all 18 holes played)
  const isComplete = holes.every(h => h.isComplete);
  
  // Return structured result
  return {
    details: teamResults,
    teamLeading: leadingTeam,
    leadingBy,
    status: statusMessage,
    isComplete
  };
}