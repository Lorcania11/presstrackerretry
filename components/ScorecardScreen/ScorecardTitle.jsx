import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const ScorecardTitle = () => {
  return (
    <View style={styles.container}>
      {/* Button Background */}
      <View style={styles.buttonBackground} />

      {/* Press Log Text */}
      <Text style={styles.pressLog}>Press Log</Text>

      {/* Save Time Icon */}
      <Svg style={styles.saveTimeIcon} width="19" height="20" viewBox="0 0 19 20" fill="none">
        <Path
          d="M1.38379 19.5545C1.88357 19.1314 2.52334 18.9258 3.16754 18.9811L9.09351 19.4431H9.11225C10.237 19.4353 11.3311 19.0636 12.2404 18.3804L19 11.5422C18.7365 11.3501 18.4199 11.2508 18.0974 11.2592C17.7748 11.2676 17.4635 11.3832 17.2097 11.5888L17.2017 11.5952L13.8373 14.1915C13.9213 14.3977 13.9826 14.6129 14.0202 14.8333C14.038 14.9385 14.0146 15.0467 13.9551 15.1341C13.8956 15.2215 13.8049 15.281 13.7029 15.2994L8.2434 16.2849C8.22102 16.2889 8.19835 16.2908 8.17565 16.2907C8.07774 16.291 7.98329 16.2533 7.91104 16.1851C7.83879 16.1169 7.79402 16.0232 7.7856 15.9225C7.77718 15.8218 7.80572 15.7216 7.86558 15.6416C7.92544 15.5617 8.01223 15.5078 8.10874 15.4908L13.1482 14.5811C12.9744 14.1044 12.6449 13.7053 12.2165 13.4525C11.7881 13.1997 11.2877 13.109 10.8014 13.1962L7.48016 13.7958C6.82674 13.9128 6.15619 13.8767 5.51809 13.6902L5.14662 13.5812C4.24605 13.3144 3.29236 13.3038 2.38641 13.5504C1.48046 13.797 0.655922 14.2917 0 14.9821L0.850446 20L1.38379 19.5545ZM8.72728 10.7761C9.75989 10.7761 10.7693 10.4601 11.6279 9.86808C12.4865 9.27603 13.1556 8.43453 13.5508 7.44999C13.946 6.46545 14.0494 5.38209 13.8479 4.33691C13.6465 3.29173 13.1492 2.33166 12.419 1.57813C11.6889 0.824596 10.7586 0.311432 9.74584 0.103533C8.73307 -0.104367 7.68332 0.00233451 6.72931 0.410144C5.77531 0.817954 4.95991 1.50856 4.38622 2.39462C3.81254 3.28068 3.50634 4.32241 3.50634 5.38807C3.5079 6.81658 4.05846 8.18611 5.03724 9.19622C6.01602 10.2063 7.34308 10.7745 8.72728 10.7761ZM8.00023 2.49047C8.00023 2.38364 8.04136 2.28118 8.11455 2.20564C8.18775 2.1301 8.28703 2.08766 8.39055 2.08766C8.49407 2.08766 8.59335 2.1301 8.66654 2.20564C8.73974 2.28118 8.78087 2.38364 8.78087 2.49047V5.51731H10.9109C11.0144 5.51731 11.1137 5.55975 11.1869 5.63529C11.2601 5.71083 11.3012 5.81329 11.3012 5.92012C11.3012 6.02696 11.2601 6.12941 11.1869 6.20496C11.1137 6.2805 11.0144 6.32294 10.9109 6.32294H8.41536C8.19974 6.32294 8.00023 6.09362 8.00023 5.8711V2.49047Z"
          fill="#FBFAF5"
        />
      </Svg>

      {/* Scorecard Title */}
      <Text style={styles.scorecard}>Scorecard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexShrink: 0,
    height: 49,
    width: 402,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: 0,
  },
  buttonBackground: {
    position: 'absolute',
    flexShrink: 0,
    width: 112,
    height: 28,
    backgroundColor: 'rgba(15, 15, 15, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 1)',
    borderRadius: 5,
  },
  pressLog: {
    position: 'absolute',
    flexShrink: 0,
    top: 5,
    left: 39,
    width: 60,
    height: 18,
    textAlign: 'left',
    color: 'rgba(251, 250, 245, 1)',
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
  },
  saveTimeIcon: {
    position: 'absolute',
    flexShrink: 0,
    top: 5,
    left: 5,
  },
  scorecard: {
    position: 'absolute',
    flexShrink: 0,
    top: 5,
    left: 120,
    width: 100,
    height: 28,
    textAlign: 'left',
    color: 'rgba(72, 72, 73, 1)',
    fontFamily: 'Open Sans',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
});

export default ScorecardTitle;