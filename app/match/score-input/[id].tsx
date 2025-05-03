// app/match/score-input/[id].tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import { ChevronLeft, ArrowLeft, ArrowRight, DollarSign } from 'lucide-react-native';
import PressSummaryModal from '@/components/match/PressSummaryModal';
import StepPressModal from '@/components/match/StepPressModal';
import { calculateMatchPlay, calculateStrokePlay } from '@/utils/helpers';

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

export default function ScoreInputScreen() {
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();
  
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [scores, setScores] = useState<{[teamId: string]: string}>({});
  const [showBack9, setShowBack9] = useState(false);
  const [currentHoleSaved, setCurrentHoleSaved] = useState<boolean>(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showPressSummary, setShowPressSummary] = useState(false);
  const [pressModalInfo, setPressModalInfo] = useState<{
    statusMessage: string;
    gameType: string;
  } | null>(null);
  
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
        teams: loadedMatch.teams.map(team => ({
          ...team,
          initial: team.initial || team.name.charAt(0).toUpperCase(),
          color: team.color || '#CCCCCC'
        }))
      };
      
      setMatch(matchDetail);
      
      // Assign fixed colors to teams based on their order
      const fixedColors: {[teamId: string]: string} = {};
      matchDetail.teams.forEach((team, idx) => {
        const teamNumber = (idx + 1).toString();
        fixedColors[team.id] = FIXED_TEAM_COLORS[teamNumber] || team.color || '#CCCCCC';
      });
      setTeamFixedColors(fixedColors);
      
      // Initialize the scores state with current scores for this hole
      initializeScores(matchDetail, currentHoleIndex);
    } catch (error) {
      Alert.alert('Error', 'Failed to load match');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const initializeScores = (match: MatchDetail, holeIndex: number) => {
    const hole = match.holes[holeIndex];
    if (!hole) return;
    
    const initialScores = match.teams.reduce((obj, team) => {
      const scoreEntry = hole.scores.find((s: HoleScore) => s.teamId === team.id);
      obj[team.id] = scoreEntry && scoreEntry.score !== null ? String(scoreEntry.score) : '';
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
    
    const updatedMatch: MatchDetail = { 
      ...match, 
      holes: updatedHoles
    };
    
    setMatch(updatedMatch);
    updateMatch(updatedMatch);
    
    // Mark the current hole as saved if all scores are entered
    if (isHoleComplete) {
      setCurrentHoleSaved(true);
    }
    
    // Show press modal if this is a completed hole and user has enabled presses
    if (showPressModalAfter && match.enablePresses && isHoleComplete) {
      // Calculate who is up/down for each game format
      calculatePressStatus(updatedMatch);
      setShowPressModal(true);
    }
  };
  
  const calculatePressStatus = (match: MatchDetail) => {
    if (!match || match.teams.length !== 2) return;
    
    const team1 = match.teams[0];
    const team2 = match.teams[1];
    
    // Determine which nine we're on
    const isOnFrontNine = currentHoleIndex < 9;
    const isOnBackNine = currentHoleIndex >= 9;
    
    // Filter holes based on which nine we're on
    const relevantHoles = match.holes.filter((hole, index) => {
      if (isOnFrontNine) return index < 9 && index <= currentHoleIndex && hole.isComplete;
      if (isOnBackNine) return index >= 9 && index <= currentHoleIndex && hole.isComplete;
      return false;
    });
    
    let statusMessage = '';
    let gameType = isOnFrontNine ? 'front9' : 'back9';
    
    if (match.playFormat === 'match') {
      // Match play calculation
      const result = calculateMatchPlay(match.teams, relevantHoles);
      statusMessage = result.status;
      
      // Simplify the status message
      if (statusMessage.includes(team1.name) && statusMessage.includes(' UP ')) {
        const parts = statusMessage.split(' ');
        const upAmount = parseInt(parts[1], 10) || 0;
        statusMessage = `${team1.name} is ${upAmount} UP`;
      } else if (statusMessage.includes(team2.name) && statusMessage.includes(' UP ')) {
        const parts = statusMessage.split(' ');
        const upAmount = parseInt(parts[1], 10) || 0;
        statusMessage = `${team1.name} is ${upAmount} DOWN`;
      } else if (statusMessage.includes('All Square')) {
        statusMessage = `Match is tied (All Square)`;
      }
    } else {
      // Stroke play calculation
      const result = calculateStrokePlay(match.teams, relevantHoles);
      
      if (Array.isArray(result.details)) {
        // Get scores and determine who is up/down
        const team1Result = result.details.find(t => t.teamId === team1.id);
        const team2Result = result.details.find(t => t.teamId === team2.id);
        
        if (team1Result && team2Result) {
          const diff = team1Result.totalScore - team2Result.totalScore;
          if (diff < 0) {
            statusMessage = `${team1.name} is leading by ${Math.abs(diff)} strokes`;
          } else if (diff > 0) {
            statusMessage = `${team1.name} is trailing by ${diff} strokes`;
          } else {
            statusMessage = 'Match is tied';
          }
        }
      } else {
        statusMessage = "Status not available";
      }
    }
    
    // Set the press modal info
    setPressModalInfo({
      statusMessage,
      gameType
    });
  };
  
  const handleSave = () => {
    saveCurrentHoleScores(true);
  };
  
  const handlePressModalClose = () => {
    setShowPressModal(false);
    // The onDismissWithoutPress callback will handle navigation if needed
  };

  const handleDismissWithoutPress = () => {
    // Automatically advance to next hole when press modal is dismissed without any presses
    if (currentHoleIndex < 17) {
      const newIndex = currentHoleIndex + 1;
      setCurrentHoleIndex(newIndex);
      if (match) {
        initializeScores(match, newIndex);
      }
      setCurrentHoleSaved(false);
      
      if (newIndex === 9) {
        setShowBack9(true);
      }
    }
  };
  
  const handleSavePresses = (updatedHole: Hole) => {
    if (!match) return;
    
    const updatedHoles = match.holes.map((hole, index) => 
      index === currentHoleIndex ? updatedHole : hole
    );
    
    const updatedMatch: MatchDetail = { 
      ...match, 
      holes: updatedHoles 
    };
    
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
  
  const handleSavePress = (press: Omit<Press, 'id'>) => {
    if (!match) return;
    
    // Generate a unique ID for the press
    const newPress: Press = {
      ...press as any, // Use type assertion to fix compatibility
      id: Math.random().toString(36).substring(2, 9),
    };
    
    // Add the press to the match presses array
    const updatedMatch: MatchDetail = {
      ...match,
      presses: [...match.presses, newPress],
    };
    
    console.log("Adding new press:", newPress);
    console.log("Updated presses:", updatedMatch.presses);
    
    setMatch(updatedMatch);
    updateMatch(updatedMatch);
    
    // Don't close modal here - let the modal handle its own closure
    // handlePressModalClose will be called when the modal itself decides to close
  };
  
  const handleOpenPressSummary = () => {
    setShowPressSummary(true);
  };
  
  const handleViewScorecard = () => {
    // Navigate to a new screen that shows the scorecard flow directly
    // Instead of going back to the match detail screen and then to the scorecard
    if (!match) return;
    
    // Save current scores before showing scorecard
    if (!currentHoleSaved) {
      saveCurrentHoleScores(false);
    }
    
    // Create a temporary state object with necessary props to pass to ScorecardFlow
    const scorecardProps = {
      teams: match.teams.map(team => ({
        id: team.id,
        name: team.name,
        initial: team.initial || team.name.charAt(0).toUpperCase(),
        color: teamFixedColors[team.id] || team.color || '#CCCCCC',
        scores: match.holes.map(hole => {
          const score = hole.scores.find(s => s.teamId === team.id)?.score || null;
          return score;
        })
      })),
      presses: match.presses,
      currentHole: currentHoleIndex + 1,
      showBack9: showBack9,
      matchId: id as string
    };
    
    // Store the props in a global state or navigate with them
    router.push({
      pathname: `/match/scorecard/${id}`,
      params: {
        showBack9: showBack9 ? 'true' : 'false',
        currentHole: (currentHoleIndex + 1).toString()
      }
    });
  };

  const handleExitRound = () => {
    Alert.alert(
      "Exit Round",
      "Are you sure you want to exit this round? Your progress has been saved.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => router.replace('/')
        }
      ]
    );
  };

  // Add this handler for submitting all presses
  const handleSubmitAllPresses = () => {
    // Advance to next hole after user submits all presses
    if (currentHoleIndex < 17) {
      const newIndex = currentHoleIndex + 1;
      setCurrentHoleIndex(newIndex);
      if (match) {
        initializeScores(match, newIndex);
      }
      setCurrentHoleSaved(false);
      
      if (newIndex === 9) {
        setShowBack9(true);
      }
    }
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
  
  const currentHole = match?.holes[currentHoleIndex];
  const holeNumber = currentHoleIndex + 1;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.exitButton} 
          onPress={handleExitRound}
          activeOpacity={0.7} activeOpacity={0.7} // Add this to provide better feedback on press
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Better touch target for iOS
        >
          <ChevronLeft size={20} color="#FFFFFF" />es.exitButtonText}>Exit Round</Text>
          <Text style={styles.exitButtonText}>Exit Round</Text>
        </TouchableOpacity>atch.title}</Text>
        <Text style={styles.headerTitle}>{match.title}</Text>
        <View style={styles.headerActions}> && match.presses.length > 0 && (
          {match.enablePresses && match.presses.length > 0 && (
            <TouchableOpacity 
              style={styles.pressButton} 
              onPress={handleOpenPressSummary} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Improve touch area for iOS
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Improve touch area for iOS
            >{18} color="#FFFFFF" />
              <DollarSign size={18} color="#FFFFFF" /></TouchableOpacity>
            </TouchableOpacity>
          )}
          <TouchableOpacity } 
            style={styles.scorecardButton} 
            onPress={handleViewScorecard} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }} // Improve touch area for iOS
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }} // Improve touch area for iOS
          >es.scorecardButtonText}>View Scorecard</Text>
            <Text style={styles.scorecardButtonText}>View Scorecard</Text>chableOpacity>
          </TouchableOpacity>w>
        </View>      </View>
      </View>

      <View style={styles.scoreInputContainer}><Text style={styles.holeTitle}>Enter Scores - Hole {holeNumber}</Text>
        <Text style={styles.holeTitle}>Enter Scores - Hole {holeNumber}</Text>
        ainer}>
        <ScrollView style={styles.teamsContainer}>
          {match.teams.map((team, idx) => {reen, second team yellow)
            // Use fixed team color based on team order (first team green, second team yellow)const teamColor = teamFixedColors[team.id] || team.color;
            const teamColor = teamFixedColors[team.id] || team.color;
            
            return (s.teamRow}>
              <View key={team.id} style={styles.teamRow}>
                <View style={styles.teamInfo}>backgroundColor: teamColor }]}>
                  <View style={[styles.teamCircle, { backgroundColor: teamColor }]}>
                    <Text style={styles.teamInitial}>.initial || team.name.charAt(0).toUpperCase()}
                      {team.initial || team.name.charAt(0).toUpperCase()}t>
                    </Text>
                  </View> style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamName}>{team.name}</Text></View>
                </View>
                
                <TextInputut}
                  style={styles.scoreInput}"numeric"
                  keyboardType="numeric"
                  maxLength={2}
                  value={scores[team.id] || ''}value) => handleScoreChange(team.id, value)}
                  onChangeText={(value) => handleScoreChange(team.id, value)}
                  placeholder="0"placeholderTextColor="#888888"
                  placeholderTextColor="#888888"
                /></View>
              </View>;
            );
          })}</ScrollView>
        </ScrollView>
        navigationContainer}>
        <View style={styles.navigationContainer}>Opacity 
          <TouchableOpacity 
            style={[
              styles.navigationButton, urrentHoleIndex === 0 && styles.disabledButton
              currentHoleIndex === 0 && styles.disabledButton
            ]} 
            onPress={handlePrevHole} disabled={currentHoleIndex === 0}
            disabled={currentHoleIndex === 0}
          >e={20} color={currentHoleIndex === 0 ? "#999999" : "#FFFFFF"} />
            <ArrowLeft size={20} color={currentHoleIndex === 0 ? "#999999" : "#FFFFFF"} />
            <Text style={[
              styles.navigationButtonText,urrentHoleIndex === 0 && styles.disabledButtonText
              currentHoleIndex === 0 && styles.disabledButtonText
            ]}>ous Hole
              Previous Hole
            </Text></TouchableOpacity>
          </TouchableOpacity>
          
          <TouchableOpacity tton} 
            style={styles.saveButton}  onPress={handleSave}
            onPress={handleSave}
          >es.saveButtonText}>Save Scores</Text>
            <Text style={styles.saveButtonText}>Save Scores</Text></TouchableOpacity>
          </TouchableOpacity>
          Opacity 
          <TouchableOpacity 
            style={[
              styles.navigationButton,urrentHoleIndex === 17 && styles.disabledButton
              currentHoleIndex === 17 && styles.disabledButton
            ]} 
            onPress={handleNextHole} disabled={currentHoleIndex === 17}
            disabled={currentHoleIndex === 17}
          >
            <Text style={[
              styles.navigationButtonText,urrentHoleIndex === 17 && styles.disabledButtonText
              currentHoleIndex === 17 && styles.disabledButtonText
            ]}>Hole
              Next Hole
            </Text>{20} color={currentHoleIndex === 17 ? "#999999" : "#FFFFFF"} />
            <ArrowRight size={20} color={currentHoleIndex === 17 ? "#999999" : "#FFFFFF"} />chableOpacity>
          </TouchableOpacity>w>
        </View>      </View>
      </View>
