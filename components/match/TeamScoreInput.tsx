// components/ScoreInput/TeamScoreInput.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import tw from 'twrnc';
import { Team } from "./types";

interface TeamScoreInputProps {
  team: Team;
  teamId: string;
  score: string;
  onScoreChange: (value: string) => void;
}

const TeamScoreInput: React.FC<TeamScoreInputProps> = ({
  team,
  teamId,
  score,
  onScoreChange,
}) => {
  return (
    <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}>
      <View style={tw`flex-row items-center flex-1`}>
        <View
          style={[
            tw`w-10 h-10 rounded-full items-center justify-center`,
            { backgroundColor: team.color }
          ]}
        >
          <Text style={tw`text-white font-bold`}>{team.initial}</Text>
        </View>
        <Text style={tw`ml-3 text-lg`}>
          {team.name || `Team ${teamId.slice(-1)}`}
        </Text>
      </View>

      <TextInput
        style={tw`w-16 h-12 border border-gray-300 rounded-lg text-center text-lg`}
        keyboardType="numeric"
        maxLength={2}
        placeholder="0"
        value={score}
        onChangeText={onScoreChange}
      />
    </View>
  );
};

export default TeamScoreInput;