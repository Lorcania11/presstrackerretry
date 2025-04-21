import { StyleSheet, Text, View, Modal, TouchableOpacity, Platform, useColorScheme } from 'react-native';
import { DollarSign, X } from 'lucide-react-native';
import { useState } from 'react';

interface PressModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedPresses: Array<{ from: string, to: string, type: string }>) => void;
  teams: Array<{ id: string; name: string }>;
  gameFormats: Array<{ type: string; betAmount: number }>;
  currentHole: number;
}

export default function PressModal({
  visible,
  onClose,
  onSubmit,
  teams,
  gameFormats,
  currentHole,
}: PressModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedPresses, setSelectedPresses] = useState<Array<{ from: string, to: string, type: string }>>([]);

  const togglePress = (from: string, to: string, type: string) => {
    setSelectedPresses(current => {
      const exists = current.some(p => 
        p.from === from && p.to === to && p.type === type
      );
      
      if (exists) {
        return current.filter(p => 
          !(p.from === from && p.to === to && p.type === type)
        );
      } else {
        return [...current, { from, to, type }];
      }
    });
  };

  const isPressSelected = (from: string, to: string, type: string) => {
    return selectedPresses.some(p => 
      p.from === from && p.to === to && p.type === type
    );
  };

  const getFormatLabel = (type: string) => {
    switch (type) {
      case 'front': return 'F9';
      case 'back': return 'B9';
      case 'total': return 'T18';
      default: return type;
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedPresses);
    setSelectedPresses([]);
  };

  const getContainerStyle = () => ({
    ...styles.container,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
  });

  const getModalStyle = () => ({
    ...styles.modal,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
  });

  const getPressButtonStyle = (selected: boolean) => ({
    ...styles.pressButton,
    backgroundColor: selected 
      ? isDark ? '#4CAF50' : '#E8F5E9'
      : isDark ? '#333333' : '#F5F5F5',
  });

  const getPressTextStyle = (selected: boolean) => ({
    ...styles.pressButtonText,
    color: selected
      ? isDark ? '#FFFFFF' : '#4CAF50'
      : isDark ? '#FFFFFF' : '#666666',
  });

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
              Add Press
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            Hole {currentHole}
          </Text>

          {teams.map((team, index) => (
            teams.slice(index + 1).map(opponent => (
              <View key={`${team.id}-${opponent.id}`} style={styles.matchupContainer}>
                <Text style={[styles.matchupText, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                  {team.name} vs {opponent.name}
                </Text>
                <View style={styles.pressOptionsContainer}>
                  <View style={styles.pressOptions}>
                    {gameFormats.map(format => (
                      <TouchableOpacity
                        key={`${team.id}-${opponent.id}-${format.type}`}
                        style={getPressButtonStyle(isPressSelected(team.id, opponent.id, format.type))}
                        onPress={() => togglePress(team.id, opponent.id, format.type)}
                      >
                        <DollarSign 
                          size={16} 
                          color={isPressSelected(team.id, opponent.id, format.type)
                            ? isDark ? '#FFFFFF' : '#4CAF50'
                            : isDark ? '#FFFFFF' : '#666666'
                          } 
                        />
                        <Text style={getPressTextStyle(isPressSelected(team.id, opponent.id, format.type))}>
                          {getFormatLabel(format.type)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.pressOptions}>
                    {gameFormats.map(format => (
                      <TouchableOpacity
                        key={`${opponent.id}-${team.id}-${format.type}`}
                        style={getPressButtonStyle(isPressSelected(opponent.id, team.id, format.type))}
                        onPress={() => togglePress(opponent.id, team.id, format.type)}
                      >
                        <DollarSign 
                          size={16} 
                          color={isPressSelected(opponent.id, team.id, format.type)
                            ? isDark ? '#FFFFFF' : '#4CAF50'
                            : isDark ? '#FFFFFF' : '#666666'
                          } 
                        />
                        <Text style={getPressTextStyle(isPressSelected(opponent.id, team.id, format.type))}>
                          {getFormatLabel(format.type)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))
          ))}

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.skipButton]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#666666' }]}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]} 
              onPress={handleSubmit}
              disabled={selectedPresses.length === 0}
            >
              <Text style={styles.submitButtonText}>
                Add Selected Presses
              </Text>
            </TouchableOpacity>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  matchupContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
    paddingBottom: 16,
  },
  matchupText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  pressOptionsContainer: {
    gap: 12,
  },
  pressOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  pressButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});