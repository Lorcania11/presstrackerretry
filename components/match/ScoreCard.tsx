import React, { useContext } from 'react';
import { View } from 'react-native';
import NavigationBar from '@/components/ScorecardScreen/NavigationBar';
import HeaderSection from '@/components/ScorecardScreen/HeaderSection';
import ScorecardTitle from '@/components/ScorecardScreen/ScorecardTitle';
import ScorecardWithPresses from '@/components/ScorecardScreen/ScorecardWithPresses';
import { MatchContext } from '@/context/MatchContext';

const ScoreCard = () => {
  const { match } = useContext(MatchContext);

  return (
    <View className="flex flex-col items-center bg-white">
      <NavigationBar />
      <HeaderSection />
      <ScorecardTitle />
      <ScorecardWithPresses match={match} />
    </View>
  );
};

export default ScoreCard;