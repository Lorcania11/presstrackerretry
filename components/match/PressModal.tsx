// components/ScoreInput/PressModal.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from 'twrnc';
import { Teams } from "./types";

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

const PressModal: React.FC<PressModalProps> = ({
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
    <View style={tw`absolute inset-0 bg-black bg-opacity-50`}>
      <View style={tw`m-4 bg-white rounded-lg overflow-hidden`}>
        <View style={tw`p-4 border-b border-gray-200`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-xl font-bold`}>Press Options</Text>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-lg font-bold`}>{pressStep}</Text>
              <Text style={tw`text-lg mx-1`}>/</Text>
              <Text style={tw`text-lg`}>{totalSteps}</Text>
            </View>
          </View>
        </View>

        <View style={tw`p-4`}>
          <View style={tw`flex-row items-center mb-4`}>
            <View
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                { backgroundColor: teams[currentPressingTeam]?.color || '#ccc' }
              ]}
            >
              <Text style={tw`text-white font-bold`}>
                {teams[currentPressingTeam]?.initial || '?'}
              </Text>
            </View>
            <Text style={tw`text-lg`}>
              Would {teams[currentPressingTeam]?.name || 'Team'} like to press{" "}
              {teams[currentTargetTeam]?.name || 'Team'}?
            </Text>
          </View>

          {!selectedGameType ? (
            <View style={tw`flex-row justify-around`}>
              <TouchableOpacity
                onPress={() => onPressResponse(false)}
                style={tw`bg-gray-500 px-8 py-3 rounded-lg`}
              >
                <Text style={tw`text-white font-semibold`}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPressResponse(true)}
                style={tw`bg-blue-500 px-8 py-3 rounded-lg`}
              >
                <Text style={tw`text-white font-semibold`}>Yes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={tw`space-y-3`}>
              {currentHole <= 9 && (
                <TouchableOpacity
                  onPress={() => onGameTypeSelect("F9")}
                  style={tw`bg-blue-500 p-3 rounded-lg`}
                >
                  <Text style={tw`text-white text-center font-semibold`}>
                    Front 9
                  </Text>
                </TouchableOpacity>
              )}
              {currentHole > 9 && (
                <TouchableOpacity
                  onPress={() => onGameTypeSelect("B9")}
                  style={tw`bg-blue-500 p-3 rounded-lg`}
                >
                  <Text style={tw`text-white text-center font-semibold`}>
                    Back 9
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => onGameTypeSelect("T18")}
                style={tw`bg-blue-500 p-3 rounded-lg`}
              >
                <Text style={tw`text-white text-center font-semibold`}>
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

export default PressModal;