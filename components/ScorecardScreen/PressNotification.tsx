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

  // Skip original bets and filter irrelevant presses first
  const relevantPresses = presses.filter(press => {
    // Skip original bets
    if (press.isOriginalBet) return false;
    
    // Check if press is relevant to current view (front9 or back9)
    const isRelevantToView = showBack9 
      ? (press.holeIndex >= 9 && press.holeIndex <= 17)
      : (press.holeIndex >= 0 && press.holeIndex <= 8);
      
    return isRelevantToView;
  });

  // Group presses by game type and team combinations
  // Create a key for each unique game type + team combination
  const gameTypeGroups = new Map<string, Press>();

  // Process presses to keep only the most recent for each game type
  relevantPresses.forEach(press => {
    // Normalize the press type
    const normalizedPressType = getNormalizedPressType(press.pressType);
    
    // Create a composite key for this press based on its type and teams involved
    const typeTeamKey = `${normalizedPressType}-${press.fromTeamId}-${press.toTeamId}`;
    
    // Check if we already have a press for this type+teams combination
    if (!gameTypeGroups.has(typeTeamKey) || 
        press.holeIndex > gameTypeGroups.get(typeTeamKey)!.holeIndex) {
      // Keep this press if it's the first one we've seen of this type
      // or if it's more recent (higher hole index) than the previous one
      gameTypeGroups.set(typeTeamKey, press);
    }
  });

  // Convert the map values (most recent presses) to an array
  const mostRecentPresses = Array.from(gameTypeGroups.values());

  if (mostRecentPresses.length === 0) return null;

  return (
    <View style={[
      styles.container,
      { paddingBottom: Platform.OS === 'ios' ? Math.max(10, insets.bottom) : 10 }
    ]}>
      {mostRecentPresses.map(press => {
        const fromTeam = teams.find(team => team.id === press.fromTeamId);
        const toTeam = teams.find(team => team.id === press.toTeamId);
        
        if (!fromTeam || !toTeam) return null;
        
        const holeNumber = press.holeIndex + 1;
        const pressTypeLabel = getPressTypeLabel(press.pressType);

        return (
          <View 
            key={`${press.fromTeamId}-${press.toTeamId}-${press.pressType}`} 
            style={[
              styles.notification, 
              { borderColor: fromTeam.color },
              // Add iOS-specific styling
              Platform.OS === 'ios' && styles.iosNotification
            ]}
            accessibilityLabel={`Press from ${fromTeam.name} to ${toTeam.name} on hole ${holeNumber}`}
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

// Helper function to normalize press types to standard categories
function getNormalizedPressType(pressType: string): string {
  if (pressType.includes('front')) return 'front9';
  if (pressType.includes('back')) return 'back9';
  if (pressType.includes('total')) return 'total18';
  return pressType;
}

// Helper function to get display label for press type
function getPressTypeLabel(pressType: string): string {
  if (pressType.includes('front')) return 'Front 9';
  if (pressType.includes('back')) return 'Back 9';
  if (pressType.includes('total')) return 'Total 18';
  return pressType;
}

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
    // Enhanced iOS-specific shadow styling
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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