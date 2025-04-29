// components/ScorecardScreen/PressNotification.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
}

interface PressNotificationProps {
  presses: Press[];
  matchId: string;
  showBack9?: boolean;
  teams?: Array<{
    id: string;
    color: string;
  }>;
}

const PressNotification: React.FC<PressNotificationProps> = ({ 
  presses, 
  matchId,
  showBack9 = false,
  teams = [] 
}) => {
  // Filter presses based on front 9 or back 9
  const filteredPresses = presses.filter(press => {
    const holeIndex = press.holeIndex;
    return showBack9 ? holeIndex >= 9 && holeIndex < 18 : holeIndex < 9;
  });

  // Define fixed team colors (important for consistent team identification)
  const FIXED_TEAM_COLORS: Record<string, string> = {
    '1': '#4CAE4F', // Team 1 - Green
    '2': '#FFC105', // Team 2 - Yellow
  };
  
  // Group presses by target team and hole
  const getPressesByHoleAndTeam = () => {
    const pressesByHoleAndTeam: Record<string, Record<string, string[]>> = {};
    
    filteredPresses.forEach(press => {
      const holeOffset = showBack9 ? 9 : 0;
      const adjustedHoleIndex = press.holeIndex - holeOffset;
      const holeKey = `hole-${adjustedHoleIndex}`;
      
      // Create nested structure if it doesn't exist
      if (!pressesByHoleAndTeam[holeKey]) {
        pressesByHoleAndTeam[holeKey] = {};
      }
      
      // Create array for target team if it doesn't exist
      if (!pressesByHoleAndTeam[holeKey][press.toTeamId]) {
        pressesByHoleAndTeam[holeKey][press.toTeamId] = [];
      }
      
      // Find the pressing team's color
      const pressingTeam = teams.find(team => team.id === press.fromTeamId);
      const teamColor = pressingTeam?.color || FIXED_TEAM_COLORS['1'];
      
      // Add the color to the array for this hole and target team
      pressesByHoleAndTeam[holeKey][press.toTeamId].push(teamColor);
    });
    
    return pressesByHoleAndTeam;
  };
  
  // This will be used by ScorecardFlow to render the dots in the correct cells
  return (
    <View style={styles.container}>
      {/* We'll return an empty container - the actual indicators will be rendered in ScorecardFlow */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    pointerEvents: 'none', // Allow touches to pass through
    opacity: 0, // Make this container invisible as we'll render indicators directly in cells
  },
  pressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 1,
  }
});

export default PressNotification;