7 && (
      {currentHoleSaved && currentHoleIndex < 17 && (nextHoleContainer}>
        <View style={styles.nextHoleContainer}>
          <TouchableOpacity tton}
            style={styles.nextHoleButton} onPress={handleNextHole}
            onPress={handleNextHole}
          >Next Hole</Text>
            <Text style={styles.nextHoleButtonText}>Next Hole</Text>{20} color="#FFFFFF" />
            <ArrowRight size={20} color="#FFFFFF" />chableOpacity>
          </TouchableOpacity></View>
        </View>      )}
      )}
 match && (
      {showPressSummary && match && (
        <PressSummaryModal
          isVisible={showPressSummary}{() => setShowPressSummary(false)}
          onClose={() => setShowPressSummary(false)}
          match={{
            ...match,est data with correctly flagged original bets
            // Ensure the match object has the latest data with correctly flagged original betstch.presses.map(press => ({
            presses: match.presses.map(press => ({
              ...press,dex 0) for front9 and total18,
              // Original bets start on hole 1 (holeIndex 0) for front9 and total18,
              // or on hole 10 (holeIndex 9) for back9 0 && 
              isOriginalBet: (press.holeIndex === 0 &&  
                (press.pressType === 'front9' || 
                 press.pressType === 'front' ||  
                 press.pressType === 'total18' || tal')) ||
                 press.pressType === 'total')) ||
              (press.holeIndex === 9 && || 
                (press.pressType === 'back9' ||  press.pressType === 'back'))
                 press.pressType === 'back'))
            })),ch.holes.map(hole => ({
            holes: match.holes.map(hole => ({
              ...hole,resses: match.presses.filter(p => p.holeIndex === hole.number - 1)
              presses: match.presses.filter(p => p.holeIndex === hole.number - 1)}))
            }))
          }}teamColors={FIXED_TEAM_COLORS}
          teamColors={FIXED_TEAM_COLORS}/>
        />      )}
      )}
