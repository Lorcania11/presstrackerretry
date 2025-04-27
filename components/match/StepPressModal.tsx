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
  pressType: string;
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
    '1': '#007AFF', // Default blue for Team 1
    '2': '#FF3B30', // Default red for Team 2
  }
}) => {
  const [fromTeamId, setFromTeamId] = useState<string | null>(null);
  const [toTeamId, setToTeamId] = useState<string | null>(null);
  const [pressType, setPressType] = useState<string | null>(null);

  const handleSave = () => {
    if (!fromTeamId || !toTeamId || !pressType) {
      Alert.alert('Error', 'Please complete all steps');
      return;
    }

    onSave({
      fromTeamId,
      toTeamId,
      holeIndex: hole.number - 1,
      pressType,
    });
  };

  const reset = () => {
    setFromTeamId(null);
    setToTeamId(null);
    setPressType(null);
  };

  const getTeamStyle = (teamId: string, selectedId: string | null) => {
    // Use fixed team colors based on team ID for consistent team representation
    const baseColor = teamColors[teamId] || '#888888';
    return {
      backgroundColor: selectedId === teamId ? baseColor : 'white',
      borderColor: baseColor,
      borderWidth: 2,
    };
  };

  const getTeamTextStyle = (teamId: string, selectedId: string | null) => {
    return {
      color: selectedId === teamId ? 'white' : teamColors[teamId] || '#888888',
    };
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 1: Who is pressing?</Text>
      <View style={styles.teamsContainer}>
        {teams.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={[styles.teamButton, getTeamStyle(team.id, fromTeamId)]}
            onPress={() => setFromTeamId(team.id)}
          >
            <Text style={[styles.teamText, getTeamTextStyle(team.id, fromTeamId)]}>
              {team.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 2: Who are they pressing?</Text>
      <View style={styles.teamsContainer}>
        {teams
          .filter((team) => team.id !== fromTeamId)
          .map((team) => (
            <TouchableOpacity
              key={team.id}
              style={[styles.teamButton, getTeamStyle(team.id, toTeamId)]}
              onPress={() => setToTeamId(team.id)}
            >
              <Text style={[styles.teamText, getTeamTextStyle(team.id, toTeamId)]}>
                {team.name}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 3: Press Type</Text>
      <View style={styles.pressTypesContainer}>
        <TouchableOpacity
          style={[
            styles.pressTypeButton,
            pressType === 'standard' && styles.selectedPressType,
          ]}
          onPress={() => setPressType('standard')}
        >
          <Text style={[
            styles.pressTypeText,
            pressType === 'standard' && styles.selectedPressTypeText,
          ]}>
            Standard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.pressTypeButton,
            pressType === 'auto' && styles.selectedPressType,
          ]}
          onPress={() => setPressType('auto')}
        >
          <Text style={[
            styles.pressTypeText,
            pressType === 'auto' && styles.selectedPressTypeText,
          ]}>
            Auto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.pressTypeButton,
            pressType === 'continuation' && styles.selectedPressType,
          ]}
          onPress={() => setPressType('continuation')}
        >
          <Text style={[
            styles.pressTypeText,
            pressType === 'continuation' && styles.selectedPressTypeText,
          ]}>
            Re-Press
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getCurrentStep = () => {
    if (!fromTeamId) return 1;
    if (!toTeamId) return 2;
    if (!pressType) return 3;
    return 4;
  };

  const currentStep = getCurrentStep();

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Press for Hole {hole.number}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepsContainer}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <Text style={styles.summaryText}>
                  {teams.find(t => t.id === fromTeamId)?.name} pressing {teams.find(t => t.id === toTeamId)?.name}
                </Text>
                <Text style={styles.summaryText}>
                  Type: {pressType === 'standard' ? 'Standard' : pressType === 'auto' ? 'Auto' : 'Re-Press'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonsContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (currentStep === 2) setFromTeamId(null);
                  else if (currentStep === 3) setToTeamId(null);
                  else if (currentStep === 4) setPressType(null);
                }}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 4 ? (
              <TouchableOpacity
                style={[styles.nextButton, {
                  backgroundColor: 
                    (currentStep === 1 && !fromTeamId) ||
                    (currentStep === 2 && !toTeamId) ||
                    (currentStep === 3 && !pressType)
                      ? '#cccccc'
                      : '#007AFF'
                }]}
                disabled={
                  (currentStep === 1 && !fromTeamId) ||
                  (currentStep === 2 && !toTeamId) ||
                  (currentStep === 3 && !pressType)
                }
                onPress={() => {
                  // Auto advance to next step when selection is made
                }}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === 3 ? 'Review' : 'Next'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Press</Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  teamButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  teamText: {
    fontWeight: 'bold',
  },
  pressTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  pressTypeButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedPressType: {
    backgroundColor: '#007AFF',
  },
  pressTypeText: {
    color: '#007AFF',
  },
  selectedPressTypeText: {
    color: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
  },
  nextButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summary: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default StepPressModal;