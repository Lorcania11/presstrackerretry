import React from 'react';
import { View, Text } from 'react-native';
import PressNotification from './PressNotification';

const ScoreCard = ({ matchId, presses }) => {
  return (
    <View>
      {/* Other ScoreCard content */}
      <PressNotification presses={presses} matchId={matchId} />
    </View>
  );
};

export default ScoreCard;