import { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  useColorScheme,
  Alert,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { generateUniqueId } from '@/utils/helpers';
import { useMatches } from '@/hooks/useMatches';
import { ChevronDown, ChevronUp, Users, DollarSign, Flag, X } from 'lucide-react-native';

interface GameFormat {
  id: string;
  type: 'front' | 'back' | 'total';
  label: string;
  betAmount: string;
  enabled: boolean;
}

export default function NewMatchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { saveMatch } = useMatches();
  
  const [title, setTitle] = useState('');
  const [teams, setTeams] = useState([
    { id: '1', name: '', placeholder: 'Team 1', players: [] },
    { id: '2', name: '', placeholder: 'Team 2', players: [] },
  ]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [gameFormats, setGameFormats] = useState<GameFormat[]>([
    { id: 'front', type: 'front', label: 'Front 9', betAmount: '10', enabled: false },
    { id: 'back', type: 'back', label: 'Back 9', betAmount: '10', enabled: false },
    { id: 'total', type: 'total', label: 'Full 18', betAmount: '10', enabled: true },
  ]);
  const [playFormat, setPlayFormat] = useState('stroke'); // 'stroke', 'match'
  const [enablePresses, setEnablePresses] = useState(true);
  const [setupExpanded, setSetupExpanded] = useState(true);
  const [formatExpanded, setFormatExpanded] = useState(true);
  const [bettingExpanded, setBettingExpanded] = useState(true);

  const addTeam = () => {
    if (teams.length < 3) {
      setTeams([
        ...teams,
        { id: generateUniqueId(), name: '', placeholder: 'Team 3', players: [] }
      ]);
    }
    setShowAddTeam(false);
  };

  const removeTeam = (id: string) => {
    if (teams.length > 2) {
      setTeams(teams.filter(team => team.id !== id));
    }
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams(teams.map(team => 
      team.id === id ? { ...team, name } : team
    ));
  };

  const toggleGameFormat = (formatId: string) => {
    setGameFormats(formats => formats.map(format => 
      format.id === formatId 
        ? { ...format, enabled: !format.enabled }
        : format
    ));
  };

  const updateBetAmount = (formatId: string, amount: string) => {
    setGameFormats(formats => formats.map(format => 
      format.id === formatId 
        ? { ...format, betAmount: amount }
        : format
    ));
  };

  const getTextInputStyle = () => {
    return {
      ...styles.input,
      backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
      color: isDark ? '#FFFFFF' : '#333333',
      borderColor: isDark ? '#444444' : '#DDDDDD',
    };
  };

  const getSectionStyle = () => {
    return {
      ...styles.section,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    };
  };

  const getLabelStyle = () => {
    return {
      ...styles.label,
      color: isDark ? '#FFFFFF' : '#333333',
    };
  };

  const getContainerStyle = () => {
    return {
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
    };
  };

  const handleCreateMatch = async () => {
    if (!validateForm()) {
      return;
    }

    const enabledFormats = gameFormats.filter(format => format.enabled);
    
    if (enabledFormats.length === 0) {
      Alert.alert('Error', 'Please select at least one game format');
      return;
    }

    const newMatch = {
      id: generateUniqueId(),
      title: title || `Match ${new Date().toLocaleDateString()}`,
      teams: teams.map(team => ({
        ...team,
        name: team.name || team.placeholder
      })),
      gameFormats: enabledFormats.map(format => ({
        type: format.type,
        betAmount: parseFloat(format.betAmount) || 0,
      })),
      playFormat,
      enablePresses,
      holes: Array(18).fill(null).map((_, i) => ({
        number: i + 1,
        scores: teams.map(team => ({ teamId: team.id, score: null })),
        presses: [],
        isComplete: false,
      })),
      createdAt: new Date().toISOString(),
      isComplete: false,
    };

    await saveMatch(newMatch);
    router.push(`/match/${newMatch.id}`);
  };

  const validateForm = () => {
    const uniqueNames = new Set(teams.map(team => team.name || team.placeholder));
    
    if (uniqueNames.size !== teams.length) {
      Alert.alert('Error', 'Each team must have a unique name');
      return false;
    }
    
    const enabledFormats = gameFormats.filter(format => format.enabled);
    
    if (enabledFormats.some(format => isNaN(parseFloat(format.betAmount)) && enablePresses)) {
      Alert.alert('Error', 'Please enter valid bet amounts for all enabled formats');
      return false;
    }
    
    return true;
  };

  return (
    <View style={getContainerStyle()}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#333333' }]}>
          New Match
        </Text>

        <TextInput
          style={getTextInputStyle()}
          placeholder="Match Title (Optional)"
          placeholderTextColor={isDark ? '#888888' : '#999999'}
          value={title}
          onChangeText={setTitle}
        />

        <View style={getSectionStyle()}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => setSetupExpanded(!setupExpanded)}
          >
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={isDark ? '#4CAF50' : '#4CAF50'} />
              <Text style={getLabelStyle()}>Team Setup</Text>
            </View>
            {setupExpanded ? (
              <ChevronUp size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            ) : (
              <ChevronDown size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            )}
          </Pressable>
          
          {setupExpanded && (
            <View style={styles.sectionContent}>
              {teams.map((team, index) => (
                <View key={team.id} style={styles.teamInputContainer}>
                  <View style={styles.teamLabelContainer}>
                    <Text style={[styles.teamLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                      {team.placeholder}
                    </Text>
                    {teams.length > 2 && (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeTeam(team.id)}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[getTextInputStyle(), styles.teamInput]}
                    placeholder={`Enter ${team.placeholder} name`}
                    placeholderTextColor={isDark ? '#888888' : '#999999'}
                    value={team.name}
                    onChangeText={(name) => updateTeamName(team.id, name)}
                  />
                </View>
              ))}
              
              {teams.length < 3 && !showAddTeam ? (
                <TouchableOpacity
                  style={styles.addTeamButton}
                  onPress={() => setShowAddTeam(true)}
                >
                  <Text style={styles.addTeamButtonText}>+ Add Team</Text>
                </TouchableOpacity>
              ) : showAddTeam && (
                <View style={styles.addTeamActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={addTeam}
                  >
                    <Text style={styles.actionButtonText}>Add Team</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setShowAddTeam(false)}
                  >
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={getSectionStyle()} 
          onPress={() => setFormatExpanded(!formatExpanded)}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Flag size={20} color={isDark ? '#4CAF50' : '#4CAF50'} />
              <Text style={getLabelStyle()}>Game Format</Text>
            </View>
            {formatExpanded ? (
              <ChevronUp size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            ) : (
              <ChevronDown size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            )}
          </View>
          
          {formatExpanded && (
            <View style={styles.sectionContent}>
              <Text style={[styles.sublabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Play Format
              </Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    playFormat === 'stroke' && styles.selectedOption,
                    playFormat === 'stroke' && { backgroundColor: '#4CAF50' }
                  ]}
                  onPress={() => setPlayFormat('stroke')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      playFormat === 'stroke' && styles.selectedOptionText
                    ]}
                  >
                    Stroke Play
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    playFormat === 'match' && styles.selectedOption,
                    playFormat === 'match' && { backgroundColor: '#4CAF50' }
                  ]}
                  onPress={() => setPlayFormat('match')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      playFormat === 'match' && styles.selectedOptionText
                    ]}
                  >
                    Match Play
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.sublabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Games to Play
              </Text>
              <View style={styles.gameFormatsContainer}>
                {gameFormats.map(format => (
                  <TouchableOpacity
                    key={format.id}
                    style={[
                      styles.gameFormatOption,
                      format.enabled && styles.gameFormatSelected,
                      format.enabled && { backgroundColor: '#4CAF50' }
                    ]}
                    onPress={() => toggleGameFormat(format.id)}
                  >
                    <Text
                      style={[
                        styles.gameFormatText,
                        format.enabled && styles.gameFormatTextSelected
                      ]}
                    >
                      {format.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={getSectionStyle()} 
          onPress={() => setBettingExpanded(!bettingExpanded)}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <DollarSign size={20} color={isDark ? '#4CAF50' : '#4CAF50'} />
              <Text style={getLabelStyle()}>Betting Options</Text>
            </View>
            {bettingExpanded ? (
              <ChevronUp size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            ) : (
              <ChevronDown size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            )}
          </View>
          
          {bettingExpanded && (
            <View style={styles.sectionContent}>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                  Enable Presses
                </Text>
                <Switch
                  value={enablePresses}
                  onValueChange={setEnablePresses}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={enablePresses ? '#4CAF50' : '#f4f3f4'}
                />
              </View>
              
              {enablePresses && (
                <>
                  <Text style={[styles.sublabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                    Bet Amounts
                  </Text>
                  {gameFormats.map(format => format.enabled && (
                    <View key={format.id} style={styles.betInputContainer}>
                      <Text style={[styles.betLabel, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                        {format.label}
                      </Text>
                      <View style={styles.betAmountContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                          style={[getTextInputStyle(), styles.betInput]}
                          keyboardType="numeric"
                          value={format.betAmount}
                          onChangeText={(amount) => updateBetAmount(format.id, amount)}
                          placeholder="0.00"
                          placeholderTextColor={isDark ? '#888888' : '#999999'}
                        />
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateMatch}
        >
          <Text style={styles.createButtonText}>Create Match</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sublabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  teamInputContainer: {
    marginBottom: 16,
  },
  teamLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  teamInput: {
    marginBottom: 0,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTeamButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addTeamButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  addTeamActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666666',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#EEEEEE',
  },
  optionText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  gameFormatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  gameFormatOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#EEEEEE',
  },
  gameFormatText: {
    color: '#333333',
    fontWeight: '500',
  },
  gameFormatSelected: {
    backgroundColor: '#4CAF50',
  },
  gameFormatTextSelected: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  betInputContainer: {
    marginBottom: 16,
  },
  betLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  betAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 8,
    color: '#666666',
  },
  betInput: {
    flex: 1,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});