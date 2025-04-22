import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Added comments to clarify complex logic and ensure undefined data is handled
const PressNotification = ({ presses = [], matchId }) => {
  // Ensure all props have default values to prevent runtime errors
  if (!matchId) {
    console.error('Missing required prop: matchId');
    return null;
  }

  // Filter presses for the current match ID
  const filteredPresses = presses.filter((press) => press.matchId === matchId);

  return (
    <View style={styles.container}>
      {filteredPresses.map((press, idx) => {
        // Limit to 2 dots per hole
        if (idx >= 2) return null;

        const left = getLeftForTeam(press.toTeamId, idx);
        const top = getTopForHole(press.holeIndex);
        const color = getColor(press.fromTeamId);
        const icon = getIcon(press.fromTeamId); // Dynamically determine icon

        return (
          <View
            key={`${press.holeIndex}-${press.fromTeamId}-${press.toTeamId}-${idx}`}
            style={[
              styles.dot,
              { backgroundColor: color, top, left },
            ]}
          >
            {icon && <Text style={styles.icon}>{icon}</Text>}
          </View>
        );
      })}
    </View>
  );
};

// Helper function to determine dot color based on team ID
const getColor = (id) => {
  switch (id) {
    case 1: return '#4CAE4F'; // Green
    case 2: return '#FFC105'; // Yellow
    case 3: return '#F44034'; // Red
    default: return '#000'; // Default black
  }
};

// Helper function to determine icon based on team ID
const getIcon = (id) => {
  switch (id) {
    case 1: return '✓'; // Example icon for Team 1
    case 2: return '★'; // Example icon for Team 2
    case 3: return '⚡'; // Example icon for Team 3
    default: return null; // No icon for default
  }
};

// Helper function to calculate left position based on team ID and index
const getLeftForTeam = (teamId, idx) => {
  const base = {
    1: 10, // Team 1
    2: 30, // Team 2
    3: 50, // Team 3
  }[teamId] || 10;
  return base + idx * 15; // Offset for multiple dots
};

// Helper function to calculate top position based on hole index
const getTopForHole = (holeIndex) => {
  const rowHeight = 50; // Height of each row in the grid
  return holeIndex * rowHeight;
};

const styles = StyleSheet.create({
  container: {
    width: 240, // Width of the grid
    height: 540, // Height of the grid
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 20, // Adjusted size for icon
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#fff', // Icon color
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PressNotification;