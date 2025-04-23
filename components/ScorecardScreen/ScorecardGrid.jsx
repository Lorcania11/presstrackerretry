// components/ScorecardScreen/ScorecardGrid.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ScoreDisplay from './ScoreDisplay';

interface ScorecardGridProps {
  teams: Array<{
    id: string;
    name: string;
    scores: Array<number | null>;
  }>;
  showBack9: boolean;
  onScorePress?: (teamId: string, holeIndex: number) => void;
}

const ScorecardGrid: React.FC<ScorecardGridProps> = ({ 
  teams, 
  showBack9, 
  onScorePress 
}) => {
  // Calculate the start hole index (0 for front 9, 9 for back 9)
  const startIndex = showBack9 ? 9 : 0;
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {teams.map((team) => (
          <View key={team.id} style={styles.teamRow}>
            {team.scores.slice(startIndex, startIndex + 9).map((score, idx) => (
              <ScoreDisplay
                key={`${team.id}-${startIndex + idx}`}
                score={score}
                holeIndex={startIndex + idx}
                teamId={team.id}
                onScorePress={onScorePress}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  teamRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
});

export default ScorecardGrid;