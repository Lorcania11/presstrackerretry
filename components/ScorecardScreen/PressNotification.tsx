// components/ScorecardScreen/PressNotification.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

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

interface DisplayPress extends Press {
  fromTeamName: string;
  toTeamName: string;
  fromTeamColor: string;
  holeNumber: number;
  pressTypeLabel: string;
  timestamp: number; // Unix timestamp for sorting
}

const NOTIFICATION_DISPLAY_TIME = 5000; // Time in ms that notifications stay visible
const MAX_NOTIFICATIONS = 3; // Maximum number of notifications to show

const PressNotification: React.FC<PressNotificationProps> = ({
  presses,
  matchId,
  showBack9,
  teams
}) => {
  const insets = useSafeAreaInsets();
  const [displayedPresses, setDisplayedPresses] = useState<DisplayPress[]>([]);
  const fadeAnim = useRef<{[id: string]: Animated.Value}>({});
  const timeoutRefs = useRef<{[id: string]: NodeJS.Timeout}>({});

  // Process presses when they change
  useEffect(() => {
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
    
    // Update displayed presses with additional data needed for display
    const formattedPresses: DisplayPress[] = mostRecentPresses.map(press => {
      const fromTeam = teams.find(team => team.id === press.fromTeamId);
      const toTeam = teams.find(team => team.id === press.toTeamId);
      
      return {
        ...press,
        fromTeamName: fromTeam?.name || 'Unknown Team',
        toTeamName: toTeam?.name || 'Unknown Team',
        fromTeamColor: fromTeam?.color || '#CCCCCC',
        holeNumber: press.holeIndex + 1,
        pressTypeLabel: getPressTypeLabel(press.pressType),
        timestamp: Date.now() // Add current timestamp
      };
    });

    // Check for new presses to show
    const existingIds = new Set(displayedPresses.map(p => p.id));
    const newPresses = formattedPresses.filter(press => !existingIds.has(press.id));
    
    if (newPresses.length > 0) {
      // Add new presses to displayed presses
      const updatedPresses = [...displayedPresses, ...newPresses]
        // Sort by timestamp, newest first
        .sort((a, b) => b.timestamp - a.timestamp)
        // Limit to MAX_NOTIFICATIONS
        .slice(0, MAX_NOTIFICATIONS);
      
      setDisplayedPresses(updatedPresses);
      
      // Set up fade animations for new presses
      newPresses.forEach(press => {
        // Create fade animation value if it doesn't exist
        if (!fadeAnim.current[press.id]) {
          fadeAnim.current[press.id] = new Animated.Value(0);
          
          // Start fade-in animation
          Animated.timing(fadeAnim.current[press.id], {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true
          }).start();
          
          // Set up automatic fade-out
          timeoutRefs.current[press.id] = setTimeout(() => {
            // Start fade-out animation
            Animated.timing(fadeAnim.current[press.id], {
              toValue: 0,
              duration: 300,
              easing: Easing.ease,
              useNativeDriver: true
            }).start(() => {
              // Remove press from display after fade-out
              setDisplayedPresses(prev => prev.filter(p => p.id !== press.id));
              // Clean up animation value
              delete fadeAnim.current[press.id];
            });
          }, NOTIFICATION_DISPLAY_TIME);
        }
      });
    }
    
    // Clean up timeouts on unmount
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [presses, showBack9, teams]);

  // Handle dismissing all notifications
  const handleDismiss = () => {
    // Animate all out
    Object.keys(fadeAnim.current).forEach(id => {
      // Clear any existing timeouts
      if (timeoutRefs.current[id]) {
        clearTimeout(timeoutRefs.current[id]);
      }
      
      // Start fade-out animation
      Animated.timing(fadeAnim.current[id], {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true
      }).start();
    });
    
    // Remove all after animation
    setTimeout(() => {
      setDisplayedPresses([]);
      fadeAnim.current = {};
    }, 300);
  };

  if (displayedPresses.length === 0) return null;

  return (
    <View style={[
      styles.container,
      { paddingBottom: Platform.OS === 'ios' ? Math.max(10, insets.bottom) : 10 }
    ]}>
      {displayedPresses.map((press, index) => {
        // Calculate opacity based on index (newest = most opaque)
        const baseOpacity = index === 0 ? 1 : index === 1 ? 0.8 : 0.6;
        
        return (
          <Animated.View 
            key={press.id}
            style={[
              styles.notification, 
              { 
                borderColor: press.fromTeamColor,
                // Apply both static opacity based on position and animated fade
                opacity: fadeAnim.current[press.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, baseOpacity]
                }) || baseOpacity,
                // Apply iOS-specific styling
                ...Platform.OS === 'ios' && styles.iosNotification
              }
            ]}
            accessibilityLabel={`Press from ${press.fromTeamName} to ${press.toTeamName} on hole ${press.holeNumber}`}
            accessible={true}
          >
            <View style={[
              styles.indicator, 
              { backgroundColor: press.fromTeamColor },
              // Make indicators more visible on iOS
              Platform.OS === 'ios' && { width: 10, height: 10, borderRadius: 5 }
            ]} />
            
            <Text style={styles.notificationText}>
              {press.fromTeamName} pressed {press.toTeamName} on hole {press.holeNumber} ({press.pressTypeLabel})
            </Text>
            
            {/* Only show close button on the most recent notification */}
            {index === 0 && (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                accessibilityLabel="Dismiss notifications"
              >
                <X size={16} color="#999999" />
              </TouchableOpacity>
            )}
          </Animated.View>
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
    flex: 1, // Allow text to take available space but not push close button
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default PressNotification;