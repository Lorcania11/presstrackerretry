import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HoleNumbers = ({ showBack9 }) => {
  const holes = showBack9 ? [...Array(9)].map((_, i) => i + 10) : [...Array(9)].map((_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, styles.holeLabel]}>Hole</Text>
      {holes.map((hole, idx) => (
        <Text key={hole} style={[styles.label, styles[`hole${idx + 1}`]]}>
          {hole}
        </Text>
      ))}
      <Text style={[styles.label, styles.total]}>Total</Text>
      <Text style={[styles.label, styles.range]}>
        {showBack9 ? '10-18' : '1-9'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 458,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#000',
    lineHeight: 16,
  },
  holeLabel: {
    left: 0,
    top: 0,
  },
  hole1: { left: 12, top: 47 },
  hole2: { left: 12, top: 95 },
  hole3: { left: 12, top: 144 },
  hole4: { left: 12, top: 192 },
  hole5: { left: 12, top: 241 },
  hole6: { left: 12, top: 292 },
  hole7: { left: 12, top: 342 },
  hole8: { left: 12, top: 390 },
  hole9: { left: 12, top: 440 },
  total: { left: -4, top: 561 },
  range: { left: 3, top: 497 },
});

export default HoleNumbers;
