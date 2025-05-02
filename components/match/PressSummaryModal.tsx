import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, X, DollarSign } from 'lucide-react-native';
import Modal from 'react-native-modal';

interface PressSummaryModalProps {
  isVisible: boolean;
  onClose: () => void;
  match: {
    id: string;
    title: string;
    teams: Array<{
      id: string;
      name: string;
      initial?: string;
      color?: string;
    }>;
    presses: Array<{
      id: string;
      fromTeamId: string;
      toTeamId: string;
      holeIndex: number;
      pressType: string;
      isOriginalBet?: boolean;
    }>;
    holes: Array<{
      number: number;
      scores: Array<{
        teamId: string;
        score: number | null;
      }>;
      isComplete: boolean;
    }>;
    playFormat: 'match' | 'stroke';
    gameFormats: Array<{
      type: string;
      betAmount: number;
    }>;
  };
  teamColors: Record<string, string>;
}

interface PressWithResults {
  id: string;
  fromTeamId: string;
  fromTeamName: string;
  fromTeamColor: string;
  toTeamId: string;
  toTeamName: string;
  toTeamColor: string;
  holeIndex: number;
  pressType: string;
  status: string;
  winner: string | null;
  amount: number;
  holeNumber: number;
  isOriginalBet?: boolean;
  netResult?: string;
}

interface GroupedPresses {
  front9: PressWithResults[];
  back9: PressWithResults[];
  total18: PressWithResults[];
}

