import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Calendar,
  TrendingUp,
  Trophy,
  Users,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  route: string;
  color: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const quickActions: QuickAction[] = [
    {
      icon: <Calendar size={24} color="#4CAF50" />,
      title: "Schedule Match",
      subtitle: "Set up a new game",
      route: "/new-match",
      color: "#E8F5E9"
    },
    {
      icon: <TrendingUp size={24} color="#2196F3" />,
      title: "Statistics",
      subtitle: "View your performance",
      route: "/stats",
      color: "#E3F2FD"
    },
    {
      icon: <Trophy size={24} color="#FFC107" />,
      title: "Tournaments",
      subtitle: "Join or create events",
      route: "/tournaments",
      color: "#FFF8E1"
    },
    {
      icon: <Users size={24} color="#9C27B0" />,
      title: "Find Players",
      subtitle: "Connect with golfers",
      route: "/players",
      color: "#F3E5F5"
    }
  ];

  // Utility function for dynamic styling based on theme
  const getThemedStyles = {
    container: () => ({
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#F5F5F5'
    }),
    card: () => ({
      ...styles.card,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF'
    }),
    text: (baseStyle) => ({
      ...baseStyle,
      color: isDark ? '#FFFFFF' : '#333333'
    }),
    subText: (baseStyle) => ({
      ...baseStyle,
      color: isDark ? '#CCCCCC' : '#666666'
    }),
    actionCard: (color) => ({
      ...styles.quickActionCard,
      backgroundColor: isDark ? '#1E1E1E' : color
    })
  };

  const handleNavigate = (route: string, title: string) => {
    if (route) {
      try {
        router.push(route);
      } catch (error) {
        console.error(`Navigation error for route ${route}:`, error);
        Alert.alert('Navigation Error', `Unable to navigate to ${title}. This feature may not be available yet.`);
      }
    } else {
      console.error(`Invalid route for action: ${title}`);
      Alert.alert('Feature Unavailable', `The ${title} feature is coming soon!`);
    }
  };

  return (
    <ScrollView 
      style={getThemedStyles.container()}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? '#FFFFFF' : '#333333'}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={getThemedStyles.text(styles.welcomeText)}>Golf Match Tracker</Text>
          <Text style={getThemedStyles.subText(styles.subText)}>Welcome back!</Text>
        </View>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/914930/pexels-photo-914930.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' }}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={getThemedStyles.actionCard(action.color)}
            onPress={() => handleNavigate(action.route, action.title)}
            accessibilityLabel={action.title}
            accessibilityHint={action.subtitle}
          >
            {action.icon}
            <Text style={getThemedStyles.text(styles.quickActionTitle)}>
              {action.title}
            </Text>
            <Text style={getThemedStyles.subText(styles.quickActionSubtitle)}>
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={getThemedStyles.card()}>
        <View style={styles.cardHeader}>
          <Text style={getThemedStyles.text(styles.cardTitle)}>
            Recent Activity
          </Text>
          <TouchableOpacity 
            onPress={() => handleNavigate('/history', 'History')}
            accessibilityLabel="View all activities"
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          <TouchableOpacity style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
              <Trophy size={20} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={getThemedStyles.text(styles.activityTitle)}>
                Won match against John
              </Text>
              <Text style={getThemedStyles.subText(styles.activityTime)}>
                <Clock size={12} color={isDark ? '#CCCCCC' : '#666666'} /> 2 hours ago
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#666666' : '#999999'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[getThemedStyles.card(), styles.statsCard]}>
        <Text style={getThemedStyles.text(styles.cardTitle)}>
          Quick Stats
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={getThemedStyles.text(styles.statValue)}>
              72
            </Text>
            <Text style={getThemedStyles.subText(styles.statLabel)}>
              Best Score
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={getThemedStyles.text(styles.statValue)}>
              15
            </Text>
            <Text style={getThemedStyles.subText(styles.statLabel)}>
              Matches
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={getThemedStyles.text(styles.statValue)}>
              8
            </Text>
            <Text style={getThemedStyles.subText(styles.statLabel)}>
              Wins
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  subText: {
    fontSize: 16,
    marginTop: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  quickActionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
  },
  card: {
    margin: 10,
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});