// app/match/[id].tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import { Match, Team, Hole } from '@/context/MatchContext';
import StepPressModal from '@/components/match/StepPressModal';
import ScorecardFlow from '@/components/ScorecardScreen/ScorecardFlow';
import { ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react-native';

// Define fixed team colors (important for consistent team identification)
const FIXED_TEAM_COLORS: Record<string, string> = {
  '1': '#4CAE4F', // Team 1 - Green
  '2': '#FFC105', // Team 2 - Yellow
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScorecardFlow, setShowScorecardFlow] = useState(false);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [showPressModal, setShowPressModal] = useState(false);
  const [scores, setScores] = useState<{[teamId: string]: string}>({});
  const [showBack9, setShowBack9] = useState(false);
  const [currentHoleSaved, setCurrentHoleSaved] = useState<boolean>(false);

  // Map to keep track of team IDs to fixed colors
  const [teamFixedColors, setTeamFixedColors] = useState<{[teamId: string]: string}>({});

  useEffect(() => {
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    if (!id) {
      Alert.alert('Error', 'Match ID not found');
      router.back();
      return;
    }

    try {
      const loadedMatch = await getMatch(id.toString());
      if (!loadedMatch) {
        Alert.alert('Error', 'Match not found');
        router.back();
        return;
      }
      setMatch(loadedMatch);
      
      // Assign fixed colors to teams based on their order
      const fixedColors: {[teamId: string]: string} = {};
      loadedMatch.teams.forEach((team, idx) => {
        const teamNumber = (idx + 1).toString();
        fixedColors[team.id] = FIXED_TEAM_COLORS[teamNumber] || team.color;
      });
      setTeamFixedColors(fixedColors);
      
      // Initialize the scores state with current scores for this hole
      initializeScores(loadedMatch, currentHoleIndex);
    } catch (error) {
      Alert.alert('Error', 'Failed to load match');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeScores = (match: Match, holeIndex: number) => {
    const hole = match.holes[holeIndex];
    if (!hole) return;
    
    const initialScores = match.teams.reduce((obj, team) => {
      const scoreEntry = hole.scores.find(s => s.teamId === team.id);
      obj[team.id] = scoreEntry?.score !== null ? String(scoreEntry.score) : '';
      return obj;
    }, {} as {[teamId: string]: string});
    
    setScores(initialScores);
  };

  const handleScoreChange = (teamId: string, value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setScores(prev => ({ ...prev, [teamId]: value }));
    }
  };

  const handlePrevHole = () => {
    if (currentHoleIndex > 0) {
      const newIndex = currentHoleIndex - 1;
      setCurrentHoleIndex(newIndex);
      initializeScores(match!, newIndex);
      setCurrentHoleSaved(false);
      
      if (newIndex === 8) {
        setShowBack9(false);
      }
    }
  };

  const handleNextHole = () => {
    if (!match || currentHoleIndex >= 17) return;
    
    // Save current hole scores first if not already saved
    if (!currentHoleSaved) {
      saveCurrentHoleScores(false);
    }
    
    const newIndex = currentHoleIndex + 1;
    setCurrentHoleIndex(newIndex);
    initializeScores(match, newIndex);
    setCurrentHoleSaved(false); // Reset for the new hole
    
    if (newIndex === 9) {
      setShowBack9(true);
    }
  };

  const saveCurrentHoleScores = (showPressModalAfter: boolean = true) => {
    if (!match) return;
    
    // Convert string scores to numbers (or null if empty)
    const numericScores = Object.entries(scores).reduce((obj, [teamId, scoreStr]) => {
      obj[teamId] = scoreStr ? parseInt(scoreStr, 10) : null;
      return obj;
    }, {} as {[teamId: string]: number | null});
    
    const isHoleComplete = Object.values(numericScores).every(score => score !== null);
    
    const updatedHoles = match.holes.map((hole, index) => {
      if (index === currentHoleIndex) {
        return {
          ...hole,
          scores: hole.scores.map(scoreEntry => ({
            ...scoreEntry,
            score: numericScores[scoreEntry.teamId]
          })),
          isComplete: isHoleComplete
        };
      }
      return hole;
    });
    
    const updatedMatch = { ...match, holes: updatedHoles };
    setMatch(updatedMatch);
    updateMatch(updatedMatch);
    
    // Mark the current hole as saved if all scores are entered
    if (isHoleComplete) {
      setCurrentHoleSaved(true);
    }
    
    // Show press modal if this is a completed hole
    if (showPressModalAfter && match.enablePresses && isHoleComplete) {
      setShowPressModal(true);
    }
  };

  const handleSave = () => {
    saveCurrentHoleScores(true);
  };

  const handlePressModalClose = () => {
    setShowPressModal(false);
    
    // This function should just close the modal without automatic navigation
    // We'll let the users manually navigate to next hole after adding all desired presses
  };

  const handleSavePresses = (updatedHole: Hole) => {
    if (!match) return;
    
    const updatedHoles = match.holes.map((hole, index) => 
      index === currentHoleIndex ? updatedHole : hole
    );
    const updatedMatch = { ...match, holes: updatedHoles };
    setMatch(updatedMatch);
    updateMatch(updatedMatch);
    setShowPressModal(false);
    
    // Move to next hole automatically after press modal closes
    if (currentHoleIndex < 17) {
      const newIndex = currentHoleIndex + 1;
      setCurrentHoleIndex(newIndex);
      initializeScores(updatedMatch, newIndex);
      setShowBack9(true);
    }
  };

  const handleSavePress = (press: Omit<any, 'id'>) => {
    if (!match) return;
    
    // Generate a unique ID for the press
    const newPress = {
      ...press,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    // Add the press to the match presses array
    const updatedMatch = {
      ...match,
      presses: [...match.presses, newPress],
    };
    
    setMatch(updatedMatch);
    updateMatch(updatedMatch);
    
    // Don't close modal here - let the modal handle its own closure
    // handlePressModalClose will be called when the modal itself decides to close
  };

  const handleOpenScorecard = () => {
    setShowScorecardFlow(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  if (showScorecardFlow) {
    return (
      <ScorecardFlow
        teams={match.teams.map((team, idx) => ({
          id: team.id,
          name: team.name,
          initial: team.initial || team.name.charAt(0).toUpperCase(),
          color: teamFixedColors[team.id] || team.color, // Use fixed color mapping
          scores: match.holes.map(hole => {
            const score = hole.scores.find(s => s.teamId === team.id)?.score;
            return score;
          })
        }))}
        presses={match.presses}
        currentHole={currentHoleIndex + 1}
        showBack9={showBack9}
        onBack={() => setShowScorecardFlow(false)}
        matchId={id as string}
      />
    );
  }

  const currentHole = match.holes[currentHoleIndex];
  const holeNumber = currentHoleIndex + 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{match.title}</Text>
        <TouchableOpacity style={styles.scorecardButton} onPress={handleOpenScorecard}>
          <Text style={styles.scorecardButtonText}>View Scorecard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreInputContainer}>
        <Text style={styles.holeTitle}>Enter Scores - Hole {holeNumber}</Text>
        
        <ScrollView style={styles.teamsContainer}>
          {match.teams.map((team, idx) => {
            // Use fixed team color based on team order (first team green, second team yellow)
            const teamColor = teamFixedColors[team.id] || team.color;
            
            return (
              <View key={team.id} style={styles.teamRow}>
                <View style={styles.teamInfo}>
                  <View style={[styles.teamCircle, { backgroundColor: teamColor }]}>
                    <Text style={styles.teamInitial}>
                      {team.initial || team.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.teamName}>{team.name}</Text>
                </View>
                
                <TextInput
                  style={styles.scoreInput}
                  keyboardType="numeric"
                  maxLength={2}
                  value={scores[team.id] || ''}
                  onChangeText={(value) => handleScoreChange(team.id, value)}
                  placeholder="0"
                  placeholderTextColor="#888888"
                />
              </View>
            );
          })}
        </ScrollView>
        
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[
              styles.navigationButton, 
              currentHoleIndex === 0 && styles.disabledButton
            ]} 
            onPress={handlePrevHole}
            disabled={currentHoleIndex === 0}
          >
            <ArrowLeft size={20} color={currentHoleIndex === 0 ? "#999999" : "#FFFFFF"} />
            <Text style={[
              styles.navigationButtonText,
              currentHoleIndex === 0 && styles.disabledButtonText
            ]}>
              Previous Hole
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Scores</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navigationButton,
              currentHoleIndex === 17 && styles.disabledButton
            ]} 
            onPress={handleNextHole}
            disabled={currentHoleIndex === 17}
          >
            <Text style={[
              styles.navigationButtonText,
              currentHoleIndex === 17 && styles.disabledButtonText
            ]}>
              Next Hole
            </Text>
            <ArrowRight size={20} color={currentHoleIndex === 17 ? "#999999" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>
      </View>

      {currentHoleSaved && currentHoleIndex < 17 && (
        <View style={styles.nextHoleContainer}>
          <TouchableOpacity 
            style={styles.nextHoleButton}
            onPress={handleNextHole}
          >
            <Text style={styles.nextHoleButtonText}>Next Hole</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {showPressModal && (
        <StepPressModal
          isVisible={showPressModal}
          hole={currentHole}
          teams={match.teams.map(team => ({
            ...team,
            color: teamFixedColors[team.id] || team.color
          }))}
          onClose={handlePressModalClose}
          onSave={handleSavePress}
          teamColors={FIXED_TEAM_COLORS}
          gameFormats={match.gameFormats.map(format => ({
            ...format,
            label: format.type === 'front' ? 'Front 9' : 
                   format.type === 'back' ? 'Back 9' : 
                   format.type === 'total' ? 'Total 18' : format.type
          }))}
        />
      )}
    </SafeAreaView>
  );
}

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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  scorecardButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorecardButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  scoreInputContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  holeTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  teamsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  teamName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  scoreInput: {
    width: 60,
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    fontSize: 18,
    textAlign: 'center',
    color: '#333333',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navigationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
    marginRight: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  disabledButtonText: {
    color: '#999999',
  },
  nextHoleContainer: {
    padding: 16,
    alignItems: 'center',
  },
  nextHoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextHoleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});