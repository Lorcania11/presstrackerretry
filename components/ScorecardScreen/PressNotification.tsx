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

  // Group presses by hole index and team combinations to avoid duplicates
  const uniquePresses = new Map<string, Press>();
  
  // Process presses to remove duplicates for the same hole and team combination
  presses.forEach(press => {
    // Skip original bets
    if (press.isOriginalBet) return;
    
    // Check if press is relevant to current view (front9 or back9)
    const isRelevantToView = showBack9 
      ? (press.holeIndex >= 9 && press.holeIndex <= 17)
      : (press.holeIndex >= 0 && press.holeIndex <= 8);
      
    if (!isRelevantToView) return;
    
    // Create a unique key for this press based on hole index, teams involved, and press type
    const uniqueKey = `${press.holeIndex}-${press.fromTeamId}-${press.toTeamId}-${press.pressType}`;
    
    // Only store one press per unique key
    if (!uniquePresses.has(uniqueKey)) {
      uniquePresses.set(uniqueKey, press);
    }
  });

  const filteredPresses = Array.from(uniquePresses.values());

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
        const pressTypeLabel = (() => {
          const type = press.pressType;
          if (type === 'front9' || type === 'front') return 'Front 9';
          if (type === 'back9' || type === 'back') return 'Back 9';
          if (type === 'total18' || type === 'total') return 'Total 18';
          return type;
        })();

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
              {fromTeam.name} pressed {toTeam.name} on hole {holeNumber} ({pressTypeLabel})
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
    marginBottom: 8, // Add space between multiple notifications
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