// components/ScoreInput/HoleNavigation.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from 'twrnc';

interface HoleNavigationProps {
  currentHole: number;
  onHoleChange: (hole: number) => void;
}

const HoleNavigation: React.FC<HoleNavigationProps> = ({
  currentHole,
  onHoleChange,
}) => {
  return (
    <View style={tw`flex-row items-center justify-between p-4 bg-gray-100`}>
      <TouchableOpacity
        onPress={() => onHoleChange(Math.max(1, currentHole - 1))}
        style={tw`p-2`}
      >
        <Text style={tw`text-2xl text-blue-500`}>←</Text>
      </TouchableOpacity>

      <View style={tw`flex-row items-center`}>
        <Text style={tw`text-lg font-semibold`}>Hole </Text>
        <Text style={tw`text-lg font-bold`}>{currentHole}</Text>
      </View>

      <TouchableOpacity
        onPress={() => onHoleChange(Math.min(18, currentHole + 1))}
        style={tw`p-2`}
      >
        <Text style={tw`text-2xl text-blue-500`}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HoleNavigation;