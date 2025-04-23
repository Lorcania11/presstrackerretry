import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface HoleNavigationProps {
  currentHole: number;
  onHoleChange: (hole: number) => void;
}

export const HoleNavigation: React.FC<HoleNavigationProps> = ({
  currentHole,
  onHoleChange,
}) => {
  return (
    <View className="flex-row items-center justify-between p-4 bg-gray-100">
      <TouchableOpacity
        onPress={() => onHoleChange(Math.max(1, currentHole - 1))}
        className="p-2"
      >
        <Text className="text-2xl text-blue-500">←</Text>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Text className="text-lg font-semibold">Hole </Text>
        <Text className="text-lg font-bold">{currentHole}</Text>
      </View>

      <TouchableOpacity
        onPress={() => onHoleChange(Math.min(18, currentHole + 1))}
        className="p-2"
      >
        <Text className="text-2xl text-blue-500">→</Text>
      </TouchableOpacity>
    </View>
  );
};
