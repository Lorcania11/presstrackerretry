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
    isOriginalBet?: boolean;
  }>;
  showBack9: boolean;
  teams: Array<{
    id: string;
    name: string;
    initial?: string;
    color?: string;
    fixedColor?: string;
  }>;
}

const PressIndicator: React.FC<PressIndicatorProps> = ({
  teamId,
  holeNumber,
  presses,
  showBack9,
  teams
}) => {
  // Determine proper hole index from hole number
  const currentHoleIndex = holeNumber - 1;
  
  // Find presses that originated on this hole
  const relevantPresses = presses.filter(press => {
    // Include all presses at this hole (both original and subsequent)
    if (press.holeIndex === currentHoleIndex) {
      // Check if this team is involved in the press (either pressing or being pressed)
      return press.fromTeamId === teamId || press.toTeamId === teamId;
    }
    return false;
  });

  // If no relevant presses, don't render anything
  if (relevantPresses.length === 0) return null;

  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${relevantPresses.length} presses on hole ${holeNumber}`}
      accessible={true}
    >
      {relevantPresses.map((press, index) => {
        // Get the color of the pressing team
        const pressingTeam = teams.find(team => team.id === press.fromTeamId);
        // Use fixedColor as first priority, then regular color, then fallback
        const dotColor = pressingTeam?.fixedColor || pressingTeam?.color || '#CCCCCC';
        
        // Determine if this team is pressing or being pressed
        const isPressing = press.fromTeamId === teamId;
        const isBeingPressed = press.toTeamId === teamId;
        
        // Skip if team is not involved (shouldn't happen due to filter above)
        if (!isPressing && !isBeingPressed) return null;
        
        return (
          <View 
            key={`${press.id}-${index}`} 
            style={[
              styles.indicator,
              { backgroundColor: dotColor },
              isPressing ? styles.pressingIndicator : styles.pressedIndicator,
              // iOS-specific enhancement
              Platform.OS === 'ios' && styles.iOSIndicator
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
    bottom: 2,
    right: 2,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    zIndex: 10, // Ensure indicators are on top across all platforms
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
    // iOS shadow enhancement
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressingIndicator: {
    width: 8, // Slightly larger for the pressing team
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  pressedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  iOSIndicator: {
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 1.5,
  },
});

export default PressIndicator;
