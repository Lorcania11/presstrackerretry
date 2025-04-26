// app/match/[id].tsx
import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  TouchableOpacity, 
  useColorScheme,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Share2, List } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';
import { useMatchContext } from '@/context/MatchContext';
import ScorecardFlow from '@/components/ScorecardScreen/ScorecardFlow';
import StepPressModal from '@/components/match/StepPressModal';
import ScoreInputModal from '@/components/match/ScoreInputModal';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function MatchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();
  const { setCurrentMatch, showBack9, setShowBack9 } = useMatchContext();

  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHole, setCurrentHole] = useState(1);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (id) {
          const matchData = await getMatch(id.toString());
          if (matchData) {
            // Add team colors and initials if they don't exist
            const teamsWithColors = matchData.teams.map((team, index) => {
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
              const firstIncompleteHole = matchData.holes.find(hole => !hole.isComplete);
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

  const handleSwipe = (direction) => {
    if (direction === 'left' && !showBack9) {
      setShowBack9(true);
    } else if (direction === 'right' && showBack9) {
      setShowBack9(false);
    }
  };

  const handleAddPress = (selectedPresses) => {
    // Process and add selected presses
    selectedPresses.forEach(press => {
      const updatedMatch = {
        ...match,
        presses: [...match.presses, {
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

  const handleSaveScores = async (scores) => {
    const updatedTeams = match.teams.map(team => {
      const newScores = [...team.scores];
      if (scores[team.id] !== undefined) {
        newScores[currentHole - 1] = scores[team.id];
      }
      return { ...team, scores: newScores };
    });
    
    const updatedMatch = { ...match, teams: updatedTeams };
    setMatch(updatedMatch);
    setCurrentMatch(updatedMatch);
    await updateMatch(updatedMatch);
    
    // Automatically move to next hole if all teams have scores for current hole
    const allTeamsHaveScores = updatedTeams.every(team => 
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
            style={styles.shareButton} 
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
  shareButton: {
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
});