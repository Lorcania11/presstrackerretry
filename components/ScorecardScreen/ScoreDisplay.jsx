import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScoreDisplay = ({ scores }) => {
  return (
    <View style={styles.container}>
      {scores?.[0] !== undefined && (
        <Text style={[styles.score, styles.left]}>{scores[0]}</Text>
      )}
      {scores?.[1] !== undefined && (
        <Text style={[styles.score, styles.center]}>{scores[1]}</Text>
      )}
      {scores?.[2] !== undefined && (
        <Text style={[styles.score, styles.right]}>{scores[2]}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 20,
    position: 'relative',
  },
  score: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000',
    lineHeight: 24,
  },
  left: {
    left: 0,
  },
  center: {
    left: 114,
  },
  right: {
    left: 226,
    top: 1,
  },
});

export default ScoreDisplay;
