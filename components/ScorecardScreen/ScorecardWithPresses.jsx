import React from 'react';
import { View } from 'react-native';
import { useMatchContext } from '@/context/MatchContext';
import HoleNumbers from './HoleNumbers';
import ScoreDisplay from './ScoreDisplay';
import PressNotification from './PressNotification';
import RunningTotals from './RunningTotals';

const ScorecardWithPresses = ({ matchId, front9Scores = [], back9Scores = [], presses = [] }) => {
  const { teams } = useMatchContext();

  return (
    <View>
      {/* Front 9 Section */}
      <View className="flex flex-row items-start mt-2">
        <HoleNumbers showBack9={false} />
        <View className="flex flex-col gap-[13px] ml-4">
          {teams.map((team) => team.scores?.slice(0, 9) || []).flat().map((score, index) => (
            <ScoreDisplay
              key={`front9-${index}`}
              scores={teams.map((team) => team.scores?.[index] ?? '')}
            />
          ))}
        </View>
        <View className="absolute right-4 top-[0px]">
          <PressNotification presses={presses} matchId={matchId} />
        </View>
      </View>

      {/* Back 9 Section */}
      <View className="flex flex-row items-start mt-4">
        <HoleNumbers showBack9={true} />
        <View className="flex flex-col gap-[13px] ml-4">
          {teams.map((team) => team.scores?.slice(9, 18) || []).flat().map((score, index) => (
            <ScoreDisplay
              key={`back9-${index}`}
              scores={teams.map((team) => team.scores?.[index + 9] ?? '')}
            />
          ))}
        </View>
        <View className="absolute right-4 top-[0px]">
          <PressNotification presses={presses} matchId={matchId} />
        </View>
      </View>

      {/* Running Totals */}
      <RunningTotals front9Scores={front9Scores.flat()} back9Scores={back9Scores.flat()} />
    </View>
  );
};

export default ScorecardWithPresses;