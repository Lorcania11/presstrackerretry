import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { Info, Moon, Share, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { clearAllMatches, loadMatches } = useMatches();
  
  const [autoSave, setAutoSave] = useState(true);
  const [allowPresses, setAllowPresses] = useState(true);
  const [defaultBet, setDefaultBet] = useState('10');
  const [hapticFeedback, setHapticFeedback] = useState(true);
  
  const getContainerStyle = () => {
    return {
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
    };
  };
  
  const getSectionStyle = () => {
    return {
      ...styles.section,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    };
  };
  
  const getTextStyle = () => {
    return {
      ...styles.title,
      color: isDark ? '#FFFFFF' : '#333333',
    };
  };
  
  const getHeaderStyle = () => {
    return {
      ...styles.sectionHeader,
      color: isDark ? '#FFFFFF' : '#333333',
    };
  };
  
  const getRowTextStyle = () => {
    return {
      ...styles.rowText,
      color: isDark ? '#FFFFFF' : '#333333',
    };
  };
  
  const getDangerButtonStyle = () => {
    return {
      ...styles.dangerButton,
      backgroundColor: isDark ? '#331111' : '#FFEBEE',
    };
  };
  
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
    <View style={getContainerStyle()}>
      <Text style={getTextStyle()}>Settings</Text>
      
      <View style={getSectionStyle()}>
        <Text style={getHeaderStyle()}>Preferences</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLabelContainer}>
            <Moon size={20} color={isDark ? '#4CAF50' : '#4CAF50'} />
            <Text style={getRowTextStyle()}>Dark Mode</Text>
          </View>
          <Text style={styles.systemSettingText}>System</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={getRowTextStyle()}>Auto-save matches</Text>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={autoSave ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.row}>
          <Text style={getRowTextStyle()}>Haptic feedback</Text>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={hapticFeedback ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={getSectionStyle()}>
        <Text style={getHeaderStyle()}>Default Betting Settings</Text>
        
        <View style={styles.row}>
          <Text style={getRowTextStyle()}>Allow presses by default</Text>
          <Switch
            value={allowPresses}
            onValueChange={setAllowPresses}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={allowPresses ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={getSectionStyle()}>
        <Text style={getHeaderStyle()}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
          <View style={styles.rowLabelContainer}>
            <Share size={20} color={isDark ? '#4CAF50' : '#4CAF50'} />
            <Text style={getRowTextStyle()}>Export Match Data</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleClearAllData}>
          <View style={styles.rowLabelContainer}>
            <Trash2 size={20} color="#FF5252" />
            <Text style={{ ...getRowTextStyle(), color: '#FF5252' }}>Clear All Match Data</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={getDangerButtonStyle()} onPress={handleClearAllData}>
        <AlertTriangle size={20} color="#FF5252" />
        <Text style={styles.dangerButtonText}>Clear All Match Data</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Info size={14} color={isDark ? '#888888' : '#888888'} style={styles.versionIcon} />
        <Text style={styles.versionText}>Golf Match Tracker v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
  },
  systemSettingText: {
    fontSize: 14,
    color: '#888888',
  },
  actionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  dangerButtonText: {
    color: '#FF5252',
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