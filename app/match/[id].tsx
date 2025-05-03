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
  ScrollView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import { Match as ContextMatch } from '@/context/MatchContext';
import ScorecardFlow from '@/components/ScorecardScreen/ScorecardFlow';
import PressSummaryModal from '@/components/match/PressSummaryModal';
import { ChevronLeft, DollarSign, Edit3 } from 'lucide-react-native';

// Define interfaces for type safety
interface HoleScore {
  teamId: string;
  score: number | null;
}

interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
}

interface Hole {
  number: number;
  scores: HoleScore[];
  presses: Press[];
  isComplete: boolean;
}

// Define our component's Match interface to match with useMatches hook's definition
interface MatchDetail {
  id: string;
  title: string;
  teams: {
    id: string;
    name: string;
    initial?: string;
    color?: string;
    scores: (number | null)[];
  }[];
  gameFormats: Array<{
    type: string;
    betAmount: number;
  }>;
  presses: Press[];
  holes: Hole[];
  playFormat: "match" | "stroke";
  enablePresses: boolean;
  createdAt: string;
  isComplete: boolean;
}

// Define fixed team colors (important for consistent team identification)
const FIXED_TEAM_COLORS: Record<string, string> = {
  '1': '#4CAE4F', // Team 1 - Green
  '2': '#FFC105', // Team 2 - Yellow
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getMatch } = useMatches();

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScorecardFlow, setShowScorecardFlow] = useState(false);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [showBack9, setShowBack9] = useState(false);
  const [showPressSummary, setShowPressSummary] = useState(false);

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
      
      // Transform the match to fit our MatchDetail interface
      const matchDetail: MatchDetail = {
        ...loadedMatch,
        teams: loadedMatch.teams.map((team, index) => {
          // Assign consistent color based on team index
          const teamNumber = (index + 1).toString();
          const teamColor = FIXED_TEAM_COLORS[teamNumber] || team.color || '#CCCCCC';
          
          return {
            ...team,
            initial: team.initial || team.name.charAt(0).toUpperCase(),
            color: teamColor
          };
        })
      };
      
      setMatch(matchDetail);
      
      // Assign fixed colors to teams based on their order
      const fixedColors: {[teamId: string]: string} = {};
      matchDetail.teams.forEach((team, idx) => {
        const teamNumber = (idx + 1).toString();
        fixedColors[team.id] = FIXED_TEAM_COLORS[teamNumber] || team.color || '#CCCCCC';
      });
      setTeamFixedColors(fixedColors);
      
      // Initialize the current hole based on progress
      const lastCompletedHoleIndex = matchDetail.holes.findIndex(hole => !hole.isComplete);
      if (lastCompletedHoleIndex > 0) {
        setCurrentHoleIndex(lastCompletedHoleIndex);
        if (lastCompletedHoleIndex >= 9) {
          setShowBack9(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load match');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenScorecard = () => {
    setShowScorecardFlow(true);
  };

  const handleOpenPressSummary = () => {
    setShowPressSummary(true);
  };

  const navigateToScoreInput = () => {
    router.push(`/match/score-input/${id}`);
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
        teams={match.teams.map(team => ({
          id: team.id,
          name: team.name,
          initial: team.initial || team.name.charAt(0).toUpperCase(),
          color: teamFixedColors[team.id] || team.color || '#CCCCCC', // Ensure color is always defined
          scores: match.holes.map(hole => {
            const score = hole.scores.find(s => s.teamId === team.id)?.score || null; // Ensure score is number | null
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Better iOS touch target
        >
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{match.title}</Text>
        <View style={styles.headerActions}>
          {match.enablePresses && match.presses.length > 0 && (
            <TouchableOpacity 
              style={styles.pressButton} 
              onPress={handleOpenPressSummary}
              accessibilityLabel="View press summary"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Better iOS touch target
            >
              <DollarSign size={18} color="#FFFFFF" style={styles.pressButtonIcon} />
              <Text style={styles.pressButtonText}>Press Log</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenScorecard}
        >
          <Text style={styles.actionButtonText}>View Scorecard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.inputScoreButton]}
          onPress={navigateToScoreInput}
        >
          <Edit3 size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.actionButtonText}>Input Scores</Text>
        </TouchableOpacity>
      </View>

      {showPressSummary && match && (
        <PressSummaryModal
          isVisible={showPressSummary}
          onClose={() => setShowPressSummary(false)}
          match={{
            ...match,
            // Ensure the match object has the latest data with correctly flagged original bets
            presses: match.presses.map(press => ({
              ...press,
              // Original bets start on hole 1 (holeIndex 0) for front9 and total18,
              // or on hole 10 (holeIndex 9) for back9
              isOriginalBet: (press.holeIndex === 0 && (press.pressType === 'front9' || press.pressType === 'total18')) ||
                             (press.holeIndex === 9 && press.pressType === 'back9')
            })),
            holes: match.holes.map(hole => ({
              ...hole,
              presses: match.presses.filter(p => p.holeIndex === hole.number - 1)
            }))
          }}
          teamColors={FIXED_TEAM_COLORS}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    // iOS-specific shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressButtonIcon: {
    marginRight: 4,
  },
  pressButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    // iOS-specific shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputScoreButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 8,
  },
});