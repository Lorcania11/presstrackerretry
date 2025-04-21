import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScorecardTitle = () => {
  return (
    <View style={styles.container}>
      <View style={styles.button} />
      <Text style={styles.pressLog}>Press Log</Text>
      <View style={styles.iconDot} />
      <Text style={styles.title}>Scorecard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 384,
    height: 48,
    position: 'relative',
  },
  button: {
    position: 'absolute',
    width: 112,
    height: 28,
    top: 12,
    left: 276,
    backgroundColor: 'rgba(15, 15, 15, 0.75)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressLog: {
    position: 'absolute',
    top: 17,
    left: 315,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#FBFAF5',
    lineHeight: 14,
  },
  iconDot: {
    position: 'absolute',
    top: 15,
    left: 289,
    width: 20,
    height: 20,
    backgroundColor: '#FBFAF5',
    borderRadius: 10,
  },
  title: {
    position: 'absolute',
    top: 17,
    left: 20,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Open Sans',
    color: '#484849',
    lineHeight: 28,
  },
});

export default ScorecardTitle;
