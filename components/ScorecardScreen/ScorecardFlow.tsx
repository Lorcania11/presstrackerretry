// components/ScorecardScreen/ScorecardFlow.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign } from 'lucide-react-native';
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
      total: front9 + back9
    };
  };
  
  // Get hole numbers
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

  // Ensure consistent identification of original bets
  const pressesWithOriginalBetFlags = presses.map(press => {
    // Check both hole index and press type to determine if it's an original bet
    // Original bets are:
    // - front9 or total18 presses on hole 1 (holeIndex 0)
    // - back9 presses on hole 10 (holeIndex 9)
    const isOriginalBet = (press.holeIndex === 0 && (press.pressType === 'front9' || press.pressType === 'total18')) ||
                           (press.holeIndex === 9 && press.pressType === 'back9');
    return {
      ...press,
      isOriginalBet
    };
  });

  // Identify and flag original bets correctly based on their hole indices
  const pressesWithOriginalBets = presses.map(press => {
    // Check both hole index and press type to determine if it's an original bet
    // Support multiple formats of press type naming
    const frontPressTypes = ['front9', 'front'];
    const backPressTypes = ['back9', 'back'];
    const totalPressTypes = ['total18', 'total'];
    
    if ((press.holeIndex === 0 && 
         (frontPressTypes.includes(press.pressType) || 
          totalPressTypes.includes(press.pressType))) ||
        (press.holeIndex === 9 && 
         backPressTypes.includes(press.pressType))) {
      return {
        ...press,
        isOriginalBet: true
      };
    }
    return press;
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
    presses: pressesWithOriginalBets, // Use the array with properly flagged bets
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
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.scrollContent, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.tableContainer}>
            {/* First Scorecard (Front 9) */}
            <View style={[styles.scorecard, { width }]}>
              {/* Team Headers Row */}
              <View style={styles.teamHeaderRow}>
                <View style={styles.holeColumn}>
                  <Text style={styles.headerText}>Hole</Text>
                </View>
                
                {teamsWithFixedColors.map((team) => (
                  <View key={`team-header-${team.id}`} style={styles.teamHeaderCell}>
                    <View style={[styles.teamCircle, { backgroundColor: team.fixedColor }]}>
                      <Text style={styles.teamInitial}>{team.initial}</Text>
                    </View>
                    <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                      {team.name}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Hole Rows */}
              {frontNine.map((holeNumber) => {
                // Adjust for zero-based indexing
                const holeIndex = holeNumber - 1;
                return (
                  <View 
                    key={`hole-${holeNumber}`} 
                    style={[
                      styles.holeRow,
                      currentHole === holeNumber && styles.currentHoleRow
                    ]}
                  >
                    <View style={styles.holeColumn}>
                      <Text style={[
                        styles.holeNumber, 
                        currentHole === holeNumber && styles.currentHoleText
                      ]}>
                        {holeNumber}
                      </Text>
                    </View>
                    
                    {teamsWithFixedColors.map((team) => (
                      <View key={`score-${team.id}-${holeNumber}`} style={styles.scoreCell}>
                        <Text style={styles.scoreText}>
                          {team.scores[holeIndex] !== null ? team.scores[holeIndex] : ''}
                        </Text>
                        <PressIndicator 
                          teamId={team.id}
                          holeNumber={holeNumber}
                          presses={pressesWithOriginalBetFlags}
                          showBack9={false}
                          teams={teamsWithFixedColors}
                        />
                      </View>
                    ))}
                  </View>
                );
              })}
              
              {/* Front 9 Totals Row */}
              <View style={styles.totalRow}>
                <View style={styles.holeColumn}>
                  <Text style={styles.totalLabel}>Front 9</Text>
                </View>
                
                {teamsWithFixedColors.map((team) => {
                  const totals = calculateTeamTotals(team.scores);
                  return (
                    <View key={`total-front-${team.id}`} style={styles.totalCell}>
                      <Text style={styles.totalText}>{totals.front9}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            
            {/* Second Scorecard (Back 9) */}
            <View style={[styles.scorecard, { width }]}>
              {/* Team Headers Row (Back 9) */}
              <View style={styles.teamHeaderRow}>
                <View style={styles.holeColumn}>
                  <Text style={styles.headerText}>Hole</Text>
                </View>
                
                {teamsWithFixedColors.map((team) => (
                  <View key={`team-header-back-${team.id}`} style={styles.teamHeaderCell}>
                    <View style={[styles.teamCircle, { backgroundColor: team.fixedColor }]}>
                      <Text style={styles.teamInitial}>{team.initial}</Text>
                    </View>
                    <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                      {team.name}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Hole Rows (Back 9) */}
              {backNine.map((holeNumber) => {
                // Adjust for zero-based indexing
                const holeIndex = holeNumber - 1;
                return (
                  <View 
                    key={`hole-${holeNumber}`} 
                    style={[
                      styles.holeRow,
                      currentHole === holeNumber && styles.currentHoleRow
                    ]}
                  >
                    <View style={styles.holeColumn}>
                      <Text style={[
                        styles.holeNumber, 
                        currentHole === holeNumber && styles.currentHoleText
                      ]}>
                        {holeNumber}
                      </Text>
                    </View>
                    
                    {teamsWithFixedColors.map((team) => (
                      <View key={`score-${team.id}-${holeNumber}`} style={styles.scoreCell}>
                        <Text style={styles.scoreText}>
                          {team.scores[holeIndex] !== null ? team.scores[holeIndex] : ''}
                        </Text>
                        <PressIndicator 
                          teamId={team.id}
                          holeNumber={holeNumber}
                          presses={pressesWithOriginalBetFlags}
                          showBack9={true}
                          teams={teamsWithFixedColors}
                        />
                      </View>
                    ))}
                  </View>
                );
              })}
              
              {/* Back 9 Totals Row */}
              <View style={styles.totalRow}>
                <View style={styles.holeColumn}>
                  <Text style={styles.totalLabel}>Back 9</Text>
                </View>
                
                {teamsWithFixedColors.map((team) => {
                  const totals = calculateTeamTotals(team.scores);
                  return (
                    <View key={`total-back-${team.id}`} style={styles.totalCell}>
                      <Text style={styles.totalText}>{totals.back9}</Text>
                    </View>
                  );
                })}
              </View>
              
              {/* Total 18 Totals Row */}
              <View style={styles.totalRow}>
                <View style={styles.holeColumn}>
                  <Text style={styles.totalLabel}>Total</Text>
                </View>
                
                {teamsWithFixedColors.map((team) => {
                  const totals = calculateTeamTotals(team.scores);
                  return (
                    <View key={`total-all-${team.id}`} style={styles.totalCell}>
                      <Text style={styles.totalText}>{totals.total}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Press Notifications Overlay */}
      <PressNotification 
        presses={pressesWithOriginalBetFlags} 
        matchId={matchId} 
        showBack9={showingBack9}
        teams={teamsWithFixedColors.map(team => ({ id: team.id, color: team.fixedColor, name: team.name }))}
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
  pressButton: {
    backgroundColor: '#FF9800',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  teamHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  holeRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  currentHoleRow: {
    backgroundColor: '#F0F8FF',
  },
  holeColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555555',
  },
  currentHoleText: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    lineHeight: 28,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // To allow for positioning of PressIndicator
    minHeight: 32,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    marginTop: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  totalCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  teamCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555555',
    textAlign: 'center',
    maxWidth: 80,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777777',
  },
});

export default ScorecardFlow;