const PressSummaryModal: React.FC<PressSummaryModalProps> = ({ 
  isVisible, 
  onClose, 
  match,
  teamColors 
}) => {
  const insets = useSafeAreaInsets();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    front9: true,
    back9: true,
    total18: true,
  });

  // Process presses to group them by type and calculate results
  const processedPresses = processPressesWithResults(match, teamColors);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modalContainer}
      backdropOpacity={0.5}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      swipeDirection="down"
      onSwipeComplete={onClose}
      propagateSwipe={true}
      avoidKeyboard={true}
      useNativeDriver={true}
      statusBarTranslucent
    >
      <View style={[
        styles.container, 
        { paddingTop: insets.top || 10, paddingBottom: insets.bottom || 10 }
      ]}>
        <View style={styles.header}>
          <Text style={styles.title}>Press Summary</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            accessibilityLabel="Close press summary"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Improve touch target
          >
            <X size={24} color="#333333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Front 9 Section */}
          {processedPresses.front9.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('front9')}
                accessibilityLabel={expandedSections.front9 ? "Collapse Front 9" : "Expand Front 9"}
                accessibilityRole="button"
              >
                <Text style={styles.sectionTitle}>Front 9</Text>
                {expandedSections.front9 ? 
                  <ChevronUp size={20} color="#333333" /> : 
                  <ChevronDown size={20} color="#333333" />
                }
              </TouchableOpacity>
              
              {expandedSections.front9 && (
                <View style={styles.sectionContent}>
                  {processedPresses.front9.map((press) => renderPressItem(press))}
                </View>
              )}
            </View>
          )}
          
          {/* Back 9 Section */}
          {processedPresses.back9.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('back9')}
                accessibilityLabel={expandedSections.back9 ? "Collapse Back 9" : "Expand Back 9"}
                accessibilityRole="button"
              >
                <Text style={styles.sectionTitle}>Back 9</Text>
                {expandedSections.back9 ? 
                  <ChevronUp size={20} color="#333333" /> : 
                  <ChevronDown size={20} color="#333333" />
                }
              </TouchableOpacity>
              
              {expandedSections.back9 && (
                <View style={styles.sectionContent}>
                  {processedPresses.back9.map((press) => renderPressItem(press))}
                </View>
              )}
            </View>
          )}
          
          {/* Total 18 Section */}
          {processedPresses.total18.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('total18')}
                accessibilityLabel={expandedSections.total18 ? "Collapse Total 18" : "Expand Total 18"}
                accessibilityRole="button"
              >
                <Text style={styles.sectionTitle}>Total 18</Text>
                {expandedSections.total18 ? 
                  <ChevronUp size={20} color="#333333" /> : 
                  <ChevronDown size={20} color="#333333" />
                }
              </TouchableOpacity>
              
              {expandedSections.total18 && (
                <View style={styles.sectionContent}>
                  {processedPresses.total18.map((press) => renderPressItem(press))}
                </View>
              )}
            </View>
          )}
          
          {/* Show message if no presses */}
          {processedPresses.front9.length === 0 && 
           processedPresses.back9.length === 0 && 
           processedPresses.total18.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.noPressesText}>No presses found for this match</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  function renderPressItem(press: PressWithResults) {
    const isWinner = !!press.winner;
    let statusColor = '#FF9800'; // Default (in progress)
    let winnerBorderColor = '#007AFF'; // Default
    
    if (press.status === 'completed') {
      statusColor = press.winner === 'tie' ? '#888888' : '#4CAF50';
    }
    
    if (press.winner === press.fromTeamId) {
      winnerBorderColor = press.fromTeamColor;
    } else if (press.winner === press.toTeamId) {
      winnerBorderColor = press.toTeamColor;
    }
    
    return (
      <View 
        key={press.id} 
        style={[
          styles.pressItem,
          press.isOriginalBet && styles.originalBetItem
        ]}
      >
        <View style={styles.pressHeader}>
          <View style={styles.teamContainer}>
            <View 
              style={[
                styles.teamIndicator, 
                { backgroundColor: press.fromTeamColor }
              ]} 
            />
            <Text style={styles.teamName}>{press.fromTeamName}</Text>
            <Text style={styles.pressingText}>pressing</Text>
            
            <View 
              style={[
                styles.teamIndicator, 
                { backgroundColor: press.toTeamColor }
              ]} 
            />
            <Text style={styles.teamName}>{press.toTeamName}</Text>
          </View>
          
          <View style={styles.betAmount}>
            <DollarSign size={14} color="#333333" />
            <Text style={styles.betAmountText}>{press.amount}</Text>
          </View>
        </View>
        
        <View style={styles.pressDetails}>
          <Text style={styles.pressStarted}>
            Started on hole {press.holeNumber}
          </Text>
          
          <Text style={[styles.pressStatus, { color: statusColor }]}>
            {press.status === 'in-progress' ? 'In Progress' : 
             press.status === 'completed' && press.winner === 'tie' ? 'Tied' : 
             'Completed'}
          </Text>
        </View>
        
        {press.status === 'in-progress' && press.netResult && (
          <View 
            style={[
              styles.winnerContainer, 
              { 
                borderColor: press.netResult.includes('up') ? '#4CAF50' : press.netResult === 'tied' ? '#888888' : '#FF9800',
                backgroundColor: Platform.OS === 'ios' ? 
                  press.netResult.includes('up') ? 'rgba(76,174,79,0.1)' : 
                  press.netResult === 'tied' ? 'rgba(136,136,136,0.1)' : 
                  'rgba(255,152,0,0.1)' : 'rgba(255,255,255,0.7)'
              }
            ]}
          >
            <Text 
              style={[
                styles.winnerText, 
                { 
                  color: press.netResult.includes('up') ? '#4CAF50' : 
                         press.netResult === 'tied' ? '#888888' : '#FF9800'
                }
              ]}
            >
              {press.netResult}
            </Text>
          </View>
        )}
        
        {isWinner && press.winner !== 'tie' && (
          <View 
            style={[
              styles.winnerContainer, 
              { 
                borderColor: winnerBorderColor,
                backgroundColor: Platform.OS === 'ios' ? `${winnerBorderColor}10` : 'rgba(255,255,255,0.7)'
              }
            ]}
          >
            <Text 
              style={[
                styles.winnerText, 
                { color: winnerBorderColor }
              ]}
            >
              {press.winner === press.fromTeamId ? press.fromTeamName : press.toTeamName} won
            </Text>
          </View>
        )}
        
        {isWinner && press.winner === 'tie' && (
          <View 
            style={[
              styles.winnerContainer, 
              { 
                borderColor: '#888888',
                backgroundColor: Platform.OS === 'ios' ? 'rgba(136,136,136,0.1)' : 'rgba(255,255,255,0.7)'
              }
            ]}
          >
            <Text style={[styles.winnerText, { color: '#888888' }]}>
              Tie - No winner
            </Text>
          </View>
        )}
      </View>
    );
  }
};

