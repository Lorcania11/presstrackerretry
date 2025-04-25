// app/match/[id].tsx (modified part)

// Add this import
import ScorecardView from '@/components/ScorecardScreen/ScorecardView';

// Inside your MatchScreen component, replace the ScrollView content with:

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

  {/* Toggle for Front/Back 9 */}
  <View style={styles.toggleContainer}>
    <TouchableOpacity
      style={[
        styles.toggleButton,
        !showBack9 && styles.toggleButtonActive,
        { backgroundColor: !showBack9 ? '#4CAF50' : isDark ? '#333333' : '#F5F5F5' }
      ]}
      onPress={() => setShowBack9(false)}
    >
      <Text 
        style={[
          styles.toggleText, 
          { color: !showBack9 ? '#FFFFFF' : isDark ? '#CCCCCC' : '#666666' }
        ]}
      >
        Front 9
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.toggleButton,
        showBack9 && styles.toggleButtonActive,
        { backgroundColor: showBack9 ? '#4CAF50' : isDark ? '#333333' : '#F5F5F5' }
      ]}
      onPress={() => setShowBack9(true)}
    >
      <Text 
        style={[
          styles.toggleText, 
          { color: showBack9 ? '#FFFFFF' : isDark ? '#CCCCCC' : '#666666' }
        ]}
      >
        Back 9
      </Text>
    </TouchableOpacity>
  </View>

  {/* New Scorecard View Component */}
  <ScorecardView 
    teams={match.teams} 
    showBack9={showBack9} 
    matchTitle={match.title || 'Scorecard'}
  />
</View>

// Add these additional styles to your existing styles
const styles = StyleSheet.create({
  // ... existing styles
  
  toggleContainer: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#EEEEEE',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontWeight: '600',
  },
});