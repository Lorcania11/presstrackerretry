import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const HoleNumbers = ({ showBack9 }) => {
  const { height, width } = Dimensions.get('window');
  const holes = showBack9 ? [...Array(9)].map((_, i) => i + 10) : [...Array(9)].map((_, i) => i + 1);

  return (
    <View style={[styles.container, { height: height * 0.6, width: width * 0.1 }]}>
      <Text style={[styles.label, styles.holeLabel]}>Hole</Text>
      {holes.map((hole, idx) => (
        <Text
          key={hole}
          style={[
            styles.label,
            {
              top: (height * 0.05) * (idx + 1), // Dynamically adjust top position
              left: width * 0.03, // Dynamically adjust left position
            },
          ]}
        >
          {hole}
        </Text>
      ))}
      <Text style={[styles.label, styles.total, { top: height * 0.7 }]}>Total</Text>
      <Text style={[styles.label, styles.range, { top: height * 0.65 }]}>
        {showBack9 ? '10-18' : '1-9'}
      </Text>
    </View>
  );
};

HoleNumbers.propTypes = {
  showBack9: PropTypes.bool.isRequired, // Validate that showBack9 is a boolean and required
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#000',
    lineHeight: 16,
  },
  holeLabel: {
    left: 0,
    top: 0,
  },
  total: {
    left: -4,
  },
  range: {
    left: 3,
  },
});

export default HoleNumbers;