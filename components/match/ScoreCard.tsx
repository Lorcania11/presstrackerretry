import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import MatchContext from '@/contexts/MatchContext';
import NavigationBar from '@/components/ScorecardScreen/NavigationBar';
import HeaderSection from '@/components/ScorecardScreen/HeaderSection';
import ScorecardTitle from '@/components/ScorecardScreen/ScorecardTitle';
import TeamsLayout from '@/components/ScorecardScreen/TeamsLayout';
import HoleNumbers from '@/components/ScorecardScreen/HoleNumbers';
import ScorecardGrid from '@/components/ScorecardScreen/ScorecardGrid';
import PressNotification from '@/components/ScorecardScreen/PressNotification';

const ScoreCard = () => {
  const { match } = useContext(MatchContext);
  const [showBack9, setShowBack9] = useState(false);

  const handleSwipeLeft = () => setShowBack9(true);
  const handleSwipeRight = () => setShowBack9(false);

  return (
    <GestureRecognizer onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
      <View style={styles.container}>
        <NavigationBar />
        <HeaderSection />
        <ScorecardTitle />
        <TeamsLayout teams={match.teams} />
        <HoleNumbers showBack9={showBack9} />
        <ScorecardGrid showBack9={showBack9} teams={match.teams} />
        <PressNotification presses={match.presses} showBack9={showBack9} />
      </View>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
});

export default ScoreCard;
