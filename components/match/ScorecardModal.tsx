// components/ScoreInput/ScorecardModal.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import tw from 'twrnc';
import { Teams, Scores, MatchData } from "./types";

interface ScorecardModalProps {
  visible: boolean;
  onClose: () => void;
  teams: Teams;
  scores: Scores;
  currentHole: number;
  match?: MatchData;
}

const ScorecardModal: React.FC<ScorecardModalProps> = ({
  visible,
  onClose,
  teams,
  scores,
  currentHole,
  match,
}) => {
  if (!visible) return null;

  return (
    <View style={tw`absolute inset-0 bg-black bg-opacity-50`}>
      <View style={tw`m-4 bg-white rounded-lg overflow-hidden`}>
        <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200`}>
          <Text style={tw`text-xl font-bold`}>Scorecard</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={tw`text-blue-500`}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={tw`p-4`}>
          <View style={tw`flex-row border-b border-gray-200 pb-2`}>
            <View style={tw`w-16`}>
              <Text style={tw`font-bold`}>Hole</Text>
            </View>
            {Object.entries(teams).map(([teamId, team]) => (
              <View key={teamId} style={tw`flex-1 items-center`}>
                <Text style={[tw`font-bold`, { color: team.color }]}>
                  {team.name}
                </Text>
              </View>
            ))}
          </View>

          {[...Array(18)].map((_, index) => (
            <View
              key={index}
              style={[
                tw`flex-row py-2`,
                index === currentHole - 1 ? tw`bg-gray-100` : tw`bg-white`
              ]}
            >
              <View style={tw`w-16`}>
                <Text>{index + 1}</Text>
              </View>
              {Object.keys(teams).map((teamId) => (
                <View key={teamId} style={tw`flex-1 items-center`}>
                  {index + 1 === currentHole ? (
                    <Text>{scores[teamId] || "-"}</Text>
                  ) : (
                    <Text>-</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default ScorecardModal;