import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import type { RelativePathString } from 'expo-router';
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
      icon: <Calendar size={24} color="#007AFF" />,
      title: "Schedule Match",
      subtitle: "Set up a new game",
      route: "/new-match",
      color: "#F0F8FF" // Light blue background
    },
    {
      icon: <TrendingUp size={24} color="#007AFF" />,
      title: "Statistics",
      subtitle: "View your performance",
      route: "/stats",
      color: "#F0F8FF"
    },
    {
      icon: <Trophy size={24} color="#007AFF" />,
      title: "Tournaments",
      subtitle: "Join or create events",
      route: "/tournaments",
      color: "#F0F8FF"
    },
    {
      icon: <Users size={24} color="#007AFF" />,
      title: "Find Players",
      subtitle: "Connect with golfers",
      route: "/players",
      color: "#F0F8FF"
    }
  ];

  const handleNavigate = (route: string, title: string) => {
    if (route) {
      try {
        router.push(route as RelativePathString);
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
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#333333"
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Golf Match Tracker</Text>
          <Text style={styles.subText}>Welcome back!</Text>
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
            style={[styles.quickActionCard, { backgroundColor: action.color }]}
            onPress={() => handleNavigate(action.route, action.title)}
            accessibilityLabel={action.title}
            accessibilityHint={action.subtitle}
          >
            {action.icon}
            <Text style={styles.quickActionTitle}>
              {action.title}
            </Text>
            <Text style={styles.quickActionSubtitle}>
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
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
            <View style={[styles.activityIcon, { backgroundColor: '#F0F8FF' }]}>
              <Trophy size={20} color="#007AFF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>
                Won match against John
              </Text>
              <Text style={styles.activityTime}>
                <Clock size={12} color="#666666" /> 2 hours ago
              </Text>
            </View>
            <ChevronRight size={20} color="#999999" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, styles.statsCard]}>
        <Text style={styles.cardTitle}>
          Quick Stats
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              72
            </Text>
            <Text style={styles.statLabel}>
              Best Score
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              15
            </Text>
            <Text style={styles.statLabel}>
              Matches
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              8
            </Text>
            <Text style={styles.statLabel}>
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
    backgroundColor: '#F5F5F5',
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
    color: '#333333',
  },
  subText: {
    fontSize: 16,
    marginTop: 4,
    color: '#666666',
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
    color: '#333333',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  card: {
    margin: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#333333',
  },
  viewAllText: {
    color: '#007AFF',
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
    color: '#333333',
  },
  activityTime: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    color: '#666666',
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
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
});