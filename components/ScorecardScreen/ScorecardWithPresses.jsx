import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScorecardWithPresses = ({ scores, pressIndicators }) => {
  return (
    <View style={styles.scoreRow}>
      {scores.map((score, index) => (
        <View key={index} style={styles.scoreCell}>
          <Text style={styles.scoreText}>{score}</Text>
          {pressIndicators[index]?.map((color, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: color }]} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  scoreCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    position: 'relative',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    right: 4,
  },
});

export default ScorecardWithPresses;
