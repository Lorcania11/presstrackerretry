import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NavigationBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View style={styles.timeWrapper}>
          <Text style={styles.time}>9:41</Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.statusIcons}>
          <View style={styles.bar1} />
          <View style={styles.bar2} />
          <View style={styles.bar3} />
          <View style={styles.dot} />
          <View style={styles.battery} />
        </View>
      </View>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 384,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 0.33,
    borderColor: '#0F0F0F',
    paddingTop: 20,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    backdropFilter: 'blur(10px)', // For Web, ignored in mobile
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  timeWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#000',
  },
  spacer: {
    width: 128,
    height: 10,
  },
  statusIcons: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar1: {
    width: 20,
    height: 12,
    backgroundColor: '#000',
  },
  bar2: {
    width: 16,
    height: 12,
    backgroundColor: '#000',
  },
  bar3: {
    width: 24,
    height: 12,
    opacity: 0.3,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 2,
  },
  dot: {
    width: 1.33,
    height: 4,
    backgroundColor: '#000',
    opacity: 0.4,
  },
  battery: {
    width: 20,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  placeholder: {
    height: 44,
  },
});

export default NavigationBar;
