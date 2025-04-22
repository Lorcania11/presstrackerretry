import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScoreDisplay = ({ scores = [] }) => {
  return (
    <View style={styles.container}>
      {scores.map((score, index) => {
        const positionStyle =
          index === 0 ? styles.left : index === 1 ? styles.center : styles.right;
        return (
          <Text key={index} style={[styles.score, positionStyle]}>
            {score !== undefined ? score : ''}
          </Text>
        );
      })}
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
