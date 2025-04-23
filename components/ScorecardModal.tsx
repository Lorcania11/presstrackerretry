import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Teams } from "./types";

interface ScorecardModalProps {
  visible: boolean;
  onClose: () => void;
  teams: Teams;
  scores: Scores;
  currentHole: number;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  visible,
  onClose,
  teams,
  scores,
  currentHole,
}) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black bg-opacity-50">
      <View className="m-4 bg-white rounded-lg overflow-hidden">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-xl font-bold">Scorecard</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="p-4">
          <View className="flex-row border-b border-gray-200 pb-2">
            <View className="w-16">
              <Text className="font-bold">Hole</Text>
            </View>
            <View className="flex-1 items-center">
              <Text style={{ color: teams.team1.color }} className="font-bold">
                {teams.team1.name || "Kaleb Solo"}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text style={{ color: teams.team2.color }} className="font-bold">
                {teams.team2.name || "JMAC"}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text style={{ color: teams.team3.color }} className="font-bold">
                {teams.team3.name || "Long Hitters"}
              </Text>
            </View>
          </View>

          {[...Array(18)].map((_, index) => (
            <View
              key={index}
              className="flex-row py-2"
              style={{
                backgroundColor:
                  index === currentHole - 1 ? "#F2F2F7" : "#ffffff",
              }}
            >
              <View className="w-16">
                <Text>{index + 1}</Text>
              </View>
              <View className="flex-1 items-center">
                {index + 1 === currentHole ? (
                  <Text>{scores.team1}</Text>
                ) : (
                  <Text>-</Text>
                )}
              </View>
              <View className="flex-1 items-center">
                {index + 1 === currentHole ? (
                  <Text>{scores.team2}</Text>
                ) : (
                  <Text>-</Text>
                )}
              </View>
              <View className="flex-1 items-center">
                {index + 1 === currentHole ? (
                  <Text>{scores.team3}</Text>
                ) : (
                  <Text>-</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
