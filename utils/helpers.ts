/**
 * Generate a unique ID
 * @returns A unique string ID
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Calculate match play results
 * @param teams Array of teams
 * @param holes Array of holes with scores
 * @returns Match play results
 */
export function calculateMatchPlay(teams: any[], holes: any[]) {
  // Ensure we have exactly two teams
  if (teams.length !== 2) {
    return { 
      status: 'Invalid number of teams', 
      details: null 
    };
  }

  const team1 = teams[0];
  const team2 = teams[1];
  
  let team1Wins = 0;
  let team2Wins = 0;
  let ties = 0;
  
  // Calculate hole-by-hole results
  holes.forEach(hole => {
    if (!hole.isComplete) return;
    
    const team1Score = hole.scores.find((s: any) => s.teamId === team1.id)?.score;
    const team2Score = hole.scores.find((s: any) => s.teamId === team2.id)?.score;
    
    if (team1Score === null || team2Score === null) return;
    
    if (team1Score < team2Score) {
      team1Wins++;
    } else if (team2Score < team1Score) {
      team2Wins++;
    } else {
      ties++;
    }
  });
  
  // Calculate net result
  const netResult = team1Wins - team2Wins;
  
  let status;
  if (netResult > 0) {
    status = `${team1.name} ${netResult} UP`;
  } else if (netResult < 0) {
    status = `${team2.name} ${Math.abs(netResult)} UP`;
  } else {
    status = 'All Square';
  }
  
  return {
    status,
    details: {
      team1Wins,
      team2Wins,
      ties,
      netResult
    }
  };
}

/**
 * Calculate stroke play results
 * @param teams Array of teams
 * @param holes Array of holes with scores
 * @returns Stroke play results
 */
export function calculateStrokePlay(teams: any[], holes: any[]) {
  // Calculate total scores for each team
  const results = teams.map(team => {
    let totalScore = 0;
    
    holes.forEach(hole => {
      if (!hole.isComplete) return;
      
      const score = hole.scores.find((s: any) => s.teamId === team.id)?.score;
      if (score !== null && score !== undefined) {
        totalScore += score;
      }
    });
    
    return {
      teamId: team.id,
      teamName: team.name,
      totalScore
    };
  });
  
  // Sort by lowest score
  results.sort((a, b) => a.totalScore - b.totalScore);
  
  return {
    status: `${results[0].teamName} leads with ${results[0].totalScore}`,
    details: results
  };
}