// components/ScorecardScreen/PressNotification.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
  isOriginalBet?: boolean; // Add this field to check
}

interface PressNotificationProps {
  presses: Press[];
  matchId: string;
  showBack9: boolean;
  teams: Array<{
    id: string;
    color: string;
    name: string;
  }>;
}

const PressNotification: React.FC<PressNotificationProps> = ({
  presses,
  matchId,
  showBack9,
  teams
}) => {
  const insets = useSafeAreaInsets();

  // Only show notifications for non-original bet presses
  const filteredPresses = presses.filter(press => {
    // Filter out original bets - we don't want notifications for these
    if (press.isOriginalBet) return false;
    
    // Show relevant presses based on current view (front9 or back9)
    if (showBack9) {
      // For back9 view, only show presses on holes 10-18 (indices 9-17)
      return press.holeIndex >= 9 && press.holeIndex <= 17;
    } else {
      // For front9 view, only show presses on holes 1-9 (indices 0-8)
      return press.holeIndex >= 0 && press.holeIndex <= 8;
    }
  });

  if (filteredPresses.length === 0) return null;

  return (
    <View style={[
      styles.container, 
      { paddingBottom: insets.bottom + 10 }
    ]}>
      {filteredPresses.map(press => {
        const fromTeam = teams.find(team => team.id === press.fromTeamId);
        const toTeam = teams.find(team => team.id === press.toTeamId);
        
        if (!fromTeam || !toTeam) return null;
        
        const holeNumber = press.holeIndex + 1;
        
        return (
          <View 
            key={press.id} 
            style={[
              styles.notification, 
              { borderColor: fromTeam.color },
              // Add iOS-specific styling
              Platform.OS === 'ios' && styles.iosNotification
            ]}
            accessibilityLabel={`New press from ${fromTeam.name} to ${toTeam.name} on hole ${holeNumber}`}
            accessible={true}
          >
            <View style={[
              styles.indicator, 
              { backgroundColor: fromTeam.color },
              // Make indicators more visible on iOS
              Platform.OS === 'ios' && { width: 10, height: 10, borderRadius: 5 }
            ]} />
            <Text style={styles.notificationText}>
              {fromTeam.name} pressed {toTeam.name} on hole {holeNumber}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
    gap: 8,
    zIndex: 100, // Ensure notifications are on top
  },
  notification: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#cccccc',
    maxWidth: '90%', // Limit width for better readability on iOS
  },
  iosNotification: {
    // iOS-specific enhancements
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1, // Thinner border on iOS
    paddingVertical: 10, // Slightly more padding for iOS
    // Blend mode for transparency effect that works well on iOS
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)'
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  notificationText: {
    color: '#333333',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default PressNotification;