import { StyleSheet, Text, View, Modal, TouchableOpacity, Platform, useColorScheme, Animated } from 'react-native';
import { DollarSign, X, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { useState, useRef } from 'react';

interface StepPressModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedPresses: Array<{ from: string, to: string, type: string }>) => void;
  teams: Array<{ id: string; name: string }>;
  gameFormats: Array<{ type: string; betAmount: number }>;
  currentHole: number;
}

interface TeamPair {
  from: { id: string; name: string };
  to: { id: string; name: string };
}

export default function StepPressModal({
  visible,
  onClose,
  onSubmit,
  teams,
  gameFormats,
  currentHole,
}: StepPressModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedPresses, setSelectedPresses] = useState<Array<{ from: string, to: string, type: string }>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showGameTypes, setShowGameTypes] = useState<{ teamId: string; opponentId: string } | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Generate all possible team pairs
  const teamPairs: TeamPair[] = teams.reduce((pairs, team, index) => {
    teams.slice(index + 1).forEach(opponent => {
      pairs.push(
        { from: team, to: opponent },
        { from: opponent, to: team }
      );
    });
    return pairs;
  }, [] as TeamPair[]);

  const handlePressResponse = (wantsToPress: boolean) => {
    if (!wantsToPress) {
      nextStep();
    } else {
      const currentPair = teamPairs[currentStep];
      if (currentPair) {
        setShowGameTypes({
          teamId: currentPair.from.id,
          opponentId: currentPair.to.id
        });
      }
    }
  };

  const handleGameTypeSelect = (type: string) => {
    if (!showGameTypes) return;
    
    const { teamId, opponentId } = showGameTypes;
    
    setSelectedPresses(current => {
      const exists = current.some(p => 
        p.from === teamId && p.to === opponentId && p.type === type
      );
      
      if (exists) {
        return current.filter(p => 
          !(p.from === teamId && p.to === opponentId && p.type === type)
        );
      } else {
        return [...current, { from: teamId, to: opponentId, type }];
      }
    });
  };

  const nextStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();

    setShowGameTypes(null);
    if (currentStep < teamPairs.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedPresses);
    setSelectedPresses([]);
    setCurrentStep(0);
    setShowGameTypes(null);
  };

  const getFormatLabel = (type: string) => {
    switch (type) {
      case 'front': return 'F9';
      case 'back': return 'B9';
      case 'total': return 'T18';
      default: return type;
    }
  };

  const isGameTypeSelected = (type: string) => {
    return selectedPresses.some(p => 
      p.from === showGameTypes?.teamId && 
      p.to === showGameTypes?.opponentId && 
      p.type === type
    );
  };

  const getContainerStyle = () => ({
    ...styles.container,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
  });

  const getModalStyle = () => ({
    ...styles.modal,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
  });

  const getGameTypeStyle = (selected: boolean) => ({
    ...styles.gameTypeButton,
    backgroundColor: selected 
      ? isDark ? '#4CAF50' : '#E8F5E9'
      : isDark ? '#333333' : '#F5F5F5',
  });

  // If there are no team pairs, show a message
  if (teamPairs.length === 0) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={getContainerStyle()}>
          <View style={getModalStyle()}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Presses – Hole {currentHole}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#FFFFFF' : '#333333'} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <Text style={[styles.message, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                No teams available for presses
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={getContainerStyle()}>
        <View style={getModalStyle()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              Presses – Hole {currentHole}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {!showGameTypes ? (
              <View style={styles.questionContainer}>
                <Text style={[styles.question, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                  {teamPairs[currentStep].from.name}, would you like to press{' '}
                  {teamPairs[currentStep].to.name}?
                </Text>
                
                <View style={styles.responseButtons}>
                  <TouchableOpacity
                    style={[styles.responseButton, styles.yesButton]}
                    onPress={() => handlePressResponse(true)}
                  >
                    <ThumbsUp size={24} color="#FFFFFF" />
                    <Text style={styles.responseButtonText}>Yes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.responseButton, styles.noButton]}
                    onPress={() => handlePressResponse(false)}
                  >
                    <ThumbsDown size={24} color="#FFFFFF" />
                    <Text style={styles.responseButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.gameTypesContainer}>
                <Text style={[styles.subtitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                  Select games to press:
                </Text>
                
                <View style={styles.gameTypeButtons}>
                  {gameFormats.map(format => (
                    <TouchableOpacity
                      key={format.type}
                      style={getGameTypeStyle(isGameTypeSelected(format.type))}
                      onPress={() => handleGameTypeSelect(format.type)}
                    >
                      <DollarSign 
                        size={16} 
                        color={isGameTypeSelected(format.type)
                          ? isDark ? '#FFFFFF' : '#4CAF50'
                          : isDark ? '#FFFFFF' : '#666666'
                        } 
                      />
                      <Text style={[
                        styles.gameTypeText,
                        { color: isGameTypeSelected(format.type)
                            ? isDark ? '#FFFFFF' : '#4CAF50'
                            : isDark ? '#FFFFFF' : '#666666'
                        }
                      ]}>
                        {getFormatLabel(format.type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={nextStep}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          <View style={styles.progress}>
            <Text style={[styles.progressText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              {currentStep + 1} of {teamPairs.length}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    minHeight: 200,
    justifyContent: 'center',
  },
  questionContainer: {
    alignItems: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#FF5252',
  },
  responseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gameTypesContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  gameTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  gameTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  gameTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progress: {
    marginTop: 24,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});