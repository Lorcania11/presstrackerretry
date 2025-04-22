import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const NavigationBar = () => {
  const [time, setTime] = useState('');
  const { width } = Dimensions.get('window');

  // Update time dynamically
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.statusBar}>
        <View style={styles.timeWrapper}>
          <Text style={styles.time}>{time}</Text>
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
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.33,
    borderColor: '#0F0F0F',
    paddingTop: 20,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For Android shadow
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