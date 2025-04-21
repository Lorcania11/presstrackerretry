import React, { useContext } from 'react';
import { View } from 'react-native';
import NavigationBar from '@/components/ScorecardScreen/NavigationBar';
import HeaderSection from '@/components/ScorecardScreen/HeaderSection';
import ScoreDisplay from '@/components/ScorecardScreen/ScoreDisplay';
import ScorecardTitle from '@/components/ScorecardScreen/ScorecardTitle';
import ScorecardGrid from '@/components/ScorecardScreen/ScorecardGrid';
import HoleNumbers from '@/components/ScorecardScreen/HoleNumbers';
import TeamsLayout from '@/components/ScorecardScreen/TeamsLayout';
import PressNotification from '@/components/ScorecardScreen/PressNotification';
import { MatchContext } from '@/context/MatchContext';

const ScoreCard = () => {
  const { match } = useContext(MatchContext);
  const teams = match.teams || [];
  const holes = match.holes || [];

  return (
    <View className="flex flex-col items-center bg-white">
      <NavigationBar />
      <HeaderSection />
      <ScorecardTitle />

      <View className="flex flex-row items-start mt-2">
        <HoleNumbers />

        <View className="flex flex-col gap-[13px] ml-4">
          {holes.slice(0, 9).map((hole, index) => (
            <ScoreDisplay
              key={index}
              scores={teams.map((team) => team.scores?.[index] ?? '')}
            />
          ))}
        </View>

        <View className="absolute right-4 top-[0px]">
          <PressNotification presses={match.presses} />
        </View>
      </View>

      <TeamsLayout teams={teams} />
      <ScorecardGrid />
    </View>
  );
};

export default ScoreCard;
