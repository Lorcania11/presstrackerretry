import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme,
  ScrollView
} from 'react-native';
import { X, ChevronRight, TrendingDown, Check } from 'lucide-react-native';

interface Team {
  id: string;
  name: string;
  color: string;
  initial: string;
  scores?: (number | null)[];  // Updated to match ExtendedMatchTeam
}

interface GameFormat {
  type: 'front' | 'back' | 'total';
  betAmount: number;
  label?: string;
}

interface PressFormData {
  from: string;
  to: string;
  type: string;
  amount?: number;
}

interface StepPressModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (presses: Array<{from: string, to: string, type: string, amount?: number}>) => void;
  teams: Team[];
  gameFormats: GameFormat[];
  currentHole: number;
  isDarkMode?: boolean;
}

interface GameStatus {
  teamId: string;
  front9Score: number;
  back9Score: number;
  totalScore: number;
}

const StepPressModal: React.FC<StepPressModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit, 
  teams, 
  gameFormats,
  currentHole,
  isDarkMode = false
}) => {
  const colorScheme = useColorScheme();
  const isDark = isDarkMode || colorScheme === 'dark';
  
  const [step, setStep] = useState(1);
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<{[key: string]: boolean}>({});
  const [suggestedPresser, setSuggestedPresser] = useState<string | null>(null);
  const [gameStatuses, setGameStatuses] = useState<GameStatus[]>([]);
  
  // Format the game types for display
  const formattedGameFormats = gameFormats.map(format => ({
    ...format,
    label: format.label || (
      format.type === 'front' ? 'Front 9' : 
      format.type === 'back' ? 'Back 9' : 'Total 18'
    )
  }));

  // Calculate game statuses and suggest who might want to press
  useEffect(() => {
    if (teams && teams.length > 1) {
      const statuses: GameStatus[] = teams.map(team => {
        let front9Score = 0;
        let back9Score = 0;
        let totalScore = 0;
        
        if (team.scores) {
          for (let i = 0; i < 9 && i < team.scores.length; i++) {
            if (team.scores[i] !== null) {
              front9Score += team.scores[i] || 0;
            }
          }
          
          for (let i = 9; i < 18 && i < team.scores.length; i++) {
            if (team.scores[i] !== null) {
              back9Score += team.scores[i] || 0;
            }
          }
          
          for (let i = 0; i < team.scores.length; i++) {
            if (team.scores[i] !== null) {
              totalScore += team.scores[i] || 0;
            }
          }
        }
        
        return {
          teamId: team.id,
          front9Score,
          back9Score,
          totalScore
        };
      });
      
      setGameStatuses(statuses);
      
      if (statuses.length === 2) {
        if (currentHole <= 9) {
          if (statuses[0].front9Score > 0 && statuses[1].front9Score > 0) {
            if (statuses[0].front9Score > statuses[1].front9Score) {
              setSuggestedPresser(statuses[0].teamId);
            } else if (statuses[1].front9Score > statuses[0].front9Score) {
              setSuggestedPresser(statuses[1].teamId);
            }
          }
        } else if (currentHole >= 10) {
          if (statuses[0].back9Score > 0 && statuses[1].back9Score > 0) {
            if (statuses[0].back9Score > statuses[1].back9Score) {
              setSuggestedPresser(statuses[0].teamId);
            } else if (statuses[1].back9Score > statuses[0].back9Score) {
              setSuggestedPresser(statuses[1].teamId);
            }
          }
        }
        
        if (!suggestedPresser && statuses[0].totalScore > 0 && statuses[1].totalScore > 0) {
          if (statuses[0].totalScore > statuses[1].totalScore) {
            setSuggestedPresser(statuses[0].teamId);
          } else if (statuses[1].totalScore > statuses[0].totalScore) {
            setSuggestedPresser(statuses[1].teamId);
          }
        }
      }
    }
  }, [teams, currentHole, visible]);

  const resetAndClose = () => {
    setStep(1);
    setSelectedFrom(null);
    setSelectedTo(null);
    setSelectedTypes({});
    onClose();
  };

  const handleSelectFrom = (teamId: string) => {
    setSelectedFrom(teamId);
    setStep(2);
  };

  const handleSelectTo = (teamId: string) => {
    setSelectedTo(teamId);
    setStep(3);
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSubmit = () => {
    const selectedFormatTypes = Object.entries(selectedTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);
    
    if (selectedFormatTypes.length === 0) {
      // No need to select all by default - user should make an explicit choice
      return;
    }
    
    const presses = selectedFormatTypes.map(type => {
      const format = formattedGameFormats.find(f => f.type === type);
      return {
        from: selectedFrom!,
        to: selectedTo!,
        type,
        amount: format?.betAmount
      };
    });
    
    onSubmit(presses);
    resetAndClose();
  };

  const renderStepOne = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
        Who's pressing?
      </Text>
      
      {suggestedPresser && (
        <View style={styles.suggestionContainer}>
          <TrendingDown size={18} color="#FF5252" style={styles.suggestionIcon} />
          <Text style={[styles.suggestionText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            {teams.find(team => team.id === suggestedPresser)?.name} might want to press
            {currentHole <= 9 
              ? ' (losing Front 9)' 
              : currentHole >= 10 
                ? ' (losing Back 9)' 
                : ' (losing overall)'}
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.optionsContainer}>
        {teams.map(team => (
          <TouchableOpacity
            key={team.id}
            style={[
              styles.teamOption,
              team.id === suggestedPresser && styles.suggestedOption,
              { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' }
            ]}
            onPress={() => handleSelectFrom(team.id)}
          >
            <View style={[styles.teamBadge, { backgroundColor: team.color }]}>
              <Text style={styles.teamInitial}>{team.initial}</Text>
            </View>
            <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              {team.name}
              {team.id === suggestedPresser && (
                <Text style={styles.suggestedLabel}> (suggested)</Text>
              )}
            </Text>
            <ChevronRight size={20} color={isDark ? '#CCCCCC' : '#666666'} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStepTwo = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
        Who's receiving the press?
      </Text>
      <ScrollView style={styles.optionsContainer}>
        {teams
          .filter(team => team.id !== selectedFrom)
          .map(team => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamOption,
                { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' }
              ]}
              onPress={() => handleSelectTo(team.id)}
            >
              <View style={[styles.teamBadge, { backgroundColor: team.color }]}>
                <Text style={styles.teamInitial}>{team.initial}</Text>
              </View>
              <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                {team.name}
              </Text>
              <ChevronRight size={20} color={isDark ? '#CCCCCC' : '#666666'} />
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );

  const renderStepThree = () => {
    const fromTeam = teams.find(team => team.id === selectedFrom);
    const toTeam = teams.find(team => team.id === selectedTo);
    
    // Count selected types to enable/disable the Add Press button
    const selectedCount = Object.values(selectedTypes).filter(Boolean).length;
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.stepTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
            Press Details
          </Text>
          <View style={styles.pressTeams}>
            <View style={[styles.teamBadgeSmall, { backgroundColor: fromTeam?.color }]}>
              <Text style={styles.teamInitialSmall}>{fromTeam?.initial}</Text>
            </View>
            <Text style={[styles.arrowText, { color: isDark ? '#CCCCCC' : '#666666' }]}>to</Text>
            <View style={[styles.teamBadgeSmall, { backgroundColor: toTeam?.color }]}>
              <Text style={styles.teamInitialSmall}>{toTeam?.initial}</Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
          Select Game Types
        </Text>
        
        <ScrollView style={styles.optionsContainer}>
          {formattedGameFormats.map(format => (
            <TouchableOpacity
              key={format.type}
              style={[
                styles.gameTypeButton,
                selectedTypes[format.type] && styles.gameTypeButtonSelected,
                { borderColor: isDark ? '#444444' : '#DDDDDD' }
              ]}
              onPress={() => handleToggleType(format.type)}
            >
              <View style={styles.gameTypeContent}>
                <Text 
                  style={[
                    styles.gameTypeName, 
                    { color: isDark ? '#FFFFFF' : '#333333' }
                  ]}
                >
                  {format.label}
                </Text>
                <Text 
                  style={[
                    styles.gameTypeAmount, 
                    { color: isDark ? '#AAAAAA' : '#666666' }
                  ]}
                >
                  ${format.betAmount}
                </Text>
              </View>
              
              {selectedTypes[format.type] && (
                <View style={styles.checkIconContainer}>
                  <Check size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedCount === 0 && styles.confirmButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={selectedCount === 0}
          >
            <Text style={styles.confirmButtonText}>
              Add {selectedCount > 0 ? selectedCount : ''} Press{selectedCount !== 1 ? 'es' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }]}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  resetAndClose();
                }
              }}
            >
              <Text style={[styles.backText, { color: isDark ? '#4CAF50' : '#4CAF50' }]}>
                {step > 1 ? 'Back' : 'Cancel'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              Add Press
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <X size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
          </View>
          
          {renderStepContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    flex: 1,
    maxHeight: 400,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  summaryHeader: {
    marginBottom: 24,
  },
  pressTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  teamBadgeSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitialSmall: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  arrowText: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gameTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  gameTypeButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  gameTypeContent: {
    flex: 1,
  },
  gameTypeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  gameTypeAmount: {
    fontSize: 14,
    marginTop: 4,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonContainer: {
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  suggestionIcon: {
    marginRight: 8,
  },
  suggestionText: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  suggestedOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  suggestedLabel: {
    fontStyle: 'italic',
    fontSize: 12,
    opacity: 0.7,
  },
});

export default StepPressModal;