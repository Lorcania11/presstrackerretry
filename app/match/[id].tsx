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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Share2, List, Eye, X } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';
import { useMatchContext } from '@/context/MatchContext';
import ScorecardFlow from '@/components/ScorecardScreen/ScorecardFlow';
import ScoreInputModal from '@/components/match/ScoreInputModal';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { MatchData } from '@/components/match/types';
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
interface Match extends Omit<MatchData, 'teams'> {
  playFormat: "match" | "stroke";
  createdAt: string;
  isComplete: boolean;
  teams: ExtendedMatchTeam[];
}

// Temporary component until StepPressModal is created
const StepPressModal = ({ visible, onClose, onSubmit, teams, gameFormats, currentHole }: any) => (
  <View>
    <Text>Press Modal Placeholder</Text>
  </View>
);

export default function MatchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();
  const { setCurrentMatch, showBack9, setShowBack9 } = useMatchContext();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHole, setCurrentHole] = useState(1);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
                // Set showBack9 based on current hole
                setShowBack9(firstIncompleteHole.number > 9);
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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && !showBack9) {
      setShowBack9(true);
    } else if (direction === 'right' && showBack9) {
      setShowBack9(false);
    }
  };

  const handleAddPress = (selectedPresses: Array<{from: string, to: string, type: string}>) => {
    // Process and add selected presses
    selectedPresses.forEach((press) => {
      const updatedMatch = {
        ...match!,
        presses: [...match!.presses, {
          id: Math.random().toString(36).substring(2, 9),
          fromTeamId: press.from,
          toTeamId: press.to,
          holeIndex: currentHole - 1,
          pressType: press.type
        }]
      };
      setMatch(updatedMatch);
      setCurrentMatch(updatedMatch);
      updateMatch(updatedMatch);
    });
    
    setShowPressModal(false);
  };

  const handleSaveScores = async (scores: { [teamId: string]: number }) => {
    const updatedTeams = match!.teams.map((team: ExtendedMatchTeam) => {
      const newScores = [...team.scores];
      if (scores[team.id] !== undefined) {
        newScores[currentHole - 1] = scores[team.id];
      }
      return { ...team, scores: newScores };
    });
    
    const updatedMatch = { ...match!, teams: updatedTeams };
    setMatch(updatedMatch);
    setCurrentMatch(updatedMatch);
    await updateMatch(updatedMatch);
    
    // Automatically move to next hole if all teams have scores for current hole
    const allTeamsHaveScores = updatedTeams.every((team: ExtendedMatchTeam) => 
      team.scores[currentHole - 1] !== null && team.scores[currentHole - 1] !== undefined
    );
    
    if (allTeamsHaveScores && currentHole < 18) {
      const nextHole = currentHole + 1;
      setCurrentHole(nextHole);
      
      // Update showBack9 if moving from front 9 to back 9
      if (nextHole === 10) {
        setShowBack9(true);
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
          <View style={[styles.previewCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Match Preview
              </Text>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <X size={24} color={isDark ? '#FFFFFF' : '#333333'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.previewContent}>
              <Text style={[styles.statusText, { color: isDark ? '#4CAF50' : '#4CAF50' }]}>
                {result.status}
              </Text>
              
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Team Scores
              </Text>
              
              {match.teams.map(team => {
                const completedHoles = team.scores.filter(score => score !== null).length;
                const totalScore = team.scores.reduce((sum: number, score) => sum + (score || 0), 0);
                
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
              style={styles.closeButton}
              onPress={() => setShowPreviewModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
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
            onPress={() => router.push(`/match/press-log/${id}`)}
          >
            <List size={24} color={isDark ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
        </View>

        <Swipeable
          onSwipeableOpen={(direction) => handleSwipe(direction === 'right' ? 'right' : 'left')}
          renderLeftActions={() => showBack9 ? <View style={styles.swipeIndicator} /> : null}
          renderRightActions={() => !showBack9 ? <View style={styles.swipeIndicator} /> : null}
          overshootLeft={false}
          overshootRight={false}
        >
          <ScorecardFlow
            teams={match.teams}
            presses={match.presses}
            currentHole={currentHole}
            showBack9={showBack9}
            matchId={match.id}
            onBack={() => router.back()}
          />
        </Swipeable>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.pressButton]}
            onPress={() => setShowPressModal(true)}
          >
            <Text style={styles.actionButtonText}>Add Press</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.scoreButton]}
            onPress={() => setShowScoreModal(true)}
          >
            <Text style={styles.actionButtonText}>Enter Scores</Text>
          </TouchableOpacity>
        </View>

        {renderMatchPreview()}
        
        {showPressModal && (
          <StepPressModal
            visible={showPressModal}
            onClose={() => setShowPressModal(false)}
            onSubmit={handleAddPress}
            teams={match.teams}
            gameFormats={match.gameFormats}
            currentHole={currentHole}
          />
        )}
        
        <ScoreInputModal
          visible={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          teams={match.teams}
          currentHole={currentHole}
          onSaveScores={handleSaveScores}
        />
      </View>
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
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
  },
  swipeIndicator: {
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  pressButton: {
    backgroundColor: '#4CAF50',
  },
  scoreButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: '90%',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewContent: {
    maxHeight: '70%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});