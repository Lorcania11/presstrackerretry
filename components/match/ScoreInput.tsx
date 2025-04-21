import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Platform, Keyboard } from 'react-native';

interface ScoreInputProps {
  teamName: string;
  teamColor: string;
  onScoreChange: (score: number | null) => void;
  currentScore: number | null;
  disabled?: boolean;
  isDarkMode?: boolean;
  onSubmitEditing?: () => void;
  isFirst?: boolean;
}

export default function ScoreInput({ 
  teamName,
  teamColor,
  onScoreChange, 
  currentScore, 
  disabled = false,
  isDarkMode = false,
  onSubmitEditing,
  isFirst = false,
}: ScoreInputProps) {
  const [score, setScore] = useState<string>(currentScore !== null ? currentScore.toString() : '');
  const inputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    if (currentScore !== null && currentScore.toString() !== score) {
      setScore(currentScore.toString());
    }
  }, [currentScore]);

  useEffect(() => {
    if (isFirst && !disabled) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFirst, disabled]);
  
  const handleScoreChange = (value: string) => {
    if (disabled) return;
    
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 15)) {
      setScore(value);
      onScoreChange(value === '' ? null : parseInt(value, 10));
    }
  };

  const getContainerStyle = () => {
    return {
      ...styles.container,
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      borderColor: isDarkMode ? '#333333' : '#E0E0E0',
      opacity: disabled ? 0.7 : 1,
    };
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.teamInfo}>
        <View style={[styles.teamColorIndicator, { backgroundColor: teamColor }]} />
        <Text style={[
          styles.teamName,
          { color: isDarkMode ? '#FFFFFF' : '#333333' }
        ]}>
          {teamName}
        </Text>
      </View>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: isDarkMode ? '#FFFFFF' : '#333333',
            backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5',
          }
        ]}
        value={score}
        onChangeText={handleScoreChange}
        keyboardType="number-pad"
        returnKeyType="next"
        placeholder="-"
        placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
        editable={!disabled}
        maxLength={2}
        selectTextOnFocus
        onSubmitEditing={() => {
          onSubmitEditing?.();
          Keyboard.dismiss();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    width: 60,
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
});