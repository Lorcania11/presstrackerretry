import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Calendar, Search } from 'lucide-react-native';
import { useMatches } from '@/hooks/useMatches';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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

  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (match.title && match.title.toLowerCase().includes(query)) ||
      match.teams.some(team => team.name.toLowerCase().includes(query))
    );
  });

  const getContainerStyle = () => {
    return {
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
    };
  };

  const getCardStyle = () => {
    return {
      ...styles.matchCard,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      shadowColor: isDark ? '#000000' : '#000000',
    };
  };

  const getTextStyle = () => {
    return {
      ...styles.title,
      color: isDark ? '#FFFFFF' : '#333333',
    };
  };

  const getSearchInputStyle = () => {
    return {
      ...styles.searchInput,
      backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
      color: isDark ? '#FFFFFF' : '#333333',
      borderColor: isDark ? '#444444' : '#DDDDDD',
    };
  };

  const renderMatchItem = ({ item }) => {
    const matchDate = new Date(item.createdAt);
    
    return (
      <TouchableOpacity 
        style={getCardStyle()} 
        onPress={() => navigateToMatch(item.id)}
      >
        <View style={styles.matchHeader}>
          <Text style={[styles.matchTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
            {item.title || 'Untitled Match'}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isComplete ? '#E8F5E9' : '#FFF3E0' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.isComplete ? '#4CAF50' : '#FF9800' }
            ]}>
              {item.isComplete ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.teamsText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
          {item.teams.map(team => team.name).join(' vs ')}
        </Text>
        
        <View style={styles.matchFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={isDark ? '#888888' : '#888888'} />
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
    <View style={getContainerStyle()}>
      <Text style={getTextStyle()}>Match History</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={isDark ? '#888888' : '#888888'} style={styles.searchIcon} />
        <TouchableOpacity
          style={getSearchInputStyle()}
          activeOpacity={0.7}
          onPress={() => {/* Open search modal if needed */}}
        >
          <Text style={{ color: isDark ? '#888888' : '#888888' }}>
            Search matches...
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? '#CCCCCC' : '#666666' }}>
            Loading matches...
          </Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDark ? '#CCCCCC' : '#666666', textAlign: 'center' }}>
            No match history found
          </Text>
          <Text style={{ color: isDark ? '#999999' : '#888888', textAlign: 'center', marginTop: 8 }}>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 8,
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  teamsText: {
    fontSize: 14,
    marginBottom: 12,
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
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formatText: {
    fontSize: 12,
    color: '#2196F3',
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