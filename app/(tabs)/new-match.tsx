import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { generateUniqueId } from '@/utils/helpers';
import { useMatches } from '@/hooks/useMatches';
import { ChevronDown, ChevronUp, Users, DollarSign, Flag, X } from 'lucide-react-native';
import { useMatchContext, Team } from '@/context/MatchContext';

// Define interface for press objects
interface Press {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  holeIndex: number;
  pressType: string;
  isOriginalBet?: boolean;
}

interface GameFormat {
  id: string;
  type: 'front' | 'back' | 'total';
  label: string;
  betAmount: string;
  enabled: boolean;
}

interface TeamInput {
  id: string;
  name: string;
  placeholder: string;
  players: any[];
}

export default function NewMatchScreen() {
  const { saveMatch } = useMatches();
  const { setTeams } = useMatchContext();
  
  const [title, setTitle] = useState('');
  const [teams, setTeamsState] = useState<TeamInput[]>([
    { id: '1', name: '', placeholder: 'Team 1', players: [] },
    { id: '2', name: '', placeholder: 'Team 2', players: [] },
  ]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [gameFormats, setGameFormats] = useState<GameFormat[]>([
    { id: 'front', type: 'front', label: 'Front 9', betAmount: '10', enabled: false },
    { id: 'back', type: 'back', label: 'Back 9', betAmount: '10', enabled: false },
    { id: 'total', type: 'total', label: 'Full 18', betAmount: '10', enabled: true },
  ]);
  const [playFormat, setPlayFormat] = useState<"stroke" | "match">('stroke');
  const [enablePresses, setEnablePresses] = useState(true);
  const [setupExpanded, setSetupExpanded] = useState(true);
  const [formatExpanded, setFormatExpanded] = useState(true);
  const [bettingExpanded, setBettingExpanded] = useState(true);

  const addTeam = () => {
    if (teams.length < 3) {
      setTeamsState([
        ...teams,
        { id: generateUniqueId(), name: '', placeholder: 'Team 3', players: [] }
      ]);
    }
    setShowAddTeam(false);
  };

  const removeTeam = (id: string) => {
    if (teams.length > 2) {
      setTeamsState(teams.filter(team => team.id !== id));
    }
  };

  const updateTeamName = (id: string, name: string) => {
    setTeamsState(teams.map(team => 
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

  const handleCreateMatch = async () => {
    if (!validateForm()) {
      return;
    }

    const enabledFormats = gameFormats.filter(format => format.enabled);

    if (enabledFormats.length === 0) {
      Alert.alert('Error', 'Please select at least one game format');
      return;
    }

    // Add team colors and initials based on team name
    const teamColors = ['#007AFF', '#34AADC', '#5856D6'];
    
    // Ensure all teams have scores, colors, and initials initialized
    const initializedTeams = teams.map((team, index) => ({
      ...team,
      name: team.name || team.placeholder,
      scores: Array(18).fill(null), // Initialize scores for 18 holes
      color: teamColors[index % teamColors.length],
      initial: (team.name || team.placeholder).charAt(0).toUpperCase(),
    }));

    setTeams(initializedTeams as Team[]); // Update teams in MatchContext with proper casting

    // Convert enabled game formats to the array format needed for match
    const processedGameFormats = enabledFormats.map(format => ({
      type: format.type,
      betAmount: parseFloat(format.betAmount) || 0,
    }));

    // Create initial presses for each enabled game type (starting bets)
    const initialPresses: Press[] = [];
    
    if (enablePresses && initializedTeams.length === 2) {
      processedGameFormats.forEach(format => {
        // Create the starting bet for each game type
        // First team is always pressing, second team is always being pressed
        let pressType;
        let holeIndex;
        
        if (format.type === 'front') {
          pressType = 'front9';
          holeIndex = 0; // Front 9 starts at hole 1 (0-indexed)
        } else if (format.type === 'back') {
          pressType = 'back9';
          holeIndex = 9; // Back 9 starts at hole 10 (0-indexed)
        } else if (format.type === 'total') {
          pressType = 'total18';
          holeIndex = 0; // Total 18 starts at hole 1 (0-indexed)
        } else {
          pressType = format.type;
          holeIndex = 0;
        }
        
        initialPresses.push({
          id: Math.random().toString(36).substring(2, 9),
          fromTeamId: initializedTeams[0].id,
          toTeamId: initializedTeams[1].id,
          holeIndex, // Use the appropriate starting hole index
          pressType,
          isOriginalBet: true, // Flag to identify original bets
        });
      });
    }

    const newMatch = {
      id: generateUniqueId(),
      title: title || `Match ${new Date().toLocaleDateString()}`,
      teams: initializedTeams,
      presses: initialPresses, // Add initial presses to match data
      gameFormats: processedGameFormats,
      playFormat,
      enablePresses,
      holes: Array(18).fill(null).map((_, i) => ({
        number: i + 1,
        scores: initializedTeams.map(team => ({ teamId: team.id, score: null })),
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>
          New Match
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Match Title (Optional)"
          placeholderTextColor="#999999"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => setSetupExpanded(!setupExpanded)}
          >
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color="#007AFF" />
              <Text style={styles.label}>Team Setup</Text>
            </View>
            {setupExpanded ? (
              <ChevronUp size={20} color="#333333" />
            ) : (
              <ChevronDown size={20} color="#333333" />
            )}
          </Pressable>
          
          {setupExpanded && (
            <View style={styles.sectionContent}>
              {teams.map((team, index) => (
                <View key={team.id} style={styles.teamInputContainer}>
                  <View style={styles.teamLabelContainer}>
                    <Text style={styles.teamLabel}>
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
                    style={[styles.input, styles.teamInput]}
                    placeholder={`Enter ${team.placeholder} name`}
                    placeholderTextColor="#999999"
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
          style={styles.section} 
          onPress={() => setFormatExpanded(!formatExpanded)}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Flag size={20} color="#007AFF" />
              <Text style={styles.label}>Game Format</Text>
            </View>
            {formatExpanded ? (
              <ChevronUp size={20} color="#333333" />
            ) : (
              <ChevronDown size={20} color="#333333" />
            )}
          </View>
          
          {formatExpanded && (
            <View style={styles.sectionContent}>
              <Text style={styles.sublabel}>
                Play Format
              </Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    playFormat === 'stroke' && styles.selectedOption
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
                    playFormat === 'match' && styles.selectedOption
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
              
              <Text style={styles.sublabel}>
                Games to Play
              </Text>
              <View style={styles.gameFormatsContainer}>
                {gameFormats.map(format => (
                  <TouchableOpacity
                    key={format.id}
                    style={[
                      styles.gameFormatOption,
                      format.enabled && styles.gameFormatSelected
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

        <View style={styles.section}>
          <Pressable 
            style={styles.sectionHeader}
            onPress={() => setBettingExpanded(!bettingExpanded)}
          >
            <View style={styles.sectionTitleContainer}>
              <DollarSign size={20} color="#007AFF" />
              <Text style={styles.label}>Betting Options</Text>
            </View>
            {bettingExpanded ? (
              <ChevronUp size={20} color="#333333" />
            ) : (
              <ChevronDown size={20} color="#333333" />
            )}
          </Pressable>
          
          {bettingExpanded && (
            <View style={styles.sectionContent}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Enable Presses
                </Text>
                <Switch
                  value={enablePresses}
                  onValueChange={setEnablePresses}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={enablePresses ? '#007AFF' : '#f4f3f4'}
                />
              </View>
              
              {enablePresses && (
                <>
                  <Text style={styles.sublabel}>
                    Bet Amounts
                  </Text>
                  {gameFormats.map(format => format.enabled && (
                    <View key={format.id} style={styles.betInputContainer}>
                      <Text style={styles.betLabel}>
                        {format.label}
                      </Text>
                      <View style={styles.betAmountContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                          style={[styles.input, styles.betInput]}
                          keyboardType="numeric"
                          value={format.betAmount}
                          onChangeText={(amount) => updateBetAmount(format.id, amount)}
                          placeholder="0.00"
                          placeholderTextColor="#999999"
                        />
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
        
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
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 8,
    color: '#333333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
    borderColor: '#DDDDDD',
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
    color: '#333333',
  },
  sublabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
    color: '#666666',
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
    color: '#666666',
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
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addTeamButtonText: {
    color: '#007AFF',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#F0F0F0',
  },
  optionText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#F0F0F0',
  },
  gameFormatText: {
    color: '#333333',
    fontWeight: '500',
  },
  gameFormatSelected: {
    backgroundColor: '#007AFF',
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
    color: '#333333',
  },
  betInputContainer: {
    marginBottom: 16,
  },
  betLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
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
    backgroundColor: '#007AFF',
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