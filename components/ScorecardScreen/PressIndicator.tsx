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
    // Only include presses at this hole index
    // AND exclude original bets
    return press.holeIndex === currentHoleIndex && !press.isOriginalBet;
  });
  
  // Group presses by team that initiated them (fromTeamId)
  // This prevents multiple indicators for the same team pressing multiple game types
  const pressesByTeam: Record<string, {
    fromTeamId: string;
    toTeamId: string;
    color: string;
  }> = {};
  
  relevantPresses.forEach(press => {
    // Check if this team is being pressed (not doing the pressing)
    if (press.toTeamId === teamId) {
      // Store only one press per initiating team to avoid duplicates
      if (!pressesByTeam[press.fromTeamId]) {
        const pressingTeam = teams.find(team => team.id === press.fromTeamId);
        const color = pressingTeam?.fixedColor || pressingTeam?.color || '#CCCCCC';
        
        pressesByTeam[press.fromTeamId] = {
          fromTeamId: press.fromTeamId,
          toTeamId: press.toTeamId,
          color: color
        };
      }
    }
  });

  // If no teams are pressing this team, don't render anything
  const pressCount = Object.keys(pressesByTeam).length;
  if (pressCount === 0) return null;

  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${pressCount} presses on hole ${holeNumber}`}
      accessible={true}
    >
      {Object.values(pressesByTeam).map((press, index) => {
        // Use the color of the team that initiated the press
        const dotColor = press.color;
        
        return (
          <View 
            key={`${press.fromTeamId}-${index}`} 
            style={[
              styles.indicator,
              { backgroundColor: dotColor },
              styles.pressedIndicator,
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
    // Enhanced iOS shadow
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.7,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  iOSIndicator: {
    // Enhanced iOS shadow styling
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

export default PressIndicator;
