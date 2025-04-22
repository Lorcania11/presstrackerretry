import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMatchContext } from '@/context/MatchContext';

const MatchStatus: React.FC = () => {
  const { teams } = useMatchContext();

  const getStatusText = () => {
    // Logic to calculate match status based on teams
    return teams.length > 0 ? 'Match in Progress' : 'No Teams Available';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MatchStatus;