import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { useMatches } from '@/hooks/useMatches';
import { Info, Moon, Share, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function SettingsScreen() {
  const { clearAllMatches, loadMatches } = useMatches();
  
  const [autoSave, setAutoSave] = useState(true);
  const [allowPresses, setAllowPresses] = useState(true);
  const [defaultBet, setDefaultBet] = useState('10');
  const [hapticFeedback, setHapticFeedback] = useState(true);
  
  const handleClearAllData = async () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all matches? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            await clearAllMatches();
            await loadMatches(); // Reload matches to ensure UI is updated
            Alert.alert("Success", "All match data has been cleared");
          }
        }
      ]
    );
  };
  
  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This feature is coming soon!",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Preferences</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLabelContainer}>
            <Moon size={20} color="#007AFF" />
            <Text style={styles.rowText}>Dark Mode</Text>
          </View>
          <Text style={styles.systemSettingText}>System (Disabled)</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowText}>Auto-save matches</Text>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ false: '#767577', true: '#D1E5FF' }}
            thumbColor={autoSave ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowText}>Haptic feedback</Text>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: '#767577', true: '#D1E5FF' }}
            thumbColor={hapticFeedback ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Default Betting Settings</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowText}>Allow presses by default</Text>
          <Switch
            value={allowPresses}
            onValueChange={setAllowPresses}
            trackColor={{ false: '#767577', true: '#D1E5FF' }}
            thumbColor={allowPresses ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
          <View style={styles.rowLabelContainer}>
            <Share size={20} color="#007AFF" />
            <Text style={styles.rowText}>Export Match Data</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleClearAllData}>
          <View style={styles.rowLabelContainer}>
            <Trash2 size={20} color="#FF3B30" />
            <Text style={{ ...styles.rowText, color: '#FF3B30' }}>Clear All Match Data</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
        <AlertTriangle size={20} color="#FF3B30" />
        <Text style={styles.dangerButtonText}>Clear All Match Data</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Info size={14} color="#888888" style={styles.versionIcon} />
        <Text style={styles.versionText}>Golf Match Tracker v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 8,
    color: '#333333',
  },
  section: {
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    // Enhanced iOS shadow styling
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: '#EEEEEE',
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
  },
  systemSettingText: {
    fontSize: 14,
    color: '#888888',
  },
  actionRow: {
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: '#EEEEEE',
    // iOS specific touch feedback styling
    ...Platform.select({
      ios: {
        backgroundColor: '#FFFFFF',
      }
    }),
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    marginTop: 16,
    backgroundColor: '#FFEBEE',
    // Enhanced iOS danger button shadow
    ...Platform.select({
      ios: {
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }
    }),
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  versionIcon: {
    marginRight: 6,
  },
  versionText: {
    fontSize: 12,
    color: '#888888',
  },
});