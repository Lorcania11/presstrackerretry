import React from 'react';
import { View, StyleSheet } from 'react-native';

const PressNotification = ({ presses = [] }) => {
  return (
    <View style={styles.container}>
      {presses.map((press, idx) => {
        const left = getLeftForTeam(press.toTeamId, idx);
        const top = getTopForHole(press.holeIndex);

        return (
          <View
            key={idx}
            style={[
              styles.dot,
              { backgroundColor: getColor(press.fromTeamId), top, left },
            ]}
          />
        );
      })}
    </View>
  );
};

const getColor = (id) => {
  switch (id) {
    case 1: return '#4CAE4F';
    case 2: return '#FFC105';
    case 3: return '#F44034';
    default: return '#000';
  }
};

const getLeftForTeam = (teamId, idx) => {
  const base = {
    1: 0,
    2: 12,
    3: 125,
  }[teamId] || 0;
  return base - idx * 10; // offset multiple dots
};

const getTopForHole = (holeIndex) => {
  const topBase = {
    0: 0,
    1: 50,
    2: 100,
    3: 150,
  };
  return topBase[holeIndex % 4] || 0;
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 200,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default PressNotification;
