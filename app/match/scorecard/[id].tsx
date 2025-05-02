import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import ScorecardFlow from '@/components/ScorecardScreen/ScorecardFlow';

export default function ScorecardScreen() {
  const { id, showBack9: showBack9Param, currentHole: currentHoleParam } = useLocalSearchParams();
  const { getMatch } = useMatches();
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<any>(null);
  const [showBack9, setShowBack9] = useState(showBack9Param === 'true');
  const [currentHole, setCurrentHole] = useState(parseInt(currentHoleParam as string, 10) || 1);
  
  // Define fixed team colors (important for consistent team identification)
  const FIXED_TEAM_COLORS: Record<string, string> = {
    '1': '#4CAE4F', // Team 1 - Green
    '2': '#FFC105', // Team 2 - Yellow
  };
  
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load match details');
      router.back();
    }
  };
  
  const handleBack = () => {
    router.back(); // Go back to the score input screen
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  if (!match) {
    return null;
  }
  
  // Map team colors for consistency
  const teamColors: {[key: string]: string} = {};
  match.teams.forEach((team: any, idx: number) => {
    const teamNumber = (idx + 1).toString();
    teamColors[team.id] = FIXED_TEAM_COLORS[teamNumber] || team.color || '#CCCCCC';
  });
  
  return (
    <ScorecardFlow
      teams={match.teams.map((team: any) => ({
        id: team.id,
        name: team.name,
        initial: team.initial || team.name.charAt(0).toUpperCase(),
        color: teamColors[team.id] || team.color || '#CCCCCC',
        scores: match.holes.map((hole: any) => {
          const score = hole.scores.find((s: any) => s.teamId === team.id)?.score || null;
          return score;
        })
      }))}
      presses={match.presses}
      currentHole={currentHole}
      showBack9={showBack9}
      onBack={handleBack}
      matchId={id as string}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  }
});
