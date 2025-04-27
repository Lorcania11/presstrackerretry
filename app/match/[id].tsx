// app/match/[id].tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  TouchableOpacity, 
  useColorScheme,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clipboard, Eye, X, DollarSign } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';
import { useMatchContext } from '@/context/MatchContext';
import ScorecardFlow from '@/components/ScorecardScreen/ScorecardFlow';
import ScoreInputModal from '@/components/match/ScoreInputModal';
import StepPressModal from '@/components/match/StepPressModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { calculateMatchPlay, calculateStrokePlay } from '@/utils/helpers';

// Extended MatchTeam interface to include color and initial
interface ExtendedMatchTeam {
  id: string;
  name: string;
  scores: (number | null)[];
  color: string;
  initial: string;
}

// Extended Match interface to match the expected type in MatchContext
interface Match {
  id: string;
  title: string;
  teams: ExtendedMatchTeam[];
  holes: any[];
  presses: any[];
  gameFormats: any[];
  playFormat: "match" | "stroke";
  enablePresses: boolean;
  createdAt: string;
  isComplete: boolean;
}

export default function MatchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();
  const { setCurrentMatch } = useMatchContext();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHole, setCurrentHole] = useState(1);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPressPrompt, setShowPressPrompt] = useState(false);
  const [scores, setScores] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (id) {
          const matchData = await getMatch(id.toString());
          if (matchData) {
            // Add team colors and initials if they don't exist
            const teamsWithColors = matchData.teams.map((team: any, index: number) => {
              const teamColors = ['#4CAE4F', '#FFC105', '#F44034'];
              return {
                ...team,
                color: team.color || teamColors[index % teamColors.length],
                initial: team.initial || team.name.charAt(0).toUpperCase()
              };
            });
            
            const enhancedMatch = {
              ...matchData,
              teams: teamsWithColors,
              presses: matchData.presses || []
            };
            
            setMatch(enhancedMatch);
            setCurrentMatch(enhancedMatch);
            
            // Find first incomplete hole
            if (matchData.holes) {
              const firstIncompleteHole = matchData.holes.find((hole: any) => !hole.isComplete);
              if (firstIncompleteHole) {
                setCurrentHole(firstIncompleteHole.number);
                
                // Initialize current scores from saved data
                const currentScores: {[key: string]: number} = {};
                firstIncompleteHole.scores.forEach((score: any) => {
                  if (score.score !== null) {
                    currentScores[score.teamId] = score.score;
                  }
                });
                setScores(currentScores);
              }
            }
          } else {
            throw new Error('Match not found');
          }
        }
      } catch (error) {
        console.error('Error loading match:', error);
        Alert.alert('Error', 'Failed to load match data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [id]);

  const handleAddPress = (selectedPresses: Array<{from: string, to: string, type: string, amount?: number}>) => {
    if (!match) return;
    
    // Process and add selected presses
    const newPresses = selectedPresses.map(press => ({
      id: Math.random().toString(36).substring(2, 9),
      fromTeamId: press.from,
      toTeamId: press.to,
      holeIndex: currentHole - 1,
      pressType: press.type,
      amount: press.amount
    }));
    
    const updatedMatch = {
      ...match,
      presses: [...match.presses, ...newPresses]
    };
    
    setMatch(updatedMatch);
    setCurrentMatch(updatedMatch);
    updateMatch(updatedMatch);
    
    setShowPressModal(false);
    setShowPressPrompt(false);
  };

  const handleSaveScores = async () => {
    if (!match) return;
    
    // Check if all teams have scores entered
    const allTeamsHaveScores = match.teams.every(team => 
      scores[team.id] !== undefined
    );
    
    if (!allTeamsHaveScores) {
      Alert.alert('Missing Scores', 'Please enter scores for all teams before proceeding.');
      return;
    }

    // Update teams with new scores
    const updatedTeams = match.teams.map(team => {
      const newScores = [...team.scores];
      if (scores[team.id] !== undefined) {
        newScores[currentHole - 1] = scores[team.id];
      }
      return { ...team, scores: newScores };
    });
    
    // Update hole data to mark as complete
    const updatedHoles = [...match.holes];
    if (updatedHoles[currentHole - 1]) {
      updatedHoles[currentHole - 1] = {
        ...updatedHoles[currentHole - 1],
        scores: match.teams.map(team => ({
          teamId: team.id,
          score: scores[team.id] || null,
        })),
        isComplete: true,
      };
    }
    
    const updatedMatch = { 
      ...match, 
      teams: updatedTeams,
      holes: updatedHoles
    };
    
    setMatch(updatedMatch);
    setCurrentMatch(updatedMatch);
    await updateMatch(updatedMatch);
    
    // Show press prompt if match has presses enabled
    if (match.enablePresses) {
      setShowPressPrompt(true);
    } else {
      proceedAfterSave();
    }
  };
  
  const proceedAfterSave = () => {
    // Clear scores for next hole
    setScores({});
    
    // Move to next hole automatically if not on hole 18
    if (currentHole < 18) {
      moveToNextHole();
    } else {
      Alert.alert('Match Complete', 'You have completed all 18 holes!');
    }
  };
  
  const handleScoreChange = (teamId: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [teamId]: value
    }));
  };
  
  const moveToPreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
      
      // Load scores from previous hole
      if (match?.holes[currentHole - 2]) {
        const holeScores: {[key: string]: number} = {};
        match.holes[currentHole - 2].scores.forEach((score: any) => {
          if (score.score !== null) {
            holeScores[score.teamId] = score.score;
          }
        });
        setScores(holeScores);
      }
    }
  };
  
  const moveToNextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
      
      // Load scores from next hole if they exist
      if (match?.holes[currentHole]) {
        const holeScores: {[key: string]: number} = {};
        match.holes[currentHole].scores.forEach((score: any) => {
          if (score.score !== null) {
            holeScores[score.teamId] = score.score;
          }
        });
        setScores(holeScores);
      } else {
        // Clear scores if moving to a new hole
        setScores({});
      }
    }
  };

  const renderMatchPreview = () => {
    if (!match) return null;

    const result = match.playFormat === 'match' 
      ? calculateMatchPlay(match.teams, match.holes || [])
      : calculateStrokePlay(match.teams, match.holes || []);

    return (
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Match Status
              </Text>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <X size={24} color={isDark ? '#FFFFFF' : '#333333'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollContent}>
              <Text style={[styles.statusText, { color: isDark ? '#4CAF50' : '#4CAF50' }]}>
                {result.status}
              </Text>
              
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Team Scores
              </Text>
              
              {match.teams.map(team => {
                const completedHoles = team.scores.filter(score => score !== null).length;
                const totalScore = team.scores.reduce((sum, score) => sum + (score || 0), 0);
                
                return (
                  <View key={team.id} style={styles.teamScoreRow}>
                    <View style={[styles.teamColorIndicator, { backgroundColor: team.color }]} />
                    <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      {team.name}
                    </Text>
                    <Text style={[styles.scoreText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                      {totalScore} ({completedHoles}/18 holes)
                    </Text>
                  </View>
                );
              })}
              
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333', marginTop: 16 }]}>
                Presses ({match.presses.length})
              </Text>
              
              {match.presses.length > 0 ? (
                match.presses.map((press, index) => {
                  const fromTeam = match.teams.find(t => t.id === press.fromTeamId);
                  const toTeam = match.teams.find(t => t.id === press.toTeamId);
                  
                  return (
                    <View key={index} style={styles.pressItem}>
                      <Text style={[styles.pressText, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                        {fromTeam?.name} → {toTeam?.name}
                      </Text>
                      <Text style={[styles.pressDetail, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                        Hole {press.holeIndex + 1}, {press.pressType === 'front' ? 'Front 9' : 
                         press.pressType === 'back' ? 'Back 9' : 'Total 18'} game
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={[styles.emptyText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  No presses added yet
                </Text>
              )}
              
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowPreviewModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderScorecardModal = () => {
    if (!match) return null;
    
    return (
      <Modal
        visible={showScorecardModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowScorecardModal(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
          <View style={styles.scorecardHeader}>
            <TouchableOpacity onPress={() => setShowScorecardModal(false)} style={styles.backButton}>
              <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#333333'} />
              <Text style={[styles.backButtonText, { color: isDark ? '#FFFFFF' : '#333333' }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.scorecardTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              Scorecard
            </Text>
          </View>
          
          <ScorecardFlow
            teams={match.teams}
            presses={match.presses}
            currentHole={currentHole}
            showBack9={currentHole > 9}
            matchId={match.id}
            onBack={() => setShowScorecardModal(false)}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  const renderPressPromptModal = () => {
    if (!match) return null;
    
    return (
      <Modal
        visible={showPressPrompt}
        transparent={true}
        animationType="slide"
      >
        <View style={[styles.modalContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }]}>
          <View style={[styles.promptModalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <View style={styles.promptHeader}>
              <Text style={[styles.promptTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Add Press?
              </Text>
            </View>
            
            <Text style={[styles.promptText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Would you like to add a press on this hole?
            </Text>
            
            <View style={styles.promptButtonsContainer}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptSecondaryButton]}
                onPress={() => {
                  setShowPressPrompt(false);
                  proceedAfterSave();
                }}
              >
                <Text style={[styles.promptButtonText, { color: isDark ? '#4CAF50' : '#4CAF50' }]}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.promptButton, styles.promptPrimaryButton]}
                onPress={() => {
                  setShowPressPrompt(false);
                  setShowPressModal(true);
                }}
              >
                <Text style={styles.promptPrimaryButtonText}>Yes, Add Press</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading || !match) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#333333' }}>Loading match...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              {match.title || 'Golf Match'}
            </Text>
            <Text style={styles.subtitle}>
              {match.teams.map(team => team.name).join(' vs ')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowPreviewModal(true)}
          >
            <Eye size={24} color={isDark ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowScorecardModal(true)}
          >
            <Clipboard size={24} color={isDark ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
        </View>

        {/* Hole Navigation */}
        <View style={styles.holeNavigation}>
          <TouchableOpacity 
            style={[styles.navButton, currentHole === 1 && styles.navButtonDisabled]}
            onPress={moveToPreviousHole}
            disabled={currentHole === 1}
          >
            <ChevronLeft size={24} color={currentHole === 1 ? '#888888' : isDark ? '#FFFFFF' : '#333333'} />
            <Text style={[styles.navButtonText, { color: currentHole === 1 ? '#888888' : isDark ? '#FFFFFF' : '#333333' }]}>
              Prev
            </Text>
          </TouchableOpacity>
          
          <View style={styles.holeIndicator}>
            <Text style={[styles.holeNumber, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              Hole {currentHole}
            </Text>
            <Text style={[styles.holePar, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Par 4
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.navButton, currentHole === 18 && styles.navButtonDisabled]}
            onPress={moveToNextHole}
            disabled={currentHole === 18}
          >
            <Text style={[styles.navButtonText, { color: currentHole === 18 ? '#888888' : isDark ? '#FFFFFF' : '#333333' }]}>
              Next
            </Text>
            <ChevronRight size={24} color={currentHole === 18 ? '#888888' : isDark ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
        </View>

        {/* Score Entry Section */}
        <ScrollView style={styles.scoreEntryContainer}>
          <Text style={[styles.scoreEntryTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
            Enter Scores for Hole {currentHole}
          </Text>
          
          {match.teams.map(team => (
            <View key={team.id} style={styles.scoreInputRow}>
              <View style={[styles.teamBadge, { backgroundColor: team.color }]}>
                <Text style={styles.teamInitial}>{team.initial}</Text>
              </View>
              <Text style={[styles.teamNameLarge, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                {team.name}
              </Text>
              
              <View style={styles.scoreControls}>
                <TouchableOpacity 
                  style={styles.scoreButton}
                  onPress={() => handleScoreChange(team.id, Math.max(1, (scores[team.id] || 4) - 1))}
                >
                  <Text style={styles.scoreButtonText}>-</Text>
                </TouchableOpacity>
                
                <Text style={[styles.scoreValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                  {scores[team.id] === undefined ? '–' : scores[team.id]}
                </Text>
                
                <TouchableOpacity 
                  style={styles.scoreButton}
                  onPress={() => handleScoreChange(team.id, (scores[team.id] || 4) + 1)}
                >
                  <Text style={styles.scoreButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.pressButton]}
            onPress={() => setShowPressModal(true)}
          >
            <DollarSign size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Press</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveScores}
          >
            <ArrowRight size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Save Scores</Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        {renderMatchPreview()}
        {renderScorecardModal()}
        {renderPressPromptModal()}
        
        <StepPressModal
          visible={showPressModal}
          onClose={() => setShowPressModal(false)}
          onSubmit={handleAddPress}
          teams={match.teams}
          gameFormats={match.gameFormats}
          currentHole={currentHole}
          isDarkMode={isDark}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  holeNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontWeight: '600',
  },
  holeIndicator: {
    alignItems: 'center',
  },
  holeNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  holePar: {
    fontSize: 14,
  },
  scoreEntryContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scoreEntryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  teamNameLarge: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  pressButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalScrollContent: {
    maxHeight: 400,
  },
  modalButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  teamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 14,
  },
  pressItem: {
    marginBottom: 8,
  },
  pressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressDetail: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  scorecardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scorecardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To balance the back button width
  },
  promptModalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  promptHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  promptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  promptButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  promptPrimaryButton: {
    backgroundColor: '#4CAF50',
  },
  promptSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  promptButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  promptPrimaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});