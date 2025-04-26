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

  // Define team colors (fallback if not provided in press object)
  const teamColors: Record<string, string> = {
    '1': '#4CAE4F',  // Green
    '2': '#FFC105',  // Yellow
    '3': '#F44034',  // Red
  };

  return (
    <View style={styles.container}>
      {filteredPresses.map((press, index) => {
        // Calculate position in the grid
        const holeOffset = showBack9 ? 9 : 0;
        const rowIndex = press.holeIndex - holeOffset;
        const columnOffset = 10; // Spacing between dots
        
        // Look for team color first in teams array, then fallback to teamColors
        const teamColor = teams.find(t => t.id === press.fromTeamId)?.color || 
                         teamColors[press.fromTeamId] || 
                         '#000000';
        
        return (
          <View
            key={`${press.id}-${index}`}
            style={[
              styles.pressIndicator,
              {
                backgroundColor: teamColor,
                top: rowIndex * 41,  // Position based on hole number
                right: columnOffset * (index % 3),  // Stagger horizontally to avoid overlap
              }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,  // Start after the header
    right: 5,
    bottom: 0,
    width: 50, // Width for multiple press indicators
    pointerEvents: 'none',  // Allow touches to pass through
  },
  pressIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  }
});

export default PressNotification;