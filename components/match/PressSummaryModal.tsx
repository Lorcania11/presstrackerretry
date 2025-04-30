import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronDown, ChevronUp, DollarSign } from 'lucide-react-native';
import { calculatePressResults, formatGameType } from '@/utils/helpers';

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
  
  const [groupedPresses, setGroupedPresses] = useState<GroupedPresses>({
    front9: [],
    back9: [],
    total18: [],
  });
  
  useEffect(() => {
    if (isVisible && match) {
      calculateAllPresses();
    }
  }, [
    isVisible, 
    match?.presses?.length, 
    match?.holes, 
    match?.id 
  ]);
  
  const calculateAllPresses = () => {
    if (!match || !match.presses || match.presses.length === 0) {
      setGroupedPresses({
        front9: [],
        back9: [],
        total18: [],
      });
      return;
    }

    const teams = match.teams.map(team => ({
      id: team.id,
      name: team.name,
      color: teamColors[team.id] || team.color || '#CCCCCC',
      scores: match.holes.map(hole => {
        const scoreEntry = hole.scores.find(s => s.teamId === team.id);
        return scoreEntry?.score !== undefined ? scoreEntry.score : null;
      })
    }));
    
    // Make sure each hole has a presses array to match the Hole interface
    const holesWithPresses = match.holes.map(hole => ({
      ...hole,
      presses: match.presses.filter(p => p.holeIndex === hole.number - 1)
    }));
    
    const hasCompletedHoles = match.holes.some(hole => hole.isComplete);
    
    if (!hasCompletedHoles) {
      setGroupedPresses({
        front9: [],
        back9: [],
        total18: [],
      });
      return;
    }
    
    // Process each press individually to ensure all are displayed
    const processedPresses = match.presses.map(press => {
      // Find which hole this press started on
      const pressHole = match.holes.find(h => h.number - 1 === press.holeIndex);
      const holeStarted = pressHole?.number || 1;
      
      // Create a temporary array with just this one press
      const singlePressHoles = holesWithPresses.map(hole => ({
        ...hole,
        // Only include this specific press in the hole's presses
        presses: hole.number === holeStarted ? [press] : []
      }));
      
      // Calculate results for just this press
      const results = calculatePressResults(teams, singlePressHoles, match.playFormat);
      return results.length > 0 ? results[0] : null;
    }).filter(Boolean); // Remove any null results
    
    const getBetAmount = (pressType: string): number => {
      const gameFormat = match.gameFormats.find(format => {
        if (pressType === 'front9' && format.type === 'front') return true;
        if (pressType === 'back9' && format.type === 'back') return true;
        if (pressType === 'total18' && format.type === 'total') return true;
        return false;
      });
      return gameFormat?.betAmount || 10;
    };
    
    const groupedResults: GroupedPresses = {
      front9: [],
      back9: [],
      total18: [],
    };
    
    processedPresses.forEach(press => {
      if (!press) return;
      
      const fromTeam = match.teams.find(team => team.id === press.fromTeamId);
      const toTeam = match.teams.find(team => team.id === press.toTeamId);
      
      if (!fromTeam || !toTeam) return;
      
      const pressWithDetails: PressWithResults = {
        ...press,
        fromTeamName: fromTeam.name,
        fromTeamColor: teamColors[(match.teams.findIndex(t => t.id === fromTeam.id) + 1).toString()] || fromTeam.color || '#CCCCCC',
        toTeamName: toTeam.name,
        toTeamColor: teamColors[(match.teams.findIndex(t => t.id === toTeam.id) + 1).toString()] || toTeam.color || '#CCCCCC',
        amount: getBetAmount(press.pressType),
        holeNumber: press.holeIndex + 1,
        isOriginalBet: press.isOriginalBet,
      };
      
      if (press.pressType === 'front9') {
        groupedResults.front9.push(pressWithDetails);
      } else if (press.pressType === 'back9') {
        groupedResults.back9.push(pressWithDetails);
      } else if (press.pressType === 'total18') {
        groupedResults.total18.push(pressWithDetails);
      }
    });
    
    // Sort presses so original bets come first, then by hole number
    Object.keys(groupedResults).forEach(key => {
      const groupKey = key as keyof GroupedPresses;
      groupedResults[groupKey].sort((a, b) => {
        if (a.isOriginalBet && !b.isOriginalBet) return -1;
        if (!a.isOriginalBet && b.isOriginalBet) return 1;
        return a.holeNumber - b.holeNumber;
      });
    });
    
    setGroupedPresses(groupedResults);
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const renderPressItem = (press: PressWithResults) => {
    const winningTeamId = press.winner;
    const winningTeam = winningTeamId 
      ? match.teams.find(team => team.id === winningTeamId)
      : null;
      
    const winningTeamName = winningTeam?.name || 'Tied';
    const isComplete = press.status.includes('wins');
    const statusColor = isComplete ? '#4CAF50' : '#FF9800';
    
    // Determine the hole range for this press
    const getPressRange = (press: PressWithResults): string => {
      const { pressType, holeNumber, isOriginalBet } = press;
      
      if (isOriginalBet) {
        if (pressType === 'front9') {
          return 'Original Bet: Front 9 (Holes 1-9)';
        } else if (pressType === 'back9') {
          return 'Original Bet: Back 9 (Holes 10-18)';
        } else if (pressType === 'total18') {
          return 'Original Bet: Total Game (Holes 1-18)';
        }
      }
      
      if (pressType === 'front9') {
        return `Press: Holes ${holeNumber}-9`;
      } else if (pressType === 'back9') {
        return `Press: Holes ${holeNumber}-18`;
      } else if (pressType === 'total18') {
        // Differentiate between presses on front 9 and back 9
        if (holeNumber >= 1 && holeNumber <= 9) {
          return `Press: Holes ${holeNumber}-18 (Total)`;
        } else {
          return `Press: Holes ${holeNumber}-18 (Back 9)`;
        }
      }
      
      return `Started hole ${holeNumber}`;
    };
    
    return (
      <View key={press.id} style={[
        styles.pressItem, 
        press.isOriginalBet && styles.originalBetItem
      ]}>
        <View style={styles.pressHeader}>
          <View style={styles.teamContainer}>
            <View style={[styles.teamIndicator, { backgroundColor: press.fromTeamColor }]} />
            <Text style={styles.teamName}>{press.fromTeamName}</Text>
            <Text style={styles.pressingText}>pressing</Text>
            <View style={[styles.teamIndicator, { backgroundColor: press.toTeamColor }]} />
            <Text style={styles.teamName}>{press.toTeamName}</Text>
          </View>
          
          <View style={styles.betAmount}>
            <DollarSign size={14} color="#666666" />
            <Text style={styles.betAmountText}>{press.amount}</Text>
          </View>
        </View>
        
        <View style={styles.pressDetails}>
          <Text style={styles.pressStarted}>
            {getPressRange(press)}
          </Text>
          <Text style={[styles.pressStatus, { color: statusColor }]}>
            {press.status}
          </Text>
        </View>
        
        {isComplete && winningTeamId && (
          <View style={[styles.winnerContainer, { borderColor: statusColor }]}>
            <Text style={[styles.winnerText, { color: statusColor }]}>
              {winningTeamName} wins ${press.amount}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  const renderSection = (title: string, presses: PressWithResults[], sectionKey: string) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          {isExpanded ? (
            <ChevronUp size={20} color="#333333" />
          ) : (
            <ChevronDown size={20} color="#333333" />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {presses.length === 0 ? (
              <Text style={styles.noPressesText}>No presses for {title}</Text>
            ) : (
              presses.map(press => renderPressItem(press))
            )}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
        <View 
          style={[
            styles.header, 
            { 
              paddingLeft: Math.max(16, insets.left),
              paddingRight: Math.max(16, insets.right),
              paddingTop: Platform.OS === 'ios' ? insets.top > 0 ? 0 : 12 : 12
            }
          ]}
        >
          <Text style={styles.title}>Press Summary</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <X size={24} color="#333333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={[
            styles.content, 
            {
              paddingLeft: Math.max(16, insets.left),
              paddingRight: Math.max(16, insets.right)
            }
          ]}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 20 : 16
          }}
        >
          {renderSection('Front 9 Presses', groupedPresses.front9, 'front9')}
          {renderSection('Back 9 Presses', groupedPresses.back9, 'back9')}
          {renderSection('Total 18 Presses', groupedPresses.total18, 'total18')}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  },
  originalBetItem: {
    backgroundColor: '#F0F8FF', // Light blue background to distinguish original bets
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
});

export default PressSummaryModal;
