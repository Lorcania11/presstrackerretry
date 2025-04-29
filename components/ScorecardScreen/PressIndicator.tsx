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
  }>;
  showBack9: boolean;
  teams: Array<{
    id: string;
    color: string;
  }>;
}

const PressIndicator: React.FC<PressIndicatorProps> = ({
  teamId,
  holeNumber,
  presses,
  showBack9,
  teams
}) => {
  // Filter presses where this team is the target team for this hole
  const pressesForThisCell = presses.filter(press => {
    const isTargetTeam = press.toTeamId === teamId;
    const holeIndex = press.holeIndex + 1; // Convert from 0-based to 1-based
    const isCorrectHole = holeNumber === holeIndex;
    
    return isTargetTeam && isCorrectHole;
  });
  
  if (pressesForThisCell.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {pressesForThisCell.map((press, index) => {
        // Find the pressing team
        const pressingTeam = teams.find(team => team.id === press.fromTeamId);
        const dotColor = pressingTeam?.color || '#cccccc';
        
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