// Helper function to process presses with results
function processPressesWithResults(match: PressSummaryModalProps['match'], teamColors: Record<string, string>): GroupedPresses {
  // Map to quickly lookup team names
  const teamMap: Record<string, {name: string, color: string}> = {};
  match.teams.forEach((team, index) => {
    const teamNumber = (index + 1).toString();
    teamMap[team.id] = {
      name: team.name,
      color: teamColors[teamNumber] || team.color || '#CCCCCC'
    };
  });
  
  // Find appropriate bet amount for each press type
  const betAmounts: Record<string, number> = {};
  match.gameFormats.forEach(format => {
    if (format.type === 'front' || format.type === 'front9') {
      betAmounts['front9'] = format.betAmount;
    } else if (format.type === 'back' || format.type === 'back9') {
      betAmounts['back9'] = format.betAmount;
    } else if (format.type === 'total' || format.type === 'total18') {
      betAmounts['total18'] = format.betAmount;
    }
  });
  
  // Group and process presses
  const groupedPresses: GroupedPresses = {
    front9: [],
    back9: [],
    total18: []
  };
  
  match.presses.forEach(press => {
    // Skip presses without valid teams
    if (!teamMap[press.fromTeamId] || !teamMap[press.toTeamId]) return;
    
    // Process press details - ensure each pressType is properly normalized
    let normalizedPressType: string;
    if (press.pressType.includes('front')) {
      normalizedPressType = 'front9';
    } else if (press.pressType.includes('back')) {
      normalizedPressType = 'back9';
    } else if (press.pressType.includes('total')) {
      normalizedPressType = 'total18';
    } else {
      // If pressType doesn't match known types, use it as is
      normalizedPressType = press.pressType;
    }
    
    const holeNumber = press.holeIndex + 1;
    
    // Determine press status and winner
    let status = 'in-progress';
    let winner = null;
    
    // Logic to determine winner based on press type and hole completion
    if (normalizedPressType === 'front9' && 
        match.holes[8]?.isComplete) {
      status = 'completed';
      winner = determineWinner(press, match, 0, 8);
    } else if (normalizedPressType === 'back9' && 
              match.holes[17]?.isComplete) {
      status = 'completed';
      winner = determineWinner(press, match, 9, 17);
    } else if (normalizedPressType === 'total18' && 
              match.holes[17]?.isComplete) {
      status = 'completed';
      winner = determineWinner(press, match, 0, 17);
    }

    // Calculate net result for in-progress presses
    let netResult = undefined;
    if (status === 'in-progress') {
      // For front9, check holes 1 to current
      let fromTeamScore = 0;
      let toTeamScore = 0;
      let lastCompletedHole = 0;
      let scoreCountStartHole = 0;
      let scoreCountEndHole = 0;
      
      if (normalizedPressType === 'front9') {
        scoreCountStartHole = Math.max(press.holeIndex, 0); // Start from press hole for front9
        scoreCountEndHole = 8; // End at hole 9 (index 8)
      } else if (normalizedPressType === 'back9') {
        scoreCountStartHole = Math.max(press.holeIndex, 9); // Start from press hole for back9
        scoreCountEndHole = 17; // End at hole 18 (index 17)
      } else if (normalizedPressType === 'total18') {
        scoreCountStartHole = Math.max(press.holeIndex, 0); // Start from press hole for total18
        scoreCountEndHole = 17; // End at hole 18 (index 17)
      }
      
      // Find the last completed hole up to the end
      for (let i = scoreCountEndHole; i >= scoreCountStartHole; i--) {
        if (match.holes[i]?.isComplete) {
          lastCompletedHole = i;
          break;
        }
      }

      // Calculate scores up to the last completed hole
      for (let i = scoreCountStartHole; i <= lastCompletedHole; i++) {
        if (!match.holes[i]?.isComplete) continue;
        
        const fromTeamHoleScore = match.holes[i].scores.find(
          s => s.teamId === press.fromTeamId
        )?.score;
        
        const toTeamHoleScore = match.holes[i].scores.find(
          s => s.teamId === press.toTeamId
        )?.score;
        
        if (fromTeamHoleScore !== null && toTeamHoleScore !== null) {
          fromTeamScore += fromTeamHoleScore!;
          toTeamScore += toTeamHoleScore!;
        }
      }
      
      // Calculate who is up/down
      const holesPlayed = lastCompletedHole - scoreCountStartHole + 1;
      if (holesPlayed > 0) {
        if (fromTeamScore < toTeamScore) {
          const diff = toTeamScore - fromTeamScore;
          netResult = `${teamMap[press.fromTeamId].name} ${diff} up`;
        } else if (toTeamScore < fromTeamScore) {
          const diff = fromTeamScore - toTeamScore;
          netResult = `${teamMap[press.toTeamId].name} ${diff} up`;
        } else {
          netResult = 'tied';
        }
      }
    }
    
    const processedPress: PressWithResults = {
      id: press.id,
      fromTeamId: press.fromTeamId,
      fromTeamName: teamMap[press.fromTeamId].name,
      // Use consistent team colors from the teamMap
      fromTeamColor: teamMap[press.fromTeamId].color,
      toTeamId: press.toTeamId,
      toTeamName: teamMap[press.toTeamId].name,
      toTeamColor: teamMap[press.toTeamId].color,
      holeIndex: press.holeIndex,
      holeNumber,
      pressType: normalizedPressType,
      status,
      winner,
      amount: betAmounts[normalizedPressType] || 0,
      isOriginalBet: press.isOriginalBet,
      netResult
    };
    
    // Add to the appropriate group - ensure we keep all press types
    if (normalizedPressType === 'front9') {
      groupedPresses.front9.push(processedPress);
    } else if (normalizedPressType === 'back9') {
      groupedPresses.back9.push(processedPress);
    } else {
      groupedPresses.total18.push(processedPress);
    }
  });
  
  return groupedPresses;
}

