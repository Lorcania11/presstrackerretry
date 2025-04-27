import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface Team {
  id: string;
  name: string;
  color?: string;
}

interface Hole {
  number: number;
  scores: Array<{teamId: string, score: number | null}>;
  presses: Press[];
  isComplete: boolean;
}

interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  gameType: string;
}

interface GameType {
  id: string;
  name: string;
  amount: string;
  selected: boolean;
}

interface StepPressModalProps {
  isVisible: boolean;
  hole: Hole;
  teams: Team[];
  onClose: () => void;
  onSave: (press: Omit<Press, 'id'>) => void;
  teamColors?: {[key: string]: string}; // Fixed team colors mapping
}

const StepPressModal: React.FC<StepPressModalProps> = ({
  isVisible,
  hole,
  teams,
  onClose,
  onSave,
  teamColors = {
    '1': '#4CAE4F', // Default green for Team 1
    '2': '#FFC105', // Default yellow for Team 2
  }
}) => {
  const [fromTeamId, setFromTeamId] = useState<string | null>(null);
  const [toTeamId, setToTeamId] = useState<string | null>(null);
  
  // Game types that can be selected
  const [gameTypes, setGameTypes] = useState<GameType[]>([
    { id: 'front9', name: 'Front 9', amount: '$10', selected: false },
    { id: 'back9', name: 'Back 9', amount: '$10', selected: false },
    { id: 'total18', name: 'Total 18', amount: '$10', selected: false },
  ]);

  const handleSave = () => {
    if (!fromTeamId || !toTeamId) {
      Alert.alert('Error', 'Please select teams for the press');
      return;
    }

    const selectedGameTypes = gameTypes.filter(gt => gt.selected);
    if (selectedGameTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one game type');
      return;
    }

    // Create a press for each selected game type
    selectedGameTypes.forEach(gameType => {
      onSave({
        fromTeamId,
        toTeamId,
        holeIndex: hole.number - 1,
        gameType: gameType.id,
      });
    });
    
    handleClose();
  };

  const reset = () => {
    setFromTeamId(null);
    setToTeamId(null);
    setGameTypes(gameTypes.map(gt => ({ ...gt, selected: false })));
  };

  const toggleGameType = (id: string) => {
    setGameTypes(gameTypes.map(gt => 
      gt.id === id ? { ...gt, selected: !gt.selected } : gt
    ));
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Determine the current step of the press creation flow
  const getCurrentStep = () => {
    if (!fromTeamId) return 1;
    if (!toTeamId) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();
  
  // Team selection step
  const renderTeamSelectionStep = () => (
    <View>
      <Text style={styles.pressDetailsTitle}>Press Details</Text>
      
      <View style={styles.teamsContainer}>
        {teams.map((team, index) => {
          const otherTeamId = index === 0 ? teams[1]?.id : teams[0]?.id;
          const teamColor = teamColors[(index + 1).toString()] || team.color || '#888888';
          
          return (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamOption,
                { backgroundColor: teamColor }
              ]}
              onPress={() => {
                setFromTeamId(team.id);
                setToTeamId(otherTeamId);
              }}
            >
              <Text style={styles.teamText}>
                {team.name} to {teams.find(t => t.id === otherTeamId)?.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Game type selection step
  const renderGameTypeSelectionStep = () => {
    const fromTeam = teams.find(t => t.id === fromTeamId);
    const toTeam = teams.find(t => t.id === toTeamId);
    const fromTeamIndex = teams.findIndex(t => t.id === fromTeamId);
    const toTeamIndex = teams.findIndex(t => t.id === toTeamId);
    
    const fromTeamColor = teamColors[(fromTeamIndex + 1).toString()] || fromTeam?.color || '#4CAE4F';
    const toTeamColor = teamColors[(toTeamIndex + 1).toString()] || toTeam?.color || '#FFC105';
    
    return (
      <View>
        <Text style={styles.pressDetailsTitle}>Press Details</Text>
        
        <View style={styles.teamRow}>
          <View style={[styles.teamCircle, { backgroundColor: fromTeamColor }]}>
            <Text style={styles.teamInitial}>
              {fromTeam?.name?.charAt(0) || 'T'}
            </Text>
          </View>
          <Text style={styles.toText}>to</Text>
          <View style={[styles.teamCircle, { backgroundColor: toTeamColor }]}>
            <Text style={styles.teamInitial}>
              {toTeam?.name?.charAt(0) || 'T'}
            </Text>
          </View>
        </View>

        <Text style={styles.selectGameTypesTitle}>Select Game Types</Text>
        
        <View style={styles.gameTypesContainer}>
          {gameTypes.map((gameType) => (
            <TouchableOpacity
              key={gameType.id}
              style={styles.gameTypeRow}
              onPress={() => toggleGameType(gameType.id)}
            >
              <View style={styles.gameTypeInfo}>
                <Text style={styles.gameTypeName}>{gameType.name}</Text>
                <Text style={styles.gameTypeAmount}>{gameType.amount}</Text>
              </View>
              
              {/* Custom toggle button that visually shows selected state */}
              <View style={[
                styles.toggleButton,
                gameType.selected && styles.toggleButtonSelected
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleClose}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Press</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepsContainer}>
            {currentStep <= 2 
              ? renderTeamSelectionStep()
              : renderGameTypeSelectionStep()
            }
          </View>
          
          {currentStep > 2 && (
            <TouchableOpacity
              style={styles.addPressButton}
              onPress={handleSave}
            >
              <Text style={styles.addPressButtonText}>Add Press</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#4CAE4F',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  stepsContainer: {
    padding: 20,
  },
  pressDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  teamsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  teamOption: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  teamCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toText: {
    color: '#333333',
    fontSize: 16,
    marginHorizontal: 10,
  },
  selectGameTypesTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 15,
  },
  gameTypesContainer: {
    gap: 0,
  },
  gameTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  gameTypeInfo: {
    flex: 1,
  },
  gameTypeName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  gameTypeAmount: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAE4F',
    backgroundColor: 'transparent',
  },
  toggleButtonSelected: {
    backgroundColor: '#4CAE4F',
  },
  addPressButton: {
    backgroundColor: '#4CAE4F',
    padding: 15,
    alignItems: 'center',
    margin: 15,
    borderRadius: 8,
  },
  addPressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StepPressModal;