// components/match/ScoreInputModal.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Platform,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface ScoreInputModalProps {
  visible: boolean;
  onClose: () => void;
  teams: Array<{
    id: string;
    name: string;
    color: string;
    initial: string;
    scores: Array<number | null>;
  }>;
  currentHole: number;
  onSaveScores: (scores: { [teamId: string]: number }) => void;
}

export default function ScoreInputModal({
  visible,
  onClose,
  teams,
  currentHole,
  onSaveScores,
}: ScoreInputModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Initialize with current scores
  const initialScores = teams.reduce((obj, team) => {
    obj[team.id] = team.scores[currentHole - 1]?.toString() || '';
    return obj;
  }, {} as { [teamId: string]: string });
  
  const [scoreInputs, setScoreInputs] = useState<{ [teamId: string]: string }>(initialScores);
  
  const handleScoreChange = (teamId: string, value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setScoreInputs(prev => ({ ...prev, [teamId]: value }));
    }
  };
  
  const handleSave = () => {
    // Convert string inputs to numbers
    const numericScores = Object.entries(scoreInputs).reduce((obj, [teamId, scoreStr]) => {
      obj[teamId] = scoreStr ? parseInt(scoreStr, 10) : null;
      return obj;
    }, {} as { [teamId: string]: number | null });
    
    onSaveScores(numericScores);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modal, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              Enter Scores - Hole {currentHole}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {teams.map(team => (
              <View key={team.id} style={styles.teamRow}>
                <View style={styles.teamInfo}>
                  <View style={[styles.teamCircle, { backgroundColor: team.color }]}>
                    <Text style={styles.teamInitial}>{team.initial}</Text>
                  </View>
                  <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                    {team.name}
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.scoreInput,
                    { 
                      backgroundColor: isDark ? '#333333' : '#F5F5F5',
                      color: isDark ? '#FFFFFF' : '#333333',
                      borderColor: isDark ? '#444444' : '#DDDDDD',
                    }
                  ]}
                  keyboardType="numeric"
                  maxLength={2}
                  value={scoreInputs[team.id]}
                  onChangeText={(value) => handleScoreChange(team.id, value)}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#888888' : '#999999'}
                />
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { borderColor: isDark ? '#444444' : '#DDDDDD' }]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Scores</Text>
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
    maxHeight: 400,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  teamName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  scoreInput: {
    width: 60,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});