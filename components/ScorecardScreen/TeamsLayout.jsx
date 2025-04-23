// components/ScorecardScreen/TeamsLayout.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TeamsLayoutProps {
  teams: Array<{
    id: string;
    name: string;
  }>;
}

const TeamsLayout: React.FC<TeamsLayoutProps> = ({ teams }) => {
  const teamColors = ['#4CAE4F', '#FFC105', '#F44034'];
  
  return (
    <View style={styles.container}>
      {teams.map((team, index) => (
        <View key={team.id} style={styles.teamContainer}>
          <View 
            style={[
              styles.colorIndicator, 
              { backgroundColor: teamColors[index % teamColors.length] }
            ]} 
          />
          <Text 
            style={styles.teamName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {team.name}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    width: 100,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default TeamsLayout;