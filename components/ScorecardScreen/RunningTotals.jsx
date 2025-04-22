import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RunningTotals = ({ front9Scores = [], back9Scores = [] }) => {
  const front9Total = front9Scores.reduce((sum, score) => sum + (score || 0), 0);
  const back9Total = back9Scores.reduce((sum, score) => sum + (score || 0), 0);
  const combinedTotal = front9Total + back9Total;

  return (
    <View style={styles.container}>
      <Text style={styles.front9Total}>{front9Total}</Text>
      <Text style={styles.back9Total}>{back9Total}</Text>
      <Text style={styles.combinedTotal}>{combinedTotal}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexShrink: 0,
    height: 83,
    width: 272,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: 0,
  },
  front9Total: {
    position: 'absolute',
    flexShrink: 0,
    width: 35,
    height: 18,
    textAlign: 'left',
    color: 'rgba(15, 15, 15, 0.5)',
    fontFamily: 'Open Sans',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 18,
    left: 4,
  },
  back9Total: {
    position: 'absolute',
    flexShrink: 0,
    width: 35,
    height: 18,
    textAlign: 'left',
    color: 'rgba(15, 15, 15, 0.5)',
    fontFamily: 'Open Sans',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 18,
    left: 113,
  },
  combinedTotal: {
    position: 'absolute',
    flexShrink: 0,
    width: 46,
    height: 18,
    textAlign: 'left',
    color: 'rgba(15, 15, 15, 0.75)',
    fontFamily: 'Open Sans',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 18,
    left: 226,
  },
});

export default RunningTotals;