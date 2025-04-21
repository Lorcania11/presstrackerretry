import React from 'react';
import { View, StyleSheet } from 'react-native';

const ScorecardGrid = ({ showBack9 }) => {
  const holeLines = Array.from({ length: 10 }, (_, i) => 90 + i * 50);
  const teamLines = [176, 289];

  return (
    <View style={styles.container}>
      {holeLines.map((top, i) => (
        <View key={`hline-${i}`} style={[styles.vLine, { top }]} />
      ))}
      {teamLines.map((left, i) => (
        <View key={`vline-${i}`} style={[styles.hLine, { left }]} />
      ))}
      <View style={styles.footer} />
      <View style={styles.totals} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 384,
    height: 540,
    position: 'relative',
  },
  vLine: {
    position: 'absolute',
    left: 0,
    width: 384,
    height: 1,
    backgroundColor: 'rgba(72,72,73,0.2)',
  },
  hLine: {
    position: 'absolute',
    top: 0,
    height: 540,
    width: 1,
    backgroundColor: 'rgba(72,72,73,0.2)',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(120,120,120,0.1)',
  },
  totals: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(120,120,120,0.1)',
  },
});

export default ScorecardGrid;
