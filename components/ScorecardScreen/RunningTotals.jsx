// components/ScorecardScreen/RunningTotals.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RunningTotalsProps {
  teams: Array<{
    id: string;
    name: string;
    scores: Array<number | null>;
  }>;
  showBack9: boolean;
}

const RunningTotals: React.FC<RunningTotalsProps> = ({ teams, showBack9 }) => {
  const totals = useMemo(() => {
    return teams.map(team => {
      const front9 = team.scores.slice(0, 9).reduce((sum, score) => 
        sum + (score !== null ? score : 0), 0);
      
      const back9 = team.scores.slice(9, 18).reduce((sum, score) => 
        sum + (score !== null ? score : 0), 0);
      
      return {
        teamId: team.id,
        front9,
        back9,
        total: front9 + back9
      };
    });
  }, [teams]);
  
  return (
    <View style={styles.container}>
      {totals.map((total) => (
        <View key={total.teamId} style={styles.totalRow}>
          <Text style={styles.sectionTotal}>
            {showBack9 ? total.back9 : total.front9}
          </Text>
          <Text style={styles.grandTotal}>{total.total}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 1,
  },
  sectionTotal: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  grandTotal: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: '700',
  }
});

export default RunningTotals;