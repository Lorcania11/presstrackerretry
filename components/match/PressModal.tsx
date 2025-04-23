import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Teams } from "../types";

interface PressModalProps {
  visible: boolean;
  pressStep: number;
  totalSteps: number;
  teams: Teams;
  currentPressingTeam: string;
  currentTargetTeam: string;
  selectedGameType: string;
  currentHole: number;
  onPressResponse: (response: boolean) => void;
  onGameTypeSelect: (type: string) => void;
}

export const PressModal: React.FC<PressModalProps> = ({
  visible,
  pressStep,
  totalSteps,
  teams,
  currentPressingTeam,
  currentTargetTeam,
  selectedGameType,
  currentHole,
  onPressResponse,
  onGameTypeSelect,
}) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black bg-opacity-50">
      <View className="m-4 bg-white rounded-lg overflow-hidden">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold">Press Options</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold">{pressStep}</Text>
              <Text className="text-lg mx-1">/</Text>
              <Text className="text-lg">{totalSteps}</Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: teams[currentPressingTeam].color }}
            >
              <Text className="text-white font-bold">
                {teams[currentPressingTeam].initial}
              </Text>
            </View>
            <Text className="text-lg">
              Would {teams[currentPressingTeam].name} like to press{" "}
              {teams[currentTargetTeam].name}?
            </Text>
          </View>

          {!selectedGameType ? (
            <View className="flex-row justify-around">
              <TouchableOpacity
                onPress={() => onPressResponse(false)}
                className="bg-gray-500 px-8 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressResponse(true)}
                className="bg-blue-500 px-8 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Yes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {currentHole <= 9 && (
                <TouchableOpacity
                  onPress={() => onGameTypeSelect("F9")}
                  className="bg-blue-500 p-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Front 9
                  </Text>
                </TouchableOpacity>
              )}
              {currentHole > 9 && (
                <TouchableOpacity
                  onPress={() => onGameTypeSelect("B9")}
                  className="bg-blue-500 p-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Back 9
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => onGameTypeSelect("T18")}
                className="bg-blue-500 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Total 18
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
