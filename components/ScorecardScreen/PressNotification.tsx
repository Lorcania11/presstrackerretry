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
  const TEAM_COLORS: Record<string, string> = {
    '1': '#007AFF', // Team 1 - Blue
    '2': '#FF3B30', // Team 2 - Red
  };

  return (
    <View style={styles.container}>
      {filteredPresses.map((press, index) => {
        // Calculate position in the grid
        const holeOffset = showBack9 ? 9 : 0;
        const rowIndex = press.holeIndex - holeOffset;
        const columnOffset = 10; // Spacing between dots
        
        // Use fixed team colors based on team ID first, then look in teams array, 
        // ensuring consistent color representation across the app
        const teamColor = TEAM_COLORS[press.fromTeamId] || 
                         teams.find(t => t.id === press.fromTeamId)?.color || 
                         '#888888'; // Fallback to gray
        
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