import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { HoleNavigation } from "./HoleNavigation";
import { TeamScoreInput } from "./TeamScoreInput";
import { ScoreSubmitButtons } from "./ScoreSubmitButtons";
import { ScorecardModal } from "./ScorecardModal";
import { PressModal } from "./PressModal";
import { Teams, Scores, Press } from "./types";

export const InputDesign: React.FC = () => {
  const [showScorecard, setShowScorecard] = useState(false);
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Scores>({
    team1: "",
    team2: "",
    team3: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [pressStep, setPressStep] = useState(1);
  const [totalSteps] = useState(6);
  const [activePresses, setActivePresses] = useState<Press[]>([]);
  const [currentPressingTeam, setCurrentPressingTeam] = useState("team1");
  const [currentTargetTeam, setCurrentTargetTeam] = useState("team2");
  const [selectedGameType, setSelectedGameType] = useState("");

  const [teams] = useState<Teams>({
    team1: {
      name: "Kaleb Solo",
      initial: "K",
      color: "#4CAE4F",
    },
    team2: {
      name: "JMAC",
      initial: "G",
      color: "#FFC105",
    },
    team3: {
      name: "Long Hitters",
      initial: "L",
      color: "#F44034",
    },
  });

  const submitScores = () => {
    if (!scores.team1 || !scores.team2 || !scores.team3) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setScores({
        team1: "",
        team2: "",
        team3: "",
      });
      setShowPressModal(true);
      setPressStep(1);
      setActivePresses([]);
      setCurrentPressingTeam("team1");
      setCurrentTargetTeam("team2");
      setSelectedGameType("");
      setIsSubmitting(false);
    }, 500);
  };

  const handlePressResponse = (response: boolean) => {
    if (response) {
      setSelectedGameType("");
    } else {
      advanceStep();
    }
  };

  const selectGameType = (type: string) => {
    setActivePresses([
      ...activePresses,
      {
        pressingTeam: currentPressingTeam,
        targetTeam: currentTargetTeam,
        type,
      },
    ]);
    advanceStep();
  };

  const advanceStep = () => {
    const newStep = pressStep + 1;
    setPressStep(newStep);
    setSelectedGameType("");
    if (newStep > totalSteps) {
      setShowPressModal(false);
      setCurrentHole(Math.min(currentHole + 1, 18));
      return;
    }
    updateTeamPairing(newStep);
  };

  const updateTeamPairing = (step: number) => {
    const pairings = [
      ["team1", "team2"],
      ["team1", "team3"],
      ["team2", "team1"],
      ["team2", "team3"],
      ["team3", "team1"],
      ["team3", "team2"],
    ];
    const currentPairing = pairings[step - 1];
    setCurrentPressingTeam(currentPairing[0]);
    setCurrentTargetTeam(currentPairing[1]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <HoleNavigation
          currentHole={currentHole}
          onHoleChange={setCurrentHole}
        />

        <View className="py-4">
          {Object.entries(teams).map(([teamId, team]) => (
            <TeamScoreInput
              key={teamId}
              team={team}
              teamId={teamId}
              score={scores[teamId as keyof Scores]}
              onScoreChange={(value) =>
                setScores((prev) => ({ ...prev, [teamId]: value }))
              }
            />
          ))}
        </View>

        <ScoreSubmitButtons
          onSubmit={submitScores}
          onViewScorecard={() => setShowScorecard(true)}
          isSubmitting={isSubmitting}
          isDisabled={!scores.team1 || !scores.team2 || !scores.team3}
        />
      </ScrollView>

      <ScorecardModal
        visible={showScorecard}
        onClose={() => setShowScorecard(false)}
        teams={teams}
        scores={scores}
        currentHole={currentHole}
      />

      <PressModal
        visible={showPressModal}
        pressStep={pressStep}
        totalSteps={totalSteps}
        teams={teams}
        currentPressingTeam={currentPressingTeam}
        currentTargetTeam={currentTargetTeam}
        selectedGameType={selectedGameType}
        currentHole={currentHole}
        onPressResponse={handlePressResponse}
        onGameTypeSelect={selectGameType}
      />
    </View>
  );
};

export default InputDesign;
