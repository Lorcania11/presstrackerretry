import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Calendar, Search } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';

interface MatchTeam {
  id: string;
  name: string;
  color?: string;
  initial?: string;
}

interface Match {
  id: string;
  title: string;
  teams: MatchTeam[];
  format?: 'front' | 'back' | 'total';
  createdAt: string;
  isComplete: boolean;
}

export default function HistoryScreen() {
  const { matches, loadMatches } = useMatches();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await loadMatches();
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const navigateToMatch = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const filteredMatches = matches.filter((match: Match) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (match.title && match.title.toLowerCase().includes(query)) ||
      match.teams.some((team: MatchTeam) => team.name.toLowerCase().includes(query))
    );
  });

  const renderMatchItem = ({ item }: { item: Match }) => {
    const matchDate = new Date(item.createdAt);
    
    return (
      <TouchableOpacity 
        style={styles.matchCard} 
        onPress={() => navigateToMatch(item.id)}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.matchTitle}>
            {item.title || 'Untitled Match'}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isComplete ? '#F0F8FF' : '#FFF3E0' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.isComplete ? '#007AFF' : '#FF9800' }
            ]}>
              {item.isComplete ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.teamsText}>
          {item.teams.map((team: MatchTeam) => team.name).join(' vs ')}
        </Text>
        
        <View style={styles.matchFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color="#888888" />
            <Text style={styles.dateText}>
              {matchDate.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>
              {item.format === 'front' ? 'Front 9' : 
               item.format === 'back' ? 'Back 9' : 'Full 18'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match History</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color="#888888" style={styles.searchIcon} />
        <TouchableOpacity
          style={styles.searchInput}
          activeOpacity={0.7}
          onPress={() => {/* Open search modal if needed */}}
        >
          <Text style={{ color: '#888888' }}>
            Search matches...
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: '#666666' }}>
            Loading matches...
          </Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: '#666666', textAlign: 'center' }}>
            No match history found
          </Text>
          <Text style={{ color: '#888888', textAlign: 'center', marginTop: 8 }}>
            Start a new match to begin tracking scores
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 8,
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: Platform.OS === 'ios' ? '#E0E0E0' : '#DDDDDD',
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }
    }),
  },
  listContent: {
    paddingBottom: 20,
  },
  matchCard: {
    padding: 16,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Platform.OS === 'ios' ? 6 : 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      }
    }),
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  teamsText: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666666',
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  formatBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Platform.OS === 'ios' ? 6 : 4,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      }
    }),
  },
  formatText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});