// Helper function to determine winner
function determineWinner(press: PressSummaryModalProps['match']['presses'][0],
                        match: PressSummaryModalProps['match'],
                        startHoleIndex: number,
                        endHoleIndex: number): string | null {
  let fromTeamScore = 0;
  let toTeamScore = 0;
  
  // Calculate total scores for the relevant holes
  for (let i = startHoleIndex; i <= endHoleIndex; i++) {
    if (!match.holes[i]?.isComplete) continue;
    
    const fromTeamHoleScore = match.holes[i].scores.find(
      s => s.teamId === press.fromTeamId
    )?.score;
    
    const toTeamHoleScore = match.holes[i].scores.find(
      s => s.teamId === press.toTeamId
    )?.score;
    
    if (fromTeamHoleScore !== null && toTeamHoleScore !== null) {
      fromTeamScore += fromTeamHoleScore!;
      toTeamScore += toTeamHoleScore!;
    }
  }
  
  if (fromTeamScore < toTeamScore) {
    return press.fromTeamId; // Lower score wins in golf
  } else if (toTeamScore < fromTeamScore) {
    return press.toTeamId;
  } else {
    return 'tie';
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Use shadow for iOS, elevation for Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  sectionContent: {
    padding: 12,
  },
  pressItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    // iOS specific shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      }
    }),
  },
  originalBetItem: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  pressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  teamIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginRight: 8,
  },
  pressingText: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
    fontStyle: 'italic',
  },
  betAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  betAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 2,
  },
  pressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pressStarted: {
    fontSize: 12,
    color: '#666666',
  },
  pressStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  winnerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noPressesText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default PressSummaryModal;
