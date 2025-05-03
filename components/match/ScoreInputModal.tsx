// components/match/ScoreInputModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  
  // Initialize with current scores
  const initialScores = teams.reduce((obj, team) => {
    obj[team.id] = team.scores[currentHole - 1]?.toString() || '';
    return obj;
  }, {} as { [teamId: string]: string });
  
  const [scoreInputs, setScoreInputs] = useState<{ [teamId: string]: string }>(initialScores);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Keyboard listeners for iOS
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  const handleScoreChange = (teamId: string, value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setScoreInputs(prev => ({ ...prev, [teamId]: value }));
    }
  };
  
  const handleSave = () => {
    // Convert string inputs to numbers
    const numericScores = Object.entries(scoreInputs).reduce((obj, [teamId, scoreStr]) => {
      // Use 0 as default value if score is empty or null
      obj[teamId] = scoreStr ? parseInt(scoreStr, 10) : 0;
      return obj;
    }, {} as { [teamId: string]: number });
    
    onSaveScores(numericScores);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 10 : 0}
      >
        <TouchableOpacity 
          style={styles.container} 
          activeOpacity={1} 
          onPress={Keyboard.dismiss}
        >
          <View style={[
            styles.modal, 
            { 
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              maxHeight: '80%',
              marginBottom: insets.bottom > 0 ? insets.bottom : 0,
            },
            keyboardVisible && Platform.OS === 'ios' && { maxHeight: '60%' }
          ]}>
            {Platform.OS === 'ios' && <View style={styles.dragHandle} />}
            
            <View style={styles.header}>
              <Text style={[
                styles.title, 
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Hole {currentHole} Scores
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                accessibilityLabel="Close score input"
              >
                <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {teams.map((team) => (
                <View key={team.id} style={styles.teamRow}>
                  <View style={styles.teamInfo}>
                    <View style={[styles.teamCircle, { backgroundColor: team.color }]}>
                      <Text style={styles.teamInitial}>{team.initial}</Text>
                    </View>
                    <Text style={[
                      styles.teamName,
                      { color: isDark ? '#FFFFFF' : '#333333' }
                    ]}>
                      {team.name}
                    </Text>
                  </View>
                  
                  <TextInput
                    style={[
                      styles.scoreInput,
                      { 
                        borderColor: isDark ? '#444444' : '#DDDDDD',
                        backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                        color: isDark ? '#FFFFFF' : '#333333'
                      }
                    ]}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={scoreInputs[team.id]}
                    onChangeText={(value) => handleScoreChange(team.id, value)}
                    placeholder="0"
                    placeholderTextColor={isDark ? '#777777' : '#999999'}
                    selectionColor={team.color}
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              ))}
            </ScrollView>
            
            <View style={[
              styles.buttonRow,
              { marginBottom: Platform.OS === 'ios' && insets.bottom > 0 ? 8 : 24 }
            ]}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.cancelButton,
                  { borderColor: isDark ? '#555555' : '#DDDDDD' }
                ]}
                onPress={onClose}
                accessibilityLabel="Cancel score entry"
              >
                <Text style={[
                  styles.buttonText,
                  { color: isDark ? '#FFFFFF' : '#333333' }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.saveButton,
                  { backgroundColor: '#007AFF' }
                ]}
                onPress={handleSave}
                accessibilityLabel="Save scores"
              >
                <Text style={styles.saveButtonText}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
    // Enhanced iOS shadow styling
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
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
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
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
    // Add iOS-specific shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
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
    // Add iOS-specific shadow and styling
    ...Platform.select({
      ios: {
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }
    }),
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
    backgroundColor: '#007AFF',
    // Add iOS-specific shadow
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
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