// app/match/[id].tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  useWindowDimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import { Match, Team, Hole } from '@/context/MatchContext';
import StepPressModal from '@/components/match/StepPressModal';
import ScoreInputModal from '@/components/match/ScoreInputModal';
import { calculateNetScore, formatCurrency } from '@/utils/helpers';
import { ChevronLeft, Flag, Edit2, DollarSign } from 'lucide-react-native';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getMatchById, updateMatch } = useMatches();
  const dimensions = useWindowDimensions();

  const [match, setMatch] = useState<Match | null>(null);
  const [selectedHole, setSelectedHole] = useState<Hole | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      const loadedMatch = await getMatchById(id.toString());
      if (!loadedMatch) {
        Alert.alert('Error', 'Match not found');
        router.back();
        return;
      }
      setMatch(loadedMatch);
    } catch (error) {
      Alert.alert('Error', 'Failed to load match');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreUpdate = (holeNumber: number, teamId: string, score: number | null) => {
    if (!match) return;

    const updatedHoles = match.holes.map(hole => {
      if (hole.number === holeNumber) {
        return {
          ...hole,
          scores: hole.scores.map(score => {
            if (score.teamId === teamId) {
              return { ...score, score: score.score };
            }
            return score;
          })
        };
      }
      return hole;
    });

    const updatedMatch = { ...match, holes: updatedHoles };
    setMatch(updatedMatch);
    updateMatch(updatedMatch);
  };

  const openScoreInput = (hole: Hole, teamId: string) => {
    setSelectedHole(hole);
    setSelectedTeam(teamId);
    setShowScoreModal(true);
  };

  const closeScoreModal = () => {
    setSelectedHole(null);
    setSelectedTeam(null);
    setShowScoreModal(false);
  };

  const openPressModal = (hole: Hole) => {
    setSelectedHole(hole);
    setShowPressModal(true);
  };

  const closePressModal = () => {
    setSelectedHole(null);
    setShowPressModal(false);
  };

  const handleSaveScore = (score: number) => {
    if (selectedHole && selectedTeam) {
      const updatedHoles = match!.holes.map(hole => {
        if (hole.number === selectedHole.number) {
          return {
            ...hole,
            scores: hole.scores.map(scoreEntry => {
              if (scoreEntry.teamId === selectedTeam) {
                return { ...scoreEntry, score: score };
              }
              return scoreEntry;
            }),
            isComplete: hole.scores.every(s => 
              s.teamId === selectedTeam ? score !== null : s.score !== null
            )
          };
        }
        return hole;
      });

      const updatedMatch = { ...match!, holes: updatedHoles };
      setMatch(updatedMatch);
      updateMatch(updatedMatch);
    }
    closeScoreModal();
  };

  const isHoleCompleted = (hole: Hole) => {
    return hole.scores.every(s => s.score !== null);
  };

  const getHoleScore = (hole: Hole, teamId: string) => {
    const score = hole.scores.find(s => s.teamId === teamId)?.score;
    return score !== null && score !== undefined ? score : '-';
  };

  const getTeamTotal = (teamId: string) => {
    if (!match) return '-';
    const teamScores = match.holes.map(hole => {
      const scoreEntry = hole.scores.find(s => s.teamId === teamId);
      return scoreEntry?.score;
    });
    const validScores = teamScores.filter(score => score !== null && score !== undefined) as number[];
    if (validScores.length === 0) return '-';
    return validScores.reduce((sum, score) => sum + score, 0);
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

  const isColumnAvailable = (i: number) => i < 9 || dimensions.width >= 768;
  const displayedHoles = match.holes.filter((_, i) => isColumnAvailable(i));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{match.title}</Text>
      </View>

      <ScrollView style={styles.container} horizontal>
        <View>
          <View style={styles.scoreboardHeader}>
            <View style={styles.teamColumn}>
              <Text style={styles.teamHeaderText}>Team</Text>
            </View>
            {displayedHoles.map(hole => (
              <TouchableOpacity 
                key={`header-${hole.number}`}
                style={[
                  styles.holeColumn, 
                  isHoleCompleted(hole) && styles.completedHoleColumn
                ]}
                onPress={() => match.enablePresses && openPressModal(hole)}
              >
                <Text style={styles.holeNumber}>{hole.number}</Text>
                {match.enablePresses && hole.presses && hole.presses.length > 0 && (
                  <View style={styles.pressIndicator}>
                    <DollarSign size={12} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.totalColumn}>
              <Text style={styles.totalHeaderText}>Total</Text>
            </View>
          </View>

          {match.teams.map(team => (
            <View key={team.id} style={styles.teamRow}>
              <View style={styles.teamColumn}>
                <View 
                  style={[
                    styles.teamBadge, 
                    { backgroundColor: team.color || '#007AFF' }
                  ]}
                >
                  <Text style={styles.teamInitial}>
                    {team.initial || team.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.teamName}>
                  {team.name}
                </Text>
              </View>

              {displayedHoles.map(hole => (
                <TouchableOpacity 
                  key={`${team.id}-${hole.number}`}
                  style={[
                    styles.scoreCell,
                    isHoleCompleted(hole) && styles.completedScoreCell
                  ]}
                  onPress={() => openScoreInput(hole, team.id)}
                >
                  <Text style={styles.scoreText}>
                    {getHoleScore(hole, team.id)}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.totalCell}>
                <Text style={styles.totalText}>
                  {getTeamTotal(team.id)}
                </Text>
              </View>
            </View>
          ))}

          {match.enablePresses && (
            <View style={styles.pressSection}>
              <Text style={styles.pressSectionTitle}>
                Presses
              </Text>
              <View style={styles.pressTable}>
                {/* Press data could be rendered here */}
                <Text style={styles.pressSummary}>
                  {match.presses && match.presses.length > 0 
                    ? `${match.presses.length} active presses` 
                    : 'No active presses'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedHole && showScoreModal && (
        <ScoreInputModal
          isVisible={showScoreModal}
          hole={selectedHole}
          teamId={selectedTeam!}
          teamName={match.teams.find(t => t.id === selectedTeam)?.name || ''}
          onClose={closeScoreModal}
          onSave={handleSaveScore}
          currentScore={
            selectedHole.scores.find(s => s.teamId === selectedTeam)?.score || null
          }
        />
      )}

      {selectedHole && showPressModal && (
        <StepPressModal
          isVisible={showPressModal}
          hole={selectedHole}
          teams={match.teams}
          onClose={closePressModal}
          onSave={(updatedHole) => {
            const updatedHoles = match.holes.map(h => 
              h.number === updatedHole.number ? updatedHole : h
            );
            const updatedMatch = { ...match, holes: updatedHoles };
            setMatch(updatedMatch);
            updateMatch(updatedMatch);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
  scoreboardHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  teamColumn: {
    width: 100,
    paddingLeft: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  holeColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  completedHoleColumn: {
    backgroundColor: '#F0F8FF',
  },
  holeNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  pressIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  totalColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  teamHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  totalHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  teamRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  teamBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginTop: 6,
  },
  scoreCell: {
    width: 40,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  completedScoreCell: {
    backgroundColor: '#F0F8FF',
  },
  scoreText: {
    fontSize: 16,
    color: '#333333',
  },
  totalCell: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  pressSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pressSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  pressTable: {
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  pressSummary: {
    color: '#666666',
    textAlign: 'center',
  },
});