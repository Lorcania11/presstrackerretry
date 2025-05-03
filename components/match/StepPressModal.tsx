import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

interface GameFormat {
  type: string;
  betAmount: number;
  label?: string; // Added for display purposes
}

interface GameType {
  id: string;
  name: string;
  amount: string;
  selected: boolean;
  isAvailable?: boolean; // New property to track availability
}

interface StepPressModalProps {
  isVisible: boolean;
  hole: Hole;
  teams: Team[];
  onClose: () => void;
  onSave: (press: Omit<Press, 'id'>) => void;
  teamColors?: {[key: string]: string};
  gameFormats?: GameFormat[]; // Add this prop to receive game formats from match creation
  matchStatus?: {
    statusMessage: string;
    gameType: string;
  } | null;
  onDismissWithoutPress?: () => void; // Add this callback for when modal is closed without presses
  onSubmitAllPresses?: () => void; // Add new callback for submitting all presses
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
  },
  gameFormats = [], // Default to empty array if not provided
  matchStatus = null,
  onDismissWithoutPress = () => {}, // Default empty function
  onSubmitAllPresses = () => {} // Default empty function
}) => {
  const insets = useSafeAreaInsets();
  const [fromTeamId, setFromTeamId] = useState<string | null>(null);
  const [toTeamId, setToTeamId] = useState<string | null>(null);
  const [addedPresses, setAddedPresses] = useState<Array<{
    fromTeamId: string;
    toTeamId: string;
    pressType: string;
  }>>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const defaultGameTypes = [
    { id: 'front9', name: 'Front 9', amount: '$10', selected: false },
    { id: 'back9', name: 'Back 9', amount: '$10', selected: false },
    { id: 'total18', name: 'Total 18', amount: '$10', selected: false },
  ];

  const mapGameFormatsToTypes = () => {
    if (gameFormats.length === 0) return defaultGameTypes;

    // Filter game types based on current hole
    return gameFormats.map(format => {
      let name = 'Unknown';
      let id = format.type;
      let isAvailable = true;

      if (format.type === 'front') {
        name = 'Front 9';
        id = 'front9';
        // Only available on holes 1-9
        isAvailable = hole.number >= 1 && hole.number <= 9;
      } else if (format.type === 'back') {
        name = 'Back 9';
        id = 'back9';
        // Only available on holes 10-18
        isAvailable = hole.number >= 10 && hole.number <= 18;
      } else if (format.type === 'total') {
        name = 'Total 18';
        id = 'total18';
        // For total, allow pressing on any hole
        // But logically restrict pressing on the front 9 holes (1-9)
        // or the back 9 holes (10-18)
        isAvailable = (hole.number >= 1 && hole.number <= 9) || 
                      (hole.number >= 10 && hole.number <= 18);
      } else if (format.label) {
        name = format.label;
      }

      return {
        id,
        name,
        amount: `$${format.betAmount}`,
        selected: false,
        isAvailable // New property to track availability
      };
    }).filter(gameType => gameType.isAvailable); // Filter out unavailable game types
  };

  const [gameTypes, setGameTypes] = useState<GameType[]>(mapGameFormatsToTypes());

  useEffect(() => {
    // iOS-specific back button/gesture handling
    if (Platform.OS === 'ios') {
      const backHandler = () => {
        // Handle back navigation logic for iOS
        handleBack();
        return true;
      };
      
      // Set up any iOS-specific event listeners if needed
      return () => {
        // Clean up iOS-specific event listeners
      };
    }
  }, [showConfirmation, fromTeamId, toTeamId]);

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

    // Create a separate press for each selected game type
    const newPresses = selectedGameTypes.map(gameType => ({
      fromTeamId,
      toTeamId,
      pressType: gameType.id,
      holeIndex: hole.number - 1
    }));

    // Add all new presses to the array
    setAddedPresses([...addedPresses, ...newPresses]);

    // Reset selection state
    setFromTeamId(null);
    setToTeamId(null);
    setGameTypes(gameTypes.map(gt => ({ ...gt, selected: false })));

    // Show confirmation after adding presses
    setShowConfirmation(true);
  };

  const handleSubmitAllPresses = () => {
    // Make sure each added press is submitted individually
    addedPresses.forEach(press => {
      onSave({
        fromTeamId: press.fromTeamId,
        toTeamId: press.toTeamId,
        holeIndex: hole.number - 1,
        pressType: press.pressType,
      });
    });

    resetAndClose();
    
    // Notify parent to advance to next hole after submitting all presses
    onSubmitAllPresses();
  };

  const resetAndClose = () => {
    // Check if we've added any presses
    const shouldAdvanceToNextHole = addedPresses.length === 0;

    setFromTeamId(null);
    setToTeamId(null);
    setGameTypes(gameTypes.map(gt => ({ ...gt, selected: false })));
    setAddedPresses([]);
    setShowConfirmation(false);
    onClose();
    
    // If no presses were added, tell the parent to move to next hole
    if (shouldAdvanceToNextHole) {
      onDismissWithoutPress();
    }
  };

  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      return;
    }

    if (fromTeamId && toTeamId) {
      setFromTeamId(null);
      setToTeamId(null);
      return;
    }

    resetAndClose();
  };

  const toggleGameType = (id: string) => {
    setGameTypes(gameTypes.map(gt => 
      gt.id === id ? { ...gt, selected: !gt.selected } : gt
    ));
  };

  const getCurrentStep = () => {
    if (showConfirmation) return 4;
    if (!fromTeamId) return 1;
    if (!toTeamId) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();

  const getTeamName = (id: string): string => {
    return teams.find(team => team.id === id)?.name || 'Unknown Team';
  };

  const getGameTypeName = (id: string): string => {
    return gameTypes.find(gt => gt.id === id)?.name || id;
  };

  const renderConfirmationStep = () => {
    const pressesByTeam: { [key: string]: Array<{ toTeamId: string, pressTypes: string[] }> } = {};

    addedPresses.forEach(press => {
      if (!pressesByTeam[press.fromTeamId]) {
        pressesByTeam[press.fromTeamId] = [];
      }

      const existingToTeam = pressesByTeam[press.fromTeamId].find(p => p.toTeamId === press.toTeamId);

      if (existingToTeam) {
        existingToTeam.pressTypes.push(press.pressType);
      } else {
        pressesByTeam[press.fromTeamId].push({
          toTeamId: press.toTeamId,
          pressTypes: [press.pressType]
        });
      }
    });

    return (
      <ScrollView>
        <Text style={styles.pressDetailsTitle}>Presses Added</Text>

        {Object.keys(pressesByTeam).map(fromId => {
          const fromTeam = teams.find(t => t.id === fromId);
          const fromTeamIndex = teams.findIndex(t => t.id === fromId);
          const fromTeamColor = teamColors[(fromTeamIndex + 1).toString()] || fromTeam?.color || '#4CAE4F';

          return pressesByTeam[fromId].map((toTeamData, idx) => {
            const toTeam = teams.find(t => t.id === toTeamData.toTeamId);
            const toTeamIndex = teams.findIndex(t => t.id === toTeamData.toTeamId);
            const toTeamColor = teamColors[(toTeamIndex + 1).toString()] || toTeam?.color || '#FFC105';

            return (
              <View key={`${fromId}-${toTeamData.toTeamId}-${idx}`} style={styles.confirmationItem}>
                <View style={styles.teamRow}>
                  <View style={[styles.teamCircle, { backgroundColor: fromTeamColor }]}>
                    <Text style={styles.teamInitial}>
                      {fromTeam?.name?.charAt(0) || 'T'}
                    </Text>
                  </View>
                  <Text style={styles.toText}>pressing</Text>
                  <View style={[styles.teamCircle, { backgroundColor: toTeamColor }]}>
                    <Text style={styles.teamInitial}>
                      {toTeam?.name?.charAt(0) || 'T'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.pressTypesTitle}>Game Types:</Text>
                <View style={styles.pressTypeList}>
                  {toTeamData.pressTypes.map((type, typeIdx) => (
                    <Text key={`type-${typeIdx}`} style={styles.pressTypeItem}>
                      • {getGameTypeName(type)}
                    </Text>
                  ))}
                </View>
              </View>
            );
          });
        })}

        <TouchableOpacity
          style={styles.addAnotherButton}
          onPress={() => setShowConfirmation(false)}
        >
          <Text style={styles.addAnotherButtonText}>Add Another Press</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitAllPresses}
        >
          <Text style={styles.submitButtonText}>Submit All Presses</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderTeamSelectionStep = () => (
    <ScrollView>
      <Text style={styles.pressDetailsTitle}>Who's Pressing?</Text>

      {matchStatus && (
        <View style={styles.matchStatusContainer}>
          <Text style={styles.matchStatusTitle}>Current Match Status:</Text>
          <Text style={styles.matchStatusMessage}>{matchStatus.statusMessage}</Text>
        </View>
      )}

      <View style={styles.teamsContainer}>
        {teams.map((pressingTeam, pressingIdx) => {
          return teams
            .filter(t => t.id !== pressingTeam.id)
            .map((targetTeam, targetIdx) => {
              const pressingTeamColor = teamColors[(pressingIdx + 1).toString()] || pressingTeam.color || '#888888';

              return (
                <TouchableOpacity
                  key={`${pressingTeam.id}-${targetTeam.id}`}
                  style={[
                    styles.teamOption,
                    { backgroundColor: pressingTeamColor }
                  ]}
                  onPress={() => {
                    setFromTeamId(pressingTeam.id);
                    setToTeamId(targetTeam.id);
                  }}
                >
                  <Text style={styles.teamText}>
                    {pressingTeam.name} pressing {targetTeam.name}
                  </Text>
                </TouchableOpacity>
              );
            });
        })}
      </View>
    </ScrollView>
  );

  const renderGameTypeSelectionStep = () => {
    const fromTeam = teams.find(t => t.id === fromTeamId);
    const toTeam = teams.find(t => t.id === toTeamId);
    const fromTeamIndex = teams.findIndex(t => t.id === fromTeamId);
    const toTeamIndex = teams.findIndex(t => t.id === toTeamId);

    const fromTeamColor = teamColors[(fromTeamIndex + 1).toString()] || fromTeam?.color || '#4CAE4F';
    const toTeamColor = teamColors[(toTeamIndex + 1).toString()] || toTeam?.color || '#FFC105';

    return (
      <ScrollView>
        <Text style={styles.pressDetailsTitle}>Press Details</Text>

        <View style={styles.teamRow}>
          <View style={[styles.teamCircle, { backgroundColor: fromTeamColor }]}>
            <Text style={styles.teamInitial}>
              {fromTeam?.name?.charAt(0) || 'T'}
            </Text>
          </View>
          <Text style={styles.toText}>pressing</Text>
          <View style={[styles.teamCircle, { backgroundColor: toTeamColor }]}>
            <Text style={styles.teamInitial}>
              {toTeam?.name?.charAt(0) || 'T'}
            </Text>
          </View>
        </View>

        <Text style={styles.selectGameTypesTitle}>Select Game Types</Text>
        
        <Text style={styles.pressInfoText}>
          Press when a team is losing to extend the bet and attempt to recover
        </Text>

        {gameTypes.length === 0 ? (
          <Text style={styles.noGameTypesText}>No available press types for hole {hole.number}</Text>
        ) : (
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

                <View style={[
                  styles.toggleButton,
                  gameType.selected && styles.toggleButtonSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      onRequestClose={() => {
        resetAndClose();
        // If modal is dismissed by back button/gesture and no presses added
        if (addedPresses.length === 0) {
          onDismissWithoutPress();
        }
      }}
    >
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.5)' : 'transparent' 
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <View style={styles.modalOverlay}>
            <View 
              style={[
                styles.modalContent,
                Platform.OS === 'ios' && styles.iosModalContent
              ]}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={handleBack}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Text style={styles.backButtonText}>
                    {showConfirmation ? 'Add More' : 'Back'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {showConfirmation ? 'Review Presses' : 'Add Press'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={resetAndClose}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stepsContainer}>
                {currentStep === 4
                  ? renderConfirmationStep()
                  : currentStep <= 2
                    ? renderTeamSelectionStep()
                    : renderGameTypeSelectionStep()
                }
              </View>

              {currentStep === 3 && (
                <TouchableOpacity
                  style={[
                    styles.addPressButton,
                    { marginBottom: Platform.OS === 'ios' ? 8 : 15 }
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.addPressButtonText}>Add Press</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // Add padding for iOS devices
    ...Platform.select({
      ios: {
        paddingHorizontal: 10,
        paddingBottom: 10,
      }
    }),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iosModalContent: {
    height: '70%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    flex: 1, // Make this flex to ensure scrolling works properly
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
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  teamText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    // Better touch target for iOS
    ...Platform.select({
      ios: {
        paddingVertical: 16,
      }
    }),
  },
  addPressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pressTypesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  pressTypeList: {
    paddingLeft: 8,
  },
  pressTypeItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  addAnotherButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  addAnotherButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAE4F',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  noGameTypesText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  pressInfoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  matchStatusContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  matchStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  matchStatusMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
});

export default StepPressModal;