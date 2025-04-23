import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DollarSign } from 'lucide-react-native';

interface PressButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function PressButton({ onPress, disabled = false }: PressButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <DollarSign size={16} color={disabled ? '#999999' : '#FFFFFF'} />
      <Text style={[styles.buttonText, disabled && styles.disabledText]}>
        Press
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  disabledText: {
    color: '#999999',
  },
});