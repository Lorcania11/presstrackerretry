import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Path, Rect, Line } from 'react-native-svg';

const ScorecardGrid = () => {
  return (
    <View style={styles.gridContainer}>
      <Svg style={styles.lineBreakersAndBackground} width="402" height="727" viewBox="0 0 402 727" fill="none">
        <Path d="M158.25 91L0 91L402 91" stroke="#0F0F0F" strokeOpacity="0.25" strokeWidth="2" />
        <Path d="M158.25 141L0 141L402 141" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 191L0 191L402 191" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 241L0 241L402 241" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 341L0 341L402 341" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 441L0 441L402 441" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 291L0 291L402 291" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 391L0 391L402 391" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 491L0 491L402 491" stroke="#484849" strokeOpacity="0.2" />
        <Path d="M158.25 1.00001L0 1L402 1.00004" stroke="#0F0F0F" strokeOpacity="0.5" strokeWidth="2" />
        <Path d="M158.25 541L0 541L402 541" stroke="#0F0F0F" strokeOpacity="0.25" strokeWidth="2" />
        <Path d="M158.25 591L0 591L402 591" stroke="#0F0F0F" strokeOpacity="0.25" strokeWidth="2" />
        <Rect y="541" width="540" height="64" transform="rotate(-90 0 541)" fill="#454545" fillOpacity="0.1" />
        <Rect y="541" width="402" height="50" fill="#454545" fillOpacity="0.1" />
        <Rect y="591" width="402" height="140" fill="#454545" fillOpacity="0.1" />
      </Svg>

      <Svg style={styles.verticalLineTeam1ToTeam2} width="1" height="724" viewBox="0 0 1 724" fill="none">
        <Line x1="0.5" y1="0" x2="0.5" y2="724" stroke="#484849" strokeOpacity="0.2" />
      </Svg>

      <Svg style={styles.verticalLineTeam2ToTeam3} width="1" height="724" viewBox="0 0 1 724" fill="none">
        <Line x1="0.5" y1="0" x2="0.5" y2="724" stroke="#484849" strokeOpacity="0.2" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    position: 'relative',
    flexShrink: 0,
    height: 540,
    width: 402,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: 0,
  },
  lineBreakersAndBackground: {
    position: 'absolute',
    flexShrink: 0,
    height: 730,
    width: 402,
  },
  verticalLineTeam1ToTeam2: {
    position: 'absolute',
    flexShrink: 0,
    top: 0,
    left: 158, // Adjusted for Team 1 to Team 2 separation
    height: 724,
    overflow: 'visible',
  },
  verticalLineTeam2ToTeam3: {
    position: 'absolute',
    flexShrink: 0,
    top: 0,
    left: 289, // Adjusted for Team 2 to Team 3 separation
    height: 724,
    overflow: 'visible',
  },
});

export default ScorecardGrid;