// components/ScorecardScreen/ScoreDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ScoreDisplayProps {
  score: number | null;
  holeIndex: number;
  teamId: string;
  onScorePress?: (teamId: string, holeIndex: number) => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  holeIndex, 
  teamId, 
  onScorePress 
}) => {
  const handlePress = () => {
    if (onScorePress) {
      onScorePress(teamId, holeIndex);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={onScorePress ? 0.7 : 1}
    >
      <Text style={styles.scoreText}>
        {score !== null ? score.toString() : '-'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    backgroundColor: 'transparent',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default ScoreDisplay;