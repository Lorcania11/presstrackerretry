import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import NavigationBar from './NavigationBar';
import HeaderSection from './HeaderSection';
import ScorecardTitle from './ScorecardTitle';
import TeamsLayout from './TeamsLayout';
import HoleNumbers from './HoleNumbers';
import ScorecardGrid from './ScorecardGrid';
import PressNotification from './PressNotification';
import { MatchContext } from '@/contexts/MatchContext';

const ScoreCard = () => {
  const { match } = useContext(MatchContext);
  const [showBack9, setShowBack9] = useState(false);

  const handleSwipeLeft = () => setShowBack9(true);
  const handleSwipeRight = () => setShowBack9(false);

  if (!match) return null;

  return (
    <GestureRecognizer onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
      <View>
        <NavigationBar />
        <HeaderSection />
        <ScorecardTitle />
        <TeamsLayout teams={match.teams} />
        <HoleNumbers showBack9={showBack9} />
        <ScorecardGrid showBack9={showBack9} />
        <PressNotification presses={match.presses} />
      </View>
    </GestureRecognizer>
  );
};

export default ScoreCard;
