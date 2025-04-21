import { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Dimensions,
  Keyboard,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Share2, ChevronLeft, ChevronRight, Table } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';
import ScoreInput from '@/components/match/ScoreInput';
import ScoreCard from '@/components/match/ScoreCard';
import MatchStatus from '@/components/match/MatchStatus';
import StepPressModal from '@/components/match/StepPressModal';

export default function MatchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHole, setCurrentHole] = useState(1);
  const [orientation, setOrientation] = useState('portrait');
  const [showPressModal, setShowPressModal] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    const loadMatch = async () => {
      if (id) {
        const matchData = await getMatch(id.toString());
        if (matchData) {
          setMatch(matchData);
          
          const firstIncompleteHole = matchData.holes.find(hole => !hole.isComplete);
          if (firstIncompleteHole) {
            setCurrentHole(firstIncompleteHole.number);
          }
        }
      }
      setIsLoading(false);
    };
    
    loadMatch();
    
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };
    
    updateOrientation();
    Dimensions.addEventListener('change', updateOrientation);
  }, [id]);

  if (isLoading || !match) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#333333' }}>Loading match...</Text>
      </View>
    );
  }

  const getTeamColor = (index: number) => {
    const colors = ['#3B82F6', '#EAB308', '#F97316'];
    return colors[index % colors.length];
  };

  const getContainerStyle = () => {
    return {
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
    };
  };
  
  const navigateBack = () => {
    router.back();
  };

  const handleScoreChange = (holeNumber: number, teamId: string, score: number | null) => {
    const updatedMatch = { ...match };
    const holeIndex = updatedMatch.holes.findIndex(h => h.number === holeNumber);
    
    if (holeIndex !== -1) {
      const scoreIndex = updatedMatch.holes[holeIndex].scores.findIndex(
        s => s.teamId === teamId
      );
      
      if (scoreIndex !== -1) {
        updatedMatch.holes[holeIndex].scores[scoreIndex].score = score;
        
        const allScoresEntered = updatedMatch.holes[holeIndex].scores.every(
          s => s.score !== null
        );
        
        if (allScoresEntered) {
          updatedMatch.holes[holeIndex].isComplete = true;
          setShowPressModal(true);
        }
        
        setMatch(updatedMatch);
        updateMatch(updatedMatch);
      }
    }
  };

  const handlePressSubmit = (selectedPresses: any[]) => {
    const updatedMatch = { ...match };
    const holeIndex = updatedMatch.holes.findIndex(h => h.number === currentHole);
    
    if (holeIndex !== -1) {
      selectedPresses.forEach(press => {
        updatedMatch.holes[holeIndex].presses.push({
          id: Math.random().toString(36).substring(2),
          from: press.from,
          to: press.to,
          type: press.type,
          amount: updatedMatch.gameFormats.find(f => f.type === press.type)?.betAmount || 0,
          active: true
        });
      });
      
      setMatch(updatedMatch);
      updateMatch(updatedMatch);
    }
    
    setShowPressModal(false);
    
    if (currentHole < 18 && orientation === 'portrait') {
      navigateToHole(currentHole + 1);
    }
  };

  const navigateToHole = (holeNumber: number) => {
    if (holeNumber < 1 || holeNumber > 18) return;
    
    setCurrentHole(holeNumber);
    Keyboard.dismiss();
    
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const getCurrentHoleData = () => {
    return match.holes.find(hole => hole.number === currentHole);
  };

  const handleInputSubmit = (index: number) => {
    if (index < match.teams.length - 1) {
      return;
    }
    
    const currentHoleData = getCurrentHoleData();
    if (currentHoleData?.isComplete) {
      navigateToHole(currentHole + 1);
    }
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
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
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={24} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
      </View>

      <MatchStatus match={match} />

      {orientation === 'portrait' ? (
        <>
          <View style={styles.holeNavigation}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => navigateToHole(currentHole - 1)}
              disabled={currentHole === 1}
            >
              <ChevronLeft 
                size={24} 
                color={currentHole === 1 ? '#999999' : isDark ? '#FFFFFF' : '#333333'} 
              />
            </TouchableOpacity>
            
            <View style={[styles.holeIndicator, { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' }]}>
              <Text style={[styles.holeNumber, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Hole {currentHole}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => navigateToHole(currentHole + 1)}
              disabled={currentHole === 18}
            >
              <ChevronRight 
                size={24} 
                color={currentHole === 18 ? '#999999' : isDark ? '#FFFFFF' : '#333333'} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
              <View style={styles.scoreInputContainer}>
                {match.teams.map((team, index) => (
                  <ScoreInput
                    key={team.id}
                    teamName={team.name}
                    teamColor={getTeamColor(index)}
                    onScoreChange={(score) => handleScoreChange(currentHole, team.id, score)}
                    currentScore={
                      getCurrentHoleData()?.scores.find(s => s.teamId === team.id)?.score || null
                    }
                    disabled={getCurrentHoleData()?.isComplete || false}
                    isDarkMode={isDark}
                    onSubmitEditing={() => handleInputSubmit(index)}
                    isFirst={index === 0}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.scorecardButton,
                  { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' }
                ]}
                onPress={() => setShowScorecard(true)}
              >
                <Table size={20} color={isDark ? '#FFFFFF' : '#333333'} />
                <Text style={[
                  styles.scorecardButtonText,
                  { color: isDark ? '#FFFFFF' : '#333333' }
                ]}>
                  View Full Scorecard
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      ) : (
        <ScoreCard 
          match={match}
          onScoreChange={handleScoreChange}
          isDarkMode={isDark}
        />
      )}

      <Modal
        visible={showScorecard}
        animationType="slide"
        onRequestClose={() => setShowScorecard(false)}
      >
        <ScoreCard
          match={match}
          onScoreChange={handleScoreChange}
          isDarkMode={isDark}
          onClose={() => setShowScorecard(false)}
        />
      </Modal>

      <StepPressModal
        visible={showPressModal}
        onClose={() => setShowPressModal(false)}
        onSubmit={handlePressSubmit}
        teams={match.teams}
        gameFormats={match.gameFormats || []}
        currentHole={currentHole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  holeNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  holeIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  holeNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreInputContainer: {
    marginBottom: 16,
  },
  scorecardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  scorecardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});