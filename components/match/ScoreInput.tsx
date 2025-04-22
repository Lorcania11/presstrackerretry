import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useMatchContext } from '@/context/MatchContext';

const ScoreInput: React.FC = () => {
  const { teams } = useMatchContext();

  return (
    <View style={styles.container}>
      {teams.map((team) => (
        <View key={team.id} style={styles.teamRow}>
          <Text style={styles.teamName}>{team.name}</Text>
          <TextInput
            style={styles.scoreInput}
            placeholder="Enter score"
            keyboardType="numeric"
            // Logic to handle score updates can be added here
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 16,
  },
  scoreInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
  },
});

export default ScoreInput;