import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DollarSign, ChevronLeft, ChevronRight, Check, X } from 'lucide-react-native';
import Modal from 'react-native-modal';
import { StatusBar } from 'expo-status-bar';
import { hasNotchOrCutout } from '@/utils/statusBarManager';

interface Team {
  id: string;
  name: string;
  initial?: string;
  color?: string;
}

interface HoleScore {
  teamId: string;
  score: number | null;
}

interface GameFormat {
  type: string;
  label: string;
  betAmount: number;
}

interface Hole {
  number: number;
  scores: HoleScore[];
  isComplete: boolean;
}

interface StepPressModalProps {
  isVisible: boolean;
  hole: Hole;
  teams: Team[];
  onClose: () => void;
  onSave: (press: { fromTeamId: string; toTeamId: string; holeIndex: number; pressType: string }) => void;
  onDismissWithoutPress: () => void;
  onSubmitAllPresses?: () => void;
  teamColors: Record<string, string>;
  gameFormats: GameFormat[];
  matchStatus: {
    statusMessage: string;
    gameType: string;
  } | null;
}

const StepPressModal: React.FC<StepPressModalProps> = ({
  isVisible,
  hole,
  teams,
  onClose,
  onSave,
  onDismissWithoutPress,
  onSubmitAllPresses,
  teamColors,
  gameFormats,
  matchStatus,
}) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [fromTeam, setFromTeam] = useState<Team | null>(null);
  const [toTeam, setToTeam] = useState<Team | null>(null);
  const [pressType, setPressType] = useState<string | null>(null);
  
  // Reset the state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setStep(1);
      setFromTeam(null);
      setToTeam(null);
      setPressType(null);
    }
  }, [isVisible]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit the press
      if (fromTeam && toTeam && pressType) {
        onSave({
          fromTeamId: fromTeam.id,
          toTeamId: toTeam.id,
          holeIndex: hole.number - 1, // Convert to 0-indexed
          pressType: pressType,
        });
        // Reset for next press
        setStep(1);
        setFromTeam(null);
        setToTeam(null);
        setPressType(null);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Exit the modal if going back from first step
      onClose();
    }
  };

  const handleSelectFromTeam = (team: Team) => {
    setFromTeam(team);
    handleNextStep();
  };

  const handleSelectToTeam = (team: Team) => {
    setToTeam(team);
    handleNextStep();
  };

  const handleSelectPressType = (type: string) => {
    setPressType(type);
    handleNextStep();
  };

  const handleDismiss = () => {
    onDismissWithoutPress();
    onClose();
  };

  const handleSubmitAll = () => {
    if (onSubmitAllPresses) {
      onSubmitAllPresses();
    }
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Who's pressing?</Text>
            <Text style={styles.stepDescription}>Select the team that is pressing another team</Text>
            
            <View style={styles.teamsContainer}>
              {teams.map((team) => {
                // Use fixed team color based on team order (from teamColors)
                const teamColor = teamColors[teams.indexOf(team) + 1] || team.color || '#CCCCCC';
                
                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[styles.teamButton, { backgroundColor: teamColor }]}
                    onPress={() => handleSelectFromTeam(team)}
                  >
                    <Text style={styles.teamInitial}>
                      {team.initial || team.name.charAt(0).toUpperCase()}
                    </Text>
                    <Text style={styles.teamName}>{team.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {matchStatus && (
              <View style={styles.matchStatusContainer}>
                <Text style={styles.matchStatusLabel}>Current Match Status:</Text>
                <Text style={styles.matchStatusValue}>{matchStatus.statusMessage}</Text>
              </View>
            )}
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Who's being pressed?</Text>
            <Text style={styles.stepDescription}>
              {fromTeam?.name} is pressing...
            </Text>
            
            <View style={styles.teamsContainer}>
              {teams.filter(t => t.id !== fromTeam?.id).map((team) => {
                // Use fixed team color based on team order (from teamColors)
                const teamColor = teamColors[teams.indexOf(team) + 1] || team.color || '#CCCCCC';
                
                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[styles.teamButton, { backgroundColor: teamColor }]}
                    onPress={() => handleSelectToTeam(team)}
                  >
                    <Text style={styles.teamInitial}>
                      {team.initial || team.name.charAt(0).toUpperCase()}
                    </Text>
                    <Text style={styles.teamName}>{team.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
        
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Press Type</Text>
            <Text style={styles.stepDescription}>
              {fromTeam?.name} is pressing {toTeam?.name} on...
            </Text>
            
            <View style={styles.pressTypesContainer}>
              {gameFormats.map((format) => (
                <TouchableOpacity
                  key={format.type}
                  style={styles.pressTypeButton}
                  onPress={() => handleSelectPressType(format.type)}
                >
                  <Text style={styles.pressTypeLabel}>{format.label}</Text>
                  <View style={styles.betAmountContainer}>
                    <DollarSign size={14} color="#333333" />
                    <Text style={styles.betAmount}>{format.betAmount}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modalContainer}
      backdropOpacity={0.5}
      onBackdropPress={handleDismiss}
      onBackButtonPress={handleDismiss}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      swipeDirection="down"
      onSwipeComplete={handleDismiss}
      propagateSwipe={true}
      avoidKeyboard={true}
      useNativeDriver={true}
      statusBarTranslucent
    >
      <StatusBar style="light" />
      <View style={[
        styles.container, 
        { 
          paddingTop: Platform.OS === 'ios' 
            ? hasNotchOrCutout() ? insets.top : 10 
            : insets.top || 10, 
          paddingBottom: Math.max(insets.bottom + 10, 20)
        }
      ]}>
        {/* Add handle to help users understand the swipe gesture */}
        {Platform.OS === 'ios' && <View style={styles.dragHandle} />}
        
        <View style={styles.header}>
          <Text style={styles.title}>New Press - Hole {hole.number}</Text>
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Step indicator */}
          <View style={styles.stepIndicatorContainer}>
            <View style={[
              styles.stepIndicator, 
              step >= 1 && styles.stepIndicatorActive
            ]} />
            <View style={[
              styles.stepIndicatorLine,
            ]} />
            <View style={[
              styles.stepIndicator, 
              step >= 2 && styles.stepIndicatorActive
            ]} />
            <View style={[
              styles.stepIndicatorLine,
            ]} />
            <View style={[
              styles.stepIndicator, 
              step >= 3 && styles.stepIndicatorActive
            ]} />
          </View>
          
          {renderStepContent()}
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={handlePrevStep}
          >
            <ChevronLeft size={20} color="#007AFF" />
            <Text style={styles.footerButtonText}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.footerCenter}>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={handleDismiss}
            >
              <Text style={styles.doneButtonText}>No Presses</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={fromTeam && toTeam && pressType ? handleSubmitAll : undefined}
            disabled={!(fromTeam && toTeam && pressType)}
          >
            <Text style={[
              styles.footerButtonText,
              !(fromTeam && toTeam && pressType) && styles.disabledButtonText
            ]}>
              Done
            </Text>
            <Check size={20} color={fromTeam && toTeam && pressType ? "#007AFF" : "#CCCCCC"} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Enhanced iOS shadow styling
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    maxHeight: '80%',
  },
  contentContainer: {
    padding: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDDDDD',
  },
  stepIndicatorActive: {
    backgroundColor: '#007AFF',
  },
  stepIndicatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 4,
  },
  stepContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Enhanced iOS shadow styling
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  teamsContainer: {
    marginVertical: 8,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  teamInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  pressTypesContainer: {
    marginVertical: 8,
  },
  pressTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  pressTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  betAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  betAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginHorizontal: 4,
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  matchStatusContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  matchStatusLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  matchStatusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  }
});

export default StepPressModal;