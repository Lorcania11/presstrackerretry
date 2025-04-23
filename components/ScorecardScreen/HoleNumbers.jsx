// components/ScorecardScreen/HoleNumbers.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface HoleNumbersProps {
  showBack9: boolean;
}

const HoleNumbers: React.FC<HoleNumbersProps> = ({ showBack9 }) => {
  const { height, width } = Dimensions.get('window');
  const holes = showBack9 ? [...Array(9)].map((_, i) => i + 10) : [...Array(9)].map((_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.holeLabel}>Hole</Text>
      {holes.map((hole) => (
        <Text key={hole} style={styles.number}>{hole}</Text>
      ))}
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.rangeLabel}>
        {showBack9 ? '10-18' : '1-9'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    paddingRight: 8,
  },
  holeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  number: {
    fontSize: 16,
    fontWeight: '500',
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  }
});

export default HoleNumbers;