// app/match/[id].tsx
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import { useMatchContext } from '@/context/MatchContext';
import InputDesign from '@/components/ScoreInput/InputDesign';
import { MatchData, Teams } from '@/components/ScoreInput/types';

export default function MatchScreen() {
  const route = useRoute();
  const id = route.params?.id;
  const { getMatch, updateMatch } = useMatches();
  const { setTeams } = useMatchContext();
  
  const [match, setMatch] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedTeams, setFormattedTeams] = useState<Teams>({});
  
  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (id) {
          const matchData = await getMatch(id.toString());
          if (matchData) {
            setMatch(matchData);
            
            // Format teams for the InputDesign component
            const teams: Teams = {};
            matchData.teams.forEach((team, index) => {
              const teamId = `team${index + 1}`;
              teams[teamId] = {
                name: team.name,
                initial: team.name.charAt(0).toUpperCase(),
                color: index === 0 ? '#4CAE4F' : index === 1 ? '#FFC105' : '#F44034',
              };
            });
            
            setFormattedTeams(teams);
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
  
  const handleUpdateMatch = async (updatedMatch: MatchData) => {
    try {
      await updateMatch(updatedMatch);
      setMatch(updatedMatch);
      return true;
    } catch (error) {
      console.error('Error updating match:', error);
      Alert.alert('Error', 'Failed to update match');
      return false;
    }
  };
  
  if (isLoading || !match) {
    return (
      <View style={styles.container}>
        <Text>Loading match...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InputDesign 
        match={match} 
        formattedTeams={formattedTeams} 
        onUpdateMatch={handleUpdateMatch}
        onBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});