// components/ScoreInput/ScoreSubmitButtons.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from 'twrnc';

interface ScoreSubmitButtonsProps {
  onSubmit: () => void;
  onViewScorecard: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}

const ScoreSubmitButtons: React.FC<ScoreSubmitButtonsProps> = ({
  onSubmit,
  onViewScorecard,
  isSubmitting,
  isDisabled,
}) => {
  return (
    <View style={tw`flex-row justify-between p-4`}>
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isDisabled || isSubmitting}
        style={[
          tw`flex-1 mr-2 bg-blue-500 p-4 rounded-lg items-center`,
          (isDisabled || isSubmitting) && tw`opacity-50`
        ]}
      >
        <Text style={tw`text-white font-semibold`}>Submit Scores</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onViewScorecard}
        style={tw`flex-1 ml-2 bg-gray-700 p-4 rounded-lg items-center`}
      >
        <Text style={tw`text-white font-semibold`}>View Scorecard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ScoreSubmitButtons;