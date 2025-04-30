// components/ScorecardScreen/ScorecardFlow.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react-native';
import PressNotification from './PressNotification';
import PressIndicator from './PressIndicator';
import PressSummaryModal from '@/components/match/PressSummaryModal';

// Define fixed team colors (important for consistent team identification)
const FIXED_TEAM_COLORS: Record<string, string> = {
  '1': '#4CAE4F', // Team 1 - Green
  '2': '#FFC105', // Team 2 - Yellow
};

interface ScorecardProps {
  teams: Array<{
    id: string;
    name: string;
    initial: string;
    color: string;
    scores: (number | null)[];
  }>;
  presses: Array<{
    id: string;
    fromTeamId: string;
    toTeamId: string;
    holeIndex: number;
    pressType: string;
  }>;
  currentHole: number;
  showBack9: boolean;
  onBack: () => void;
  matchId: string;
}

const ScorecardFlow: React.FC<ScorecardProps> = ({ 
  teams, 
  presses, 
  currentHole,
  showBack9 = false,
  onBack,
  matchId
}) => {
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [showingBack9, setShowingBack9] = useState(showBack9);
  const [showPressSummary, setShowPressSummary] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  
  const toggleNine = () => {
    const toValue = showingBack9 ? 0 : -width;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setShowingBack9(!showingBack9);
  };

  // Helper function to calculate team totals for front 9, back 9, and total
  const calculateTeamTotals = (teamScores: (number | null)[]) => {
    const front9 = teamScores.slice(0, 9).reduce<number>((sum, score) => 
      sum + (score !== null ? score : 0), 
      0  // Initialize with 0
    );
    
    const back9 = teamScores.slice(9, 18).reduce<number>((sum, score) => 
      sum + (score !== null ? score : 0), 
      0  // Initialize with 0
    );
    
    return {
      front9,
      back9,
      // Fix: Ensure we're adding two numbers, not potentially null values
      total: front9 + back9
    };
  };
  
  // Get hole numbers as column headers
  const frontNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const backNine = [10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  // Ensure teams have fixed colors based on their order
  const teamsWithFixedColors = teams.map((team, idx) => {
    // Team ID might not always be the 1-based index as a string, so we need to map it
    const teamNumber = (idx + 1).toString();
    return {
      ...team,
      fixedColor: FIXED_TEAM_COLORS[teamNumber] || team.color
    };
  });

  // Add this function at the top level of the component
  const pressesWithOriginalBetFlags = presses.map(press => {
    // Check both hole index and press type to determine if it's an original bet
    const isOriginalBet = (press.holeIndex === 0 && (press.pressType === 'front9' || press.pressType === 'total18')) ||
                          (press.holeIndex === 9 && press.pressType === 'back9');
    return {
      ...press,
      isOriginalBet
    };
  });

  // Create a mock match object for the press summary modal
  const mockMatch = {
    id: matchId,
    title: 'Match Summary',
    teams: teamsWithFixedColors.map(team => ({
      id: team.id,
      name: team.name,
      initial: team.initial,
      color: team.fixedColor,
    })),
    presses: presses,
    holes: Array(18).fill(0).map((_, i) => ({
      number: i + 1,
      scores: teamsWithFixedColors.map(team => ({
        teamId: team.id,
        score: team.scores[i],
      })),
      isComplete: teams.some(team => team.scores[i] !== null),
      presses: [] // Add empty presses array to match Hole interface
    })),
    playFormat: 'match' as const,
    gameFormats: [
      { type: 'front', betAmount: 10 },
      { type: 'back', betAmount: 10 },
      { type: 'total', betAmount: 10 },
    ],
  };

  // Identify and flag original bets correctly based on their hole indices
  const pressesWithOriginalBets = presses.map(press => {
    // Check both hole index and press type to determine if it's an original bet
    if ((press.holeIndex === 0 && (press.pressType === 'front9' || press.pressType === 'total18')) ||
        (press.holeIndex === 9 && press.pressType === 'back9')) {
      return {
        ...press,
        isOriginalBet: true
      };
    }
    return press;
  });

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <View style={[
        styles.header, 
        { paddingTop: Platform.OS === 'ios' ? insets.top > 0 ? 0 : 8 : 8 }
      ]}>
        <TouchableOpacity 
          style={[styles.backButton, { marginLeft: insets.left }]} 
          onPress={onBack}
        >
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scorecard</Text>
        {presses.length > 0 && (
          <TouchableOpacity 
            style={[styles.pressButton, { marginRight: insets.right }]}
            onPress={() => setShowPressSummary(true)}
          >
            <DollarSign size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, !showingBack9 && styles.activeToggle]} 
          onPress={() => showingBack9 && toggleNine()}
        >
          <Text style={[styles.toggleText, !showingBack9 && styles.activeToggleText]}>
            Front 9
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, showingBack9 && styles.activeToggle]} 
          onPress={() => !showingBack9 && toggleNine()}
        >
          <Text style={[styles.toggleText, showingBack9 && styles.activeToggleText]}>
            Back 9
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Animated.View style={[styles.scrollContent, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.tableContainer}>
            {/* First Scorecard (Front 9) */}
            <View style={[styles.scorecard, { width }]}>
              {/* Scorecard Header */}
              <View style={styles.headerRow}>
                <View style={styles.nameCell}>
                  <Text style={styles.headerText}>Team</Text>
                </View>
                {frontNine.map(hole => (
                  <View key={`hole-${hole}`} style={styles.holeCell}>
                    <Text style={[styles.headerText, currentHole === hole && styles.currentHoleText]}>
                      {hole}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalCell}>
                  <Text style={styles.headerText}>F9</Text>
                </View>
              </View>
              
              {/* Team Scores */}
              {teamsWithFixedColors.map((team, idx) => {
                const totals = calculateTeamTotals(team.scores);
                return (
                  <View key={team.id} style={styles.scoreRow}>
                    <View style={styles.nameCell}>
                      <View style={[styles.teamCircle, { backgroundColor: team.fixedColor }]}>
                        <Text style={styles.teamInitial}>{team.initial}</Text>
                      </View>
                    </View>
                    
                    {frontNine.map((hole, holeIdx) => (
                      <View key={`${team.id}-hole-${hole}`} style={styles.holeCell}>
                        <Text style={styles.scoreText}>
                          {team.scores[holeIdx] !== null ? team.scores[holeIdx] : ''}
                        </Text>
                        <PressIndicator 
                          teamId={team.id}
                          holeNumber={hole}
                          presses={pressesWithOriginalBetFlags}
                          showBack9={false}
                          teams={teamsWithFixedColors}
                        />
                      </View>
                    ))}
                    
                    <View style={styles.totalCell}>
                      <Text style={styles.totalText}>{totals.front9}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            
            {/* Second Scorecard (Back 9) */}
            <View style={[styles.scorecard, { width }]}>
              {/* Scorecard Header */}
              <View style={styles.headerRow}>
                <View style={styles.nameCell}>
                  <Text style={styles.headerText}>Team</Text>
                </View>
                {backNine.map(hole => (
                  <View key={`hole-${hole}`} style={styles.holeCell}>
                    <Text style={[styles.headerText, currentHole === hole && styles.currentHoleText]}>
                      {hole}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalCell}>
                  <Text style={styles.headerText}>B9</Text>
                </View>
                <View style={styles.totalCell}>
                  <Text style={styles.headerText}>Tot</Text>
                </View>
              </View>
              
              {/* Team Scores */}
              {teamsWithFixedColors.map((team, idx) => {
                const totals = calculateTeamTotals(team.scores);
                return (
                  <View key={team.id} style={styles.scoreRow}>
                    <View style={styles.nameCell}>
                      <View style={[styles.teamCircle, { backgroundColor: team.fixedColor }]}>
                        <Text style={styles.teamInitial}>{team.initial}</Text>
                      </View>
                    </View>
                    
                    {backNine.map((hole, holeIdx) => (
                      <View key={`${team.id}-hole-${hole}`} style={styles.holeCell}>
                        <Text style={styles.scoreText}>
                          {team.scores[holeIdx + 9] !== null ? team.scores[holeIdx + 9] : ''}
                        </Text>
                        <PressIndicator 
                          teamId={team.id}
                          holeNumber={hole}
                          presses={pressesWithOriginalBetFlags}
                          showBack9={true}
                          teams={teamsWithFixedColors}
                        />
                      </View>
                    ))}
                    
                    <View style={styles.totalCell}>
                      <Text style={styles.totalText}>{totals.back9}</Text>
                    </View>
                    <View style={styles.totalCell}>
                      <Text style={styles.totalText}>{totals.total}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Press Notifications Overlay */}
      <PressNotification 
        presses={pressesWithOriginalBetFlags} 
        matchId={matchId} 
        showBack9={showingBack9}
        teams={teamsWithFixedColors.map(team => ({ id: team.id, color: team.fixedColor }))}
      />

      {showPressSummary && (
        <PressSummaryModal
          isVisible={showPressSummary}
          onClose={() => setShowPressSummary(false)}
          match={{
            ...mockMatch,
            // Use the presses with marked original bets
            presses: pressesWithOriginalBets,
            holes: mockMatch.holes.map(hole => ({...hole}))
          }}
          teamColors={FIXED_TEAM_COLORS}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777777',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    flexDirection: 'row',
  },
  tableContainer: {
    flexDirection: 'row',
  },
  scorecard: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#DDDDDD',
    paddingBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 8,
    alignItems: 'center',
  },
  nameCell: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeCell: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Add this to allow absolute positioning of the indicators
  },
  totalCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  currentHoleText: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  teamCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pressButton: {
    backgroundColor: '#FF9800',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});

export default ScorecardFlow;