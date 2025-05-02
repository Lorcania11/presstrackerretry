import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

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
    
    // Calculate the actual hole index we're looking at based on showBack9
    // For back9 view, hole numbers are 10-18 (indices 9-17)
    // For front9 view, hole numbers are 1-9 (indices 0-8)
    const currentHoleIndex = showBack9 
      ? holeNumber - 1  // Back 9 view: convert hole number (10-18) to index (9-17)
      : holeNumber - 1; // Front 9 view: convert hole number (1-9) to index (0-8)
    
    // Check if this press originated on this hole
    if (press.holeIndex !== currentHoleIndex) return false;

    // Check if this team is involved in the press (either pressing or being pressed)
    return press.fromTeamId === teamId || press.toTeamId === teamId;
  });

  if (relevantPresses.length === 0) return null;

  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${relevantPresses.length} presses on hole ${holeNumber}`}
      accessible={true}
    >
      {relevantPresses.map((press, index) => {
        // Find the pressing team
        const pressingTeam = teams.find(team => team.id === press.fromTeamId);
        const dotColor = pressingTeam?.fixedColor || '#cccccc';
        
        // Determine if this team is pressing or being pressed
        const isPressing = press.fromTeamId === teamId;
        
        return (
          <View 
            key={`${press.id}-${index}`} 
            style={[
              styles.indicator,
              { backgroundColor: dotColor },
              // Make pressing indicators slightly larger for better visibility on iOS
              Platform.OS === 'ios' && isPressing && styles.iOsPressingIndicator
            ]}
            accessibilityElementsHidden={true} // Hide from screen readers as parent is accessible
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
    // Add iOS-specific z-index to ensure indicators are on top
    ...Platform.select({
      ios: {
        zIndex: 10,
      }
    })
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
    // Better rendering on iOS retina displays with more refined shadow
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
      }
    }),
  },
  iOsPressingIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    // Even better shadow for pressing indicators to make them stand out more on iOS
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1.5,
  }
});

export default PressIndicator;
