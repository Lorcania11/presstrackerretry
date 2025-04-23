// components/ScorecardScreen/ScorecardTitle.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Clock } from 'lucide-react-native';

interface ScorecardTitleProps {
  title: string;
  onBack?: () => void;
  onPressLog?: () => void;
}

const ScorecardTitle: React.FC<ScorecardTitleProps> = ({ 
  title, 
  onBack,
  onPressLog 
}) => {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>
      )}
      
      <Text style={styles.title}>{title || 'Scorecard'}</Text>
      
      {onPressLog && (
        <TouchableOpacity 
          style={styles.pressLogButton}
          onPress={onPressLog}
        >
          <Clock size={16} color="#fff" />
          <Text style={styles.pressLogText}>Press Log</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  pressLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 15, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pressLogText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  }
});

export default ScorecardTitle;