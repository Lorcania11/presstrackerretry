import { StyleSheet, Text, View, Platform, useColorScheme } from 'react-native';
import { calculateMatchPlay, calculateStrokePlay } from '@/utils/helpers';

interface MatchStatusProps {
  match: any;
}

export default function MatchStatus({ match }: MatchStatusProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const getStatusText = () => {
    if (match.playFormat === 'match') {
      const result = calculateMatchPlay(match.teams, match.holes);
      return result.status;
    } else {
      const result = calculateStrokePlay(match.teams, match.holes);
      return result.status;
    }
  };

  const getStatusStyle = () => {
    return {
      ...styles.container,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      borderColor: isDark ? '#333333' : '#E0E0E0',
    };
  };

  const getTextStyle = () => {
    return {
      ...styles.statusText,
      color: isDark ? '#FFFFFF' : '#333333',
    };
  };

  const getFormatBadgeStyle = () => {
    return {
      ...styles.formatBadge,
      backgroundColor: isDark ? '#333333' : '#F5F5F5',
    };
  };

  const getFormatTextStyle = () => {
    return {
      ...styles.formatText,
      color: isDark ? '#4CAF50' : '#4CAF50',
    };
  };

  return (
    <View style={getStatusStyle()}>
      <View style={getFormatBadgeStyle()}>
        <Text style={getFormatTextStyle()}>
          {match.playFormat === 'match' ? 'Match Play' : 'Stroke Play'}
        </Text>
      </View>
      <Text style={getTextStyle()}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
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
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  formatBadge: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  formatText: {
    fontSize: 14,
    fontWeight: '500',
  },
});