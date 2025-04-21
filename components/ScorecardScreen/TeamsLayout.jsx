import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TeamsLayout = ({ teams }) => {
  return (
    <View style={styles.container}>
      {teams?.map((team, index) => (
        <View key={team.id} style={[styles.teamWrapper, styles[`team${index + 1}`]]}>
          <View style={[styles.circle, { backgroundColor: team.color || getTeamColor(team.id) }]} />
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.initial}>{team.name?.charAt(0)}</Text>
        </View>
      ))}
    </View>
  );
};

const getTeamColor = (id) => {
  switch (id) {
    case 1: return '#4CAE4F';
    case 2: return '#FFC105';
    case 3: return '#F44034';
    default: return '#000000';
  }
};

const styles = StyleSheet.create({
  container: {
    width: 288,
    height: 64,
    position: 'relative',
  },
  teamWrapper: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  team1: {
    left: 0,
    top: 1,
  },
  team2: {
    left: 122,
    top: 1,
  },
  team3: {
    left: 221,
    top: 0,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'absolute',
    left: '50%',
    marginLeft: -22,
    top: 0,
  },
  teamName: {
    position: 'absolute',
    top: 52,
    left: 0,
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#000',
  },
  initial: {
    position: 'absolute',
    top: 13,
    left: '50%',
    marginLeft: -6,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#000',
  },
});

export default TeamsLayout;