& match && currentHole && (
      {showPressModal && match && currentHole && (
        <StepPressModalssModal}
          isVisible={showPressModal}
          hole={currentHole}ch.teams.map(team => ({
          teams={match.teams.map(team => ({
            ...team,lor: teamFixedColors[team.id] || team.color || '#CCCCCC'
            color: teamFixedColors[team.id] || team.color || '#CCCCCC'
          }))}lClose}
          onClose={handlePressModalClose}
          onSave={handleSavePress}Press}
          onDismissWithoutPress={handleDismissWithoutPress}itAllPresses}
          onSubmitAllPresses={handleSubmitAllPresses}
          teamColors={FIXED_TEAM_COLORS}{match.gameFormats.map(format => ({
          gameFormats={match.gameFormats.map(format => ({
            ...format,: 
            label: format.type === 'front' ? 'Front 9' : 
                   format.type === 'back' ? 'Back 9' :      format.type === 'total' ? 'Total 18' : format.type
                   format.type === 'total' ? 'Total 18' : format.type
          }))}matchStatus={pressModalInfo}
          matchStatus={pressModalInfo}/>
        />
      )}</SafeAreaView>
    </SafeAreaView> );
  );}
}
 StyleSheet.create({
const styles = StyleSheet.create({ {
  container: {
    flex: 1,backgroundColor: '#F5F5F5',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',-between',
    justifyContent: 'space-between',6,
    paddingHorizontal: 16,
    paddingVertical: 12,FFFF',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,borderBottomColor: '#EEEEEE',
    borderBottomColor: '#EEEEEE',
  },
  backButton: {padding: 8,
    padding: 8,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',FF3B30',
    backgroundColor: '#FF3B30',
    paddingVertical: 6,: 10,
    paddingHorizontal: 10,
    borderRadius: 16,ific shadow
    // Improved iOS-specific shadoworm.select({
    ...Platform.select({
      ios: {
        shadowColor: '#000',h: 0, height: 1 },
        shadowOffset: { width: 0, height: 1 },.25,
        shadowOpacity: 0.25,shadowRadius: 2,
        shadowRadius: 2,
      },
      android: {elevation: 2,
        elevation: 2,,
      },}),
    }),
  },
  exitButtonText: {
    color: '#FFFFFF',600',
    fontWeight: '600',
    fontSize: 14,marginLeft: 4,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,,
    fontWeight: '600',#333333',
    color: '#333333',
    flex: 1,
    textAlign: 'center',marginHorizontal: 8,
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',alignItems: 'center',
    alignItems: 'center',
  },
  pressButton: {Color: '#FF9800',
    backgroundColor: '#FF9800',
    width: 36,
    height: 36,
    borderRadius: 18,er',
    justifyContent: 'center',nter',
    alignItems: 'center',marginRight: 8,
    marginRight: 8,
  },
  scorecardButton: {AFF',
    backgroundColor: '#007AFF',12,
    paddingHorizontal: 12,6,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',justifyContent: 'center',
    justifyContent: 'center',
  },Text: {
  scorecardButtonText: {
    fontSize: 14,
    color: '#FFFFFF',fontWeight: '500',
    fontWeight: '500',
  },tainer: {
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',backgroundColor: '#F5F5F5',
    backgroundColor: '#F5F5F5',
  },iner: {
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',backgroundColor: '#F5F5F5',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',textAlign: 'center',
    textAlign: 'center',
  },Container: {
  scoreInputContainer: {
    flex: 1,
    padding: 16,olor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',th: 0, height: 2 },
    shadowOffset: { width: 0, height: 2 },.1,
    shadowOpacity: 0.1, 4,
    shadowRadius: 4,elevation: 3,
    elevation: 3,
  },
  holeTitle: {
    fontSize: 20,
    fontWeight: '700',r',
    textAlign: 'center',
    marginBottom: 20,color: '#333333',
    color: '#333333',
  },iner: {
  teamsContainer: {
    flex: 1,marginBottom: 20,
    marginBottom: 20,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',space-between',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,borderBottomColor: '#EEEEEE',
    borderBottomColor: '#EEEEEE',
  },
  teamInfo: {
    flexDirection: 'row',ms: 'center',
    alignItems: 'center',flex: 1,
    flex: 1,
  },{
  teamCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,er',
    justifyContent: 'center',alignItems: 'center',
    alignItems: 'center',
  },
  teamInitial: {FF',
    color: '#FFFFFF',
    fontSize: 16,fontWeight: '600',
    fontWeight: '600',
  },
  teamName: {2,
    marginLeft: 12,
    fontSize: 16,,
    fontWeight: '500',color: '#333333',
    color: '#333333',
  },{
  scoreInput: {
    width: 60,
    height: 48,
    borderWidth: 1,DDDDD',
    borderColor: '#DDDDDD',
    borderRadius: 8,5F5',
    backgroundColor: '#F5F5F5',ntal: 12,
    paddingHorizontal: 12,
    fontSize: 18,r',
    textAlign: 'center',color: '#333333',
    color: '#333333',
  },
  navigationContainer: {
    flexDirection: 'row',e-between',
    justifyContent: 'space-between',alignItems: 'center',
    alignItems: 'center',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',AFF',
    backgroundColor: '#007AFF',2,
    paddingHorizontal: 12, 10,
    paddingVertical: 10,borderRadius: 8,
    borderRadius: 8,
  },nText: {
  navigationButtonText: {
    fontSize: 14,,
    fontWeight: '500',F',
    color: '#FFFFFF',
    marginLeft: 4,marginRight: 4,
    marginRight: 4,
  },
  saveButton: {F50',
    backgroundColor: '#4CAF50',4,
    paddingHorizontal: 24, 10,
    paddingVertical: 10,borderRadius: 8,
    borderRadius: 8,
  }, {
  saveButtonText: {
    fontSize: 16,,
    fontWeight: '600',color: '#FFFFFF',
    color: '#FFFFFF',
  },
  disabledButton: {backgroundColor: '#CCCCCC',
    backgroundColor: '#CCCCCC',
  }, {
  disabledButtonText: {color: '#999999',
    color: '#999999',
  },ner: {
  nextHoleContainer: {
    padding: 16,alignItems: 'center',
    alignItems: 'center',
  },
  nextHoleButton: {
    flexDirection: 'row',
    alignItems: 'center',AFF',
    backgroundColor: '#007AFF',4,
    paddingHorizontal: 24, 12,
    paddingVertical: 12,borderRadius: 8,
    borderRadius: 8,
  },ext: {
  nextHoleButtonText: {
    fontSize: 16,,
    fontWeight: '600',',
    color: '#FFFFFF',marginRight: 8,
    marginRight: 8,,


});  },});