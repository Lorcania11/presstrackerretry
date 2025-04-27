// components/ScorecardScreen/ScorecardFlow.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Svg, Line, Circle } from 'react-native-svg';
import { router } from 'expo-router';

interface ScorecardFlowProps {
  teams: Array<{
    id: string;
    name: string;
    initial: string;
    color: string;
    scores: Array<number | null>;
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
  onBack?: () => void;
  matchId: string;
}

export default function ScorecardFlow({
  teams,
  presses,
  currentHole,
  showBack9,
  onBack,
  matchId,
}: ScorecardFlowProps) {
  const { width, height } = Dimensions.get('window');
  
  // Calculate running totals for front 9, back 9, and total
  const totals = teams.map(team => {
    const front9 = team.scores.slice(0, 9).reduce((sum: number, score) => 
      sum + (score !== null ? score : 0), 0);
    
    const back9 = team.scores.slice(9, 18).reduce((sum: number, score) => 
      sum + (score !== null ? score : 0), 0);
    
    return {
      teamId: team.id,
      front9,
      back9,
      total: front9 + back9
    };
  });

  // Filter presses based on front 9 or back 9
  const filteredPresses = presses.filter(press => {
    const holeIndex = press.holeIndex;
    return showBack9 ? holeIndex >= 9 && holeIndex < 18 : holeIndex < 9;
  });

  // Get the currently displayed holes
  const displayedHoles = showBack9 
    ? [...Array(9)].map((_, i) => i + 10) 
    : [...Array(9)].map((_, i) => i + 1);

  const handlePressLogPress = () => {
    if (matchId) {
      router.push(`/match/press-log/${matchId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.chevron}>←</Text>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Scorecard</Text>
        
        <TouchableOpacity 
          onPress={handlePressLogPress} 
          style={styles.pressLogButton}
        >
          <Text style={styles.pressLogButtonText}>Press Log</Text>
        </TouchableOpacity>
      </View>

      {/* Team Avatars */}
      <View style={styles.teamRow}>
        {teams.map(team => (
          <View key={team.id} style={styles.teamAvatarContainer}>
            <View style={[styles.teamAvatar, { backgroundColor: team.color }]}>
              <Text style={styles.teamInitial}>{team.initial}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
              {team.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Scorecard */}
      <ScrollView 
        style={styles.scorecardContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hole Numbers Row */}
        <View style={styles.scoreRow}>
          <View style={styles.holeCell}>
            <Text style={styles.holeLabel}>Hole</Text>
          </View>
          
          {displayedHoles.map(hole => (
            <View key={`hole-${hole}`} style={styles.scoreCell}>
              <Text style={styles.holeNumber}>{hole}</Text>
            </View>
          ))}
          
          <View style={styles.totalCell}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.rangeLabel}>{showBack9 ? '10-18' : '1-9'}</Text>
            </View>
          </View>
        </View>

        {/* Separator Line */}
        <View style={styles.separatorLine} />

        {/* Team Scores */}
        {teams.map((team, teamIndex) => (
          <View key={team.id}>
            <View style={styles.scoreRow}>
              <View style={[styles.teamIndicatorCell, { backgroundColor: team.color }]}>
                <Text style={styles.teamInitialSmall}>{team.initial}</Text>
              </View>
              
              {team.scores
                .slice(showBack9 ? 9 : 0, showBack9 ? 18 : 9)
                .map((score, index) => (
                  <View 
                    key={`score-${index}`} 
                    style={styles.scoreCell}
                  >
                    <Text style={styles.scoreText}>
                      {score !== null ? score : '-'}
                    </Text>
                    
                    {/* Press Indicators */}
                    {filteredPresses
                      .filter(p => 
                        p.toTeamId === team.id && 
                        p.holeIndex === (index + (showBack9 ? 9 : 0))
                      )
                      .map((p, pIdx) => (
                        <View 
                          key={`press-${team.id}-${index}-${pIdx}`}
                          style={[
                            styles.pressIndicator, 
                            { 
                              backgroundColor: teams.find(t => t.id === p.fromTeamId)?.color || team.color 
                            }
                          ]} 
                        />
                      ))
                    }
                  </View>
                ))}

              <View style={styles.totalCell}>
                <Text style={styles.totalScore}>
                  {showBack9 ? 
                    totals.find(t => t.teamId === team.id)?.back9 : 
                    totals.find(t => t.teamId === team.id)?.front9}
                </Text>
                <Text style={styles.totalScore}>
                  {totals.find(t => t.teamId === team.id)?.total}
                </Text>
              </View>
            </View>
            
            {teamIndex < teams.length - 1 && (
              <View style={styles.teamSeparator} />
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 18,
    color: '#007AFF',
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pressLogButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressLogButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  teamAvatarContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamInitialSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamName: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 100,
  },
  scorecardContainer: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  holeCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  teamIndicatorCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  totalCell: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  holeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  holeNumber: {
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rangeLabel: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
  },
  totalScore: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 2,
  },
  separatorLine: {
    height: 2,
    backgroundColor: '#333333',
    opacity: 0.2,
    marginVertical: 4,
  },
  teamSeparator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 4,
  },
  pressIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});