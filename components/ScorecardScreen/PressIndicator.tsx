import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PressIndicatorProps {
  teamId: string;
  holeNumber: number;
  presses: Array<{
    id: string;
    fromTeamId: string;
    toTeamId: string;
    holeIndex: number;
    pressType: string;
    isOriginalBet?: boolean; // Add this field to check
  }>;
  showBack9: boolean;
  teams: Array<{
    id: string;
    name: string;
    initial: string;
    fixedColor: string;
  }>;
}

const PressIndicator: React.FC<PressIndicatorProps> = ({
  teamId,
  holeNumber,
  presses,
  showBack9,
  teams
}) => {
  // Find presses relevant to this hole and team
  // Filter out original bets - they should not show indicators on the scorecard
  const relevantPresses = presses.filter(press => {
    // Skip original bets
    if (press.isOriginalBet) return false;
    
    // Check if this press originated on this hole
    if (press.holeIndex !== holeNumber - 1) return false;

    // Check if this team is involved in the press (either pressing or being pressed)
    return press.fromTeamId === teamId || press.toTeamId === teamId;
  });

  if (relevantPresses.length === 0) return null;

  return (
    <View style={styles.container}>
      {relevantPresses.map((press, index) => {
        // Find the pressing team
        const pressingTeam = teams.find(team => team.id === press.fromTeamId);
        const dotColor = pressingTeam?.fixedColor || '#cccccc';
        
        return (
          <View 
            key={`${press.id}-${index}`} 
            style={[
              styles.indicator,
              { backgroundColor: dotColor }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 1,
    right: 1,
    flexWrap: 'wrap',
    maxWidth: '75%',
    justifyContent: 'flex-end',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  }
});

export default PressIndicator;
