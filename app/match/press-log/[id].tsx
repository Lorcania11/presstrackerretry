import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, DollarSign } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';

export default function PressLogScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { getMatch } = useMatches();
  
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (id) {
          const matchData = await getMatch(id.toString());
          if (matchData) {
            setMatch(matchData);
          } else {
            throw new Error('Match not found');
          }
        }
      } catch (error) {
        console.error('Error loading match:', error);
        Alert.alert('Error', 'Failed to load press log data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMatch();
  }, [id]);
  
  if (isLoading || !match) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#333333' }}>Loading press log...</Text>
      </View>
    );
  }
  
  const getPressTypeLabel = (type) => {
    switch (type) {
      case 'front': return 'Front 9';
      case 'back': return 'Back 9';
      case 'total': return 'Total 18';
      default: return type;
    }
  };
  
  const getTeamById = (teamId) => {
    return match.teams.find(team => team.id === teamId);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
          Press Log
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {match.presses && match.presses.length > 0 ? (
          match.presses.map((press, index) => {
            const fromTeam = getTeamById(press.fromTeamId);
            const toTeam = getTeamById(press.toTeamId);
            
            if (!fromTeam || !toTeam) return null;
            
            return (
              <View 
                key={press.id || index} 
                style={[
                  styles.pressCard, 
                  { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
                ]}
              >
                <View style={styles.pressHeader}>
                  <View style={styles.teamInfo}>
                    <View 
                      style={[
                        styles.teamCircle, 
                        { backgroundColor: fromTeam.color || '#4CAE4F' }
                      ]}
                    >
                      <Text style={styles.teamInitial}>
                        {fromTeam.initial || fromTeam.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      {fromTeam.name}
                    </Text>
                  </View>
                  
                  <DollarSign size={20} color="#4CAF50" />
                  
                  <View style={styles.teamInfo}>
                    <View 
                      style={[
                        styles.teamCircle, 
                        { backgroundColor: toTeam.color || '#FFC105' }
                      ]}
                    >
                      <Text style={styles.teamInitial}>
                        {toTeam.initial || toTeam.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      {toTeam.name}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.pressDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                      Hole:
                    </Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      {press.holeIndex + 1}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                      Game:
                    </Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      {getPressTypeLabel(press.pressType)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                      Amount:
                    </Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      ${match.gameFormats?.find(f => f.type === press.pressType)?.betAmount || '10'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              No presses have been added yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  pressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
  },
  teamCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  teamName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  pressDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
