import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ScoreSubmitButtonsProps {
  onSubmit: () => void;
  onViewScorecard: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}

export const ScoreSubmitButtons: React.FC<ScoreSubmitButtonsProps> = ({
  onSubmit,
  onViewScorecard,
  isSubmitting,
  isDisabled,
}) => {
  return (
    <View className="flex-row justify-between p-4">
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isDisabled || isSubmitting}
        className={`flex-1 mr-2 bg-blue-500 p-4 rounded-lg items-center ${
          isDisabled || isSubmitting ? "opacity-50" : ""
        }`}
      >
        <Text className="text-white font-semibold">Submit Scores</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onViewScorecard}
        className="flex-1 ml-2 bg-gray-700 p-4 rounded-lg items-center"
      >
        <Text className="text-white font-semibold">View Scorecard</Text>
      </TouchableOpacity>
    </View>
  );
};
