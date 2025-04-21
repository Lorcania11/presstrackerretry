import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const HeaderSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.backButton}>
          <Text style={styles.backChevron}>􀆉</Text>
          <Text style={styles.backText}>Back</Text>
        </View>

        <Image
          source={{ uri: 'https://placehold.co/84x38' }}
          style={styles.logo}
        />

        <View style={styles.trailingIcon}>
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backChevron: {
    fontSize: 17,
    fontFamily: 'SF Pro',
    color: '#007AFF',
  },
  backText: {
    fontSize: 17,
    fontFamily: 'Open Sans',
    fontWeight: '400',
    color: '#007AFF',
  },
  logo: {
    width: 84,
    height: 38,
    resizeMode: 'contain',
  },
  trailingIcon: {
    position: 'relative',
    width: 22,
    height: 22,
  },
  dot: {
    width: 20,
    height: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    position: 'absolute',
    top: 1,
    left: 1,
  },
});

export default HeaderSection;
