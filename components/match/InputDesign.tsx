// components/ScoreInput/InputDesign.tsx
import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import { HoleNavigation } from "./HoleNavigation";
import { TeamScoreInput } from "./TeamScoreInput";
import { ScoreSubmitButtons } from "./ScoreSubmitButtons";
import { ScorecardModal } from "./ScorecardModal";
import { PressModal } from "./PressModal";
import { Teams, Scores, Press, MatchData } from "./types";

interface InputDesignProps {
  match: MatchData;
  formattedTeams: Teams;
  onUpdateMatch: (updatedMatch: MatchData) => Promise<boolean>;
  onBack?: () => void;
}

const InputDesign: React.FC<InputDesignProps> = ({ 
  match, 
  formattedTeams,
  onUpdateMatch,
  onBack
}) => {
  const [showScorecard, setShowScorecard] = useState(false);
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Scores>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [pressStep, setPressStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(6);
  const [activePresses, setActivePresses] = useState<Press[]>([]);
  const [currentPressingTeam, setCurrentPressingTeam] = useState("team1");
  const [currentTargetTeam, setCurrentTargetTeam] = useState("team2");
  const [selectedGameType, setSelectedGameType] = useState("");

  // Initialize state when match data changes
  useEffect(() => {
    if (!match) return;
    
    // Find first incomplete hole
    const firstIncompleteHole = match.holes.findIndex(hole => !hole.isComplete);
    if (firstIncompleteHole !== -1) {
      setCurrentHole(firstIncompleteHole + 1);
    } else {
      setCurrentHole(1); // Default to hole 1 if all holes complete
    }
    
    // Calculate total press steps based on team count
    const teamCount = Object.keys(formattedTeams).length;
    setTotalSteps(teamCount * (teamCount - 1));
    
    // Initialize scores object
    initializeScores(1);
  }, [match]);
  
  // Update scores when current hole changes
  useEffect(() => {
    initializeScores(currentHole);
  }, [currentHole]);
  
  const initializeScores = (holeNumber: number) => {
    if (!match || !match.holes) return;
    
    const holeIndex = holeNumber - 1;
    if (holeIndex < 0 || holeIndex >= match.holes.length) return;
    
    const newScores: Scores = {};
    
    match.teams.forEach((team, index) => {
      const teamId = `team${index + 1}`;
      const scoreData = match.holes[holeIndex].scores.find(s => s.teamId === team.id);
      const score = scoreData ? scoreData.score : null;
      
      newScores[teamId] = score !== null && score !== undefined ? score.toString() : "";
    });
    
    setScores(newScores);
  };

  const submitScores = async () => {
    if (!match) return;
    
    // Validate scores
    const teamIds = Object.keys(formattedTeams);
    for (const teamId of teamIds) {
      if (!scores[teamId]) {
        Alert.alert("Missing Scores", "Please enter scores for all teams");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Clone match
      const updatedMatch = JSON.parse(JSON.stringify(match));
      
      // Update scores for current hole
      const holeIndex = currentHole - 1;
      
      match.teams.forEach((team, index) => {
        const teamId = `team${index + 1}`;
        const scoreValue = parseInt(scores[teamId]);
        
        if (!isNaN(scoreValue)) {
          const scoreIndex = updatedMatch.holes[holeIndex].scores.findIndex(
            (s: { teamId: string; score: number | null }) => s.teamId === team.id
          );
          
          if (scoreIndex !== -1) {
            updatedMatch.holes[holeIndex].scores[scoreIndex].score = scoreValue;
          }
        }
      });
      
      // Mark hole as complete
      updatedMatch.holes[holeIndex].isComplete = true;
      
      // Save updated match
      const success = await onUpdateMatch(updatedMatch);
      
      if (success) {
        // Show press modal if presses are enabled
        if (updatedMatch.enablePresses) {
          setShowPressModal(true);
          setPressStep(1);
          setActivePresses([]);
          updateTeamPairing(1);
          setSelectedGameType("");
        } else {
          // Move to next hole if presses are disabled
          moveToNextHole();
        }
      }
    } catch (error) {
      console.error('Error updating scores:', error);
      Alert.alert('Error', 'Failed to update scores');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressResponse = (response: boolean) => {
    if (response) {
      setSelectedGameType("");
    } else {
      advanceStep();
    }
  };

  const selectGameType = async (type: string) => {
    if (!match) return;
    
    // Add press to active presses
    const newPress = {
      pressingTeam: currentPressingTeam,
      targetTeam: currentTargetTeam,
      type,
    };
    
    setActivePresses([...activePresses, newPress]);
    
    // Add press to match data
    try {
      const updatedMatch = JSON.parse(JSON.stringify(match));
      
      // Convert from teamX format to actual team IDs
      const pressingTeamIndex = parseInt(currentPressingTeam.replace('team', '')) - 1;
      const targetTeamIndex = parseInt(currentTargetTeam.replace('team', '')) - 1;
      
      if (pressingTeamIndex < 0 || pressingTeamIndex >= match.teams.length || 
          targetTeamIndex < 0 || targetTeamIndex >= match.teams.length) {
        throw new Error('Invalid team index');
      }
      
      const pressingTeamId = match.teams[pressingTeamIndex].id;
      const targetTeamId = match.teams[targetTeamIndex].id;
      
      // Add press to match
      updatedMatch.presses.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        fromTeamId: pressingTeamId,
        toTeamId: targetTeamId,
        holeIndex: currentHole - 1,
        pressType: type,
      });
      
      await onUpdateMatch(updatedMatch);
    } catch (error) {
      console.error('Error adding press:', error);
      Alert.alert('Error', 'Failed to add press');
    }
    
    advanceStep();
  };

  const advanceStep = () => {
    const newStep = pressStep + 1;
    setPressStep(newStep);
    setSelectedGameType("");
    
    if (newStep > totalSteps) {
      setShowPressModal(false);
      moveToNextHole();
      return;
    }
    
    updateTeamPairing(newStep);
  };

  const moveToNextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
    }
  };

  const updateTeamPairing = (step: number) => {
    const teamIds = Object.keys(formattedTeams);
    const pairings: string[][] = [];
    
    // Generate all possible team pairings
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = 0; j < teamIds.length; j++) {
        if (i !== j) {
          pairings.push([teamIds[i], teamIds[j]]);
        }
      }
    }
    
    if (pairings.length === 0 || step > pairings.length) {
      return;
    }
    
    const currentPairing = pairings[(step - 1) % pairings.length];
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
          {Object.entries(formattedTeams).map(([teamId, team]) => (
            <TeamScoreInput
              key={teamId}
              team={team}
              teamId={teamId}
              score={scores[teamId] || ""}
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
          isDisabled={Object.values(scores).some(score => !score)}
        />
      </ScrollView>

      <ScorecardModal
        visible={showScorecard}
        onClose={() => setShowScorecard(false)}
        teams={formattedTeams}
        scores={scores}
        currentHole={currentHole}
        match={match}
      />

      <PressModal
        visible={showPressModal}
        pressStep={pressStep}
        totalSteps={totalSteps}
        teams={formattedTeams}
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