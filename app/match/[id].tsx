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
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Share2, ChevronLeft, ChevronRight, Table } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';
import ScoreInput from '@/components/match/ScoreInput';
import ScoreCard from '@/components/match/ScoreCard';
import MatchStatus from '@/components/match/MatchStatus';
import StepPressModal from '@/components/match/StepPressModal';
import ScorecardWithPresses from '@/components/ScorecardScreen/ScorecardWithPresses';
import RunningTotals from '@/components/ScorecardScreen/RunningTotals';
import HoleNumbers from '@/components/ScorecardScreen/HoleNumbers';
import PressNotification from '@/components/ScorecardScreen/PressNotification';
import { Match } from '@/context/MatchContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});

export default function MatchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { getMatch, updateMatch } = useMatches();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHole, setCurrentHole] = useState(1);
  const [orientation, setOrientation] = useState('portrait');
  const [showPressModal, setShowPressModal] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (id) {
          const matchData = await getMatch(id.toString());
          if (matchData) {
            setMatch(matchData);
            const firstIncompleteHole = matchData.holes.find((hole: { isComplete: boolean }) => !hole.isComplete);
            if (firstIncompleteHole) {
              setCurrentHole(firstIncompleteHole.number);
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

  if (isLoading || !match) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#333333' }}>Loading match...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
            {match.title || 'Golf Match'}
          </Text>
          <Text style={styles.subtitle}>
            {match.teams.map((team: { id: string; name: string }) => team.name).join(' vs ')}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={24} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
      </View>

      <MatchStatus match={match} />

      <ScrollView ref={scrollViewRef}>
        <ScorecardWithPresses 
          matchId={match.id} 
          teams={match.teams} 
          front9Scores={match.front9Scores} 
          back9Scores={match.back9Scores} 
          presses={match.presses} 
        />
        <RunningTotals front9Scores={match.front9Scores || []} back9Scores={match.back9Scores || []} />
        <HoleNumbers showBack9={currentHole > 9} />
        <PressNotification presses={match.presses || []} matchId={match.id} />
      </ScrollView>
    </View>
  );
}