export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
};

export const calculateMatchPlay = (teams, holes) => {
  // This is a simplified match play calculation
  // Assuming only 2 teams for match play
  if (teams.length !== 2) return { status: 'Invalid', details: 'Match play requires exactly 2 teams' };
  
  const team1 = teams[0];
  const team2 = teams[1];
  
  let team1Wins = 0;
  let team2Wins = 0;
  let halvedHoles = 0;
  let completedHoles = 0;
  
  holes.forEach(hole => {
    if (hole.isComplete) {
      completedHoles++;
      const team1Score = hole.scores.find(s => s.teamId === team1.id)?.score;
      const team2Score = hole.scores.find(s => s.teamId === team2.id)?.score;
      
      if (team1Score !== null && team2Score !== null) {
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

export const calculateStrokePlay = (teams, holes) => {
  const results = teams.map(team => {
    const totalScore = holes.reduce((total, hole) => {
      const score = hole.scores.find(s => s.teamId === team.id)?.score || 0;
      return total + score;
    }, 0);
    
    const completedHoles = holes.filter(hole => 
      hole.scores.find(s => s.teamId === team.id)?.score !== null
    ).length;
    
    return {
      teamId: team.id,
      teamName: team.name,
      totalScore,
      completedHoles,
      average: completedHoles > 0 ? totalScore / completedHoles : 0
    };
  }).sort((a, b) => a.totalScore - b.totalScore);
  
  // Add position and determine winner
  let currentPosition = 1;
  let currentScore = results[0].totalScore;
  
  results.forEach((result, index) => {
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

export const calculateHoleResult = (hole, teams, playFormat) => {
  if (!hole.isComplete || teams.length !== 2) return null;
  
  const team1Score = hole.scores.find(s => s.teamId === teams[0].id)?.score;
  const team2Score = hole.scores.find(s => s.teamId === teams[1].id)?.score;
  
  if (team1Score === null || team2Score === null) return null;
  
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

export const calculatePressResults = (teams, holes, playFormat) => {
  // Only calculate between 2 teams
  if (teams.length !== 2) return [];
  
  const team1 = teams[0];
  const team2 = teams[1];
  
  const presses = holes.flatMap(hole => 
    hole.presses.map(press => ({
      ...press,
      holeStarted: hole.number,
    }))
  );
  
  return presses.map(press => {
    const relevantHoles = holes.filter(
      hole => hole.number >= press.holeStarted && hole.isComplete
    );
    
    if (playFormat === 'match') {
      let team1Wins = 0;
      let team2Wins = 0;
      
      relevantHoles.forEach(hole => {
        const team1Score = hole.scores.find(s => s.teamId === team1.id)?.score;
        const team2Score = hole.scores.find(s => s.teamId === team2.id)?.score;
        
        if (team1Score !== null && team2Score !== null) {
          if (team1Score < team2Score) team1Wins++;
          else if (team2Score < team1Score) team2Wins++;
        }
      });
      
      let status, winner;
      const difference = team1Wins - team2Wins;
      
      if (difference > 0) {
        status = `${team1.name} wins ${team1Wins} to ${team2Wins}`;
        winner = team1.id;
      } else if (difference < 0) {
        status = `${team2.name} wins ${team2Wins} to ${team1Wins}`;
        winner = team2.id;
      } else {
        status = 'Press is tied';
        winner = null;
      }
      
      return {
        ...press,
        status,
        winner,
        amount: press.amount
      };
      
    } else {
      // For stroke play, compare total strokes
      const team1Total = relevantHoles.reduce((total, hole) => {
        const score = hole.scores.find(s => s.teamId === team1.id)?.score || 0;
        return total + score;
      }, 0);
      
      const team2Total = relevantHoles.reduce((total, hole) => {
        const score = hole.scores.find(s => s.teamId === team2.id)?.score || 0;
        return total + score;
      }, 0);
      
      let status, winner;
      
      if (team1Total < team2Total) {
        status = `${team1.name} wins by ${team2Total - team1Total}`;
        winner = team1.id;
      } else if (team2Total < team1Total) {
        status = `${team2.name} wins by ${team1Total - team2Total}`;
        winner = team2.id;
      } else {
        status = 'Press is tied';
        winner = null;
      }
      
      return {
        ...press,
        status,
        winner,
        amount: press.amount
      };
    }
  });
};