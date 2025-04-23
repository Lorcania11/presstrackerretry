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
  showBack9: boolean;
}

const PressNotification: React.FC<PressNotificationProps> = ({ presses, showBack9 }) => {
  // Filter presses based on front 9 or back 9
  const filteredPresses = presses.filter(press => {
    const holeIndex = press.holeIndex;
    return showBack9 ? holeIndex >= 9 && holeIndex < 18 : holeIndex < 9;
  });

  // Define team colors
  const teamColors = {
    '1': '#4CAE4F',  // Green
    '2': '#FFC105',  // Yellow
    '3': '#F44034',  // Red
  };

  return (
    <View style={styles.container}>
      {filteredPresses.map((press, index) => {
        // Calculate position in the grid
        const rowIndex = press.holeIndex % 9;
        const columnOffset = press.toTeamId === press.fromTeamId ? 0 : 10;
        
        // Use team ID to determine color
        const color = teamColors[press.fromTeamId as keyof typeof teamColors] || '#000000';
        
        return (
          <View
            key={`${press.id}-${index}`}
            style={[
              styles.pressIndicator,
              {
                backgroundColor: color,
                top: rowIndex * 41,  // Position based on hole number
                right: columnOffset,
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
    width: 20,
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