import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface HeaderSectionProps {
  onInfoPress?: () => void;
  onBackPress?: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  onInfoPress,
  onBackPress
}) => {
    return (
        <View style={styles.headerSectionContainer}>
            <View style={styles.contents}>
                <View style={styles.titleandControls}>
                    <View style={styles.leading}>
                        <TouchableOpacity 
                          style={styles.button1}
                          onPress={onBackPress}
                        >
                            <Text style={styles.chevron}>
                                {`􀆉`}
                            </Text>
                            <Text style={styles.label}>
                                {`Back`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <ImageBackground
                        style={styles.pressTrackerAppLogo}
                        source={{ uri: 'https://dummyimage.com/84x38/000/fff.png' }}
                    />
                    <TouchableOpacity 
                      style={styles.informationHelpicon}
                      onPress={onInfoPress}
                    >
                        <Svg style={styles.group} width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <Path
                                d="M10 0.00480652C4.48018 0.00480652 0.00482178 4.48016 0.00482178 10C0.00482178 15.5198 4.48018 19.9952 10 19.9952C15.5198 19.9952 19.9952 15.5198 19.9952 10C19.9952 4.48016 15.5198 0.00480652 10 0.00480652ZM12.0823 15.4967C11.5667 15.6983 11.1569 15.8537 10.8495 15.9594C10.5421 16.0652 10.1884 16.1181 9.78186 16.1181C9.16047 16.1181 8.6746 15.966 8.32754 15.662C7.98379 15.3612 7.81192 14.9745 7.81192 14.5051C7.81192 14.3233 7.82514 14.1382 7.85158 13.9498C7.87472 13.7581 7.91769 13.5466 7.97388 13.3053L8.61841 11.0312C8.6746 10.8131 8.72418 10.6082 8.76385 10.4132C8.80352 10.2181 8.82004 10.0397 8.82004 9.8777C8.82004 9.59014 8.76055 9.38521 8.64155 9.27284C8.51926 9.15715 8.29119 9.10097 7.95405 9.10097C7.78879 9.10097 7.61691 9.12741 7.44173 9.17698C7.26655 9.22987 7.11782 9.27944 6.99221 9.32572L7.16409 8.625C7.58386 8.45313 7.98711 8.3077 8.37383 8.1854C8.75725 8.06311 9.12413 8.00031 9.46457 8.00031C10.0827 8.00031 10.5619 8.15235 10.8958 8.44983C11.2296 8.7473 11.3982 9.13733 11.3982 9.61329C11.3982 9.71245 11.3883 9.88763 11.3651 10.1355C11.342 10.3834 11.299 10.6115 11.2362 10.823L10.595 13.0905C10.5421 13.2722 10.4958 13.4805 10.4529 13.7119C10.4132 13.9432 10.3934 14.1217 10.3934 14.2407C10.3934 14.5415 10.4595 14.7497 10.595 14.8588C10.7272 14.9679 10.9619 15.0207 11.2957 15.0207C11.4511 15.0207 11.6263 14.9943 11.8246 14.9414C12.0196 14.8852 12.1617 14.839 12.2509 14.796L12.0823 15.4967ZM11.9667 6.29147C11.6692 6.56911 11.3089 6.70793 10.8891 6.70793C10.4694 6.70793 10.1058 6.56911 9.805 6.29147C9.50422 6.01383 9.35548 5.67668 9.35548 5.28335C9.35548 4.89002 9.50752 4.54957 9.805 4.26863C10.1058 3.98768 10.4694 3.84886 10.8891 3.84886C11.3089 3.84886 11.6692 3.98768 11.9667 4.26863C12.2674 4.54957 12.4162 4.89002 12.4162 5.28335C12.4162 5.67668 12.2674 6.01382 11.9667 6.29147Z"
                                fill="#007AFF"
                            />
                        </Svg>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerSectionContainer: {
        position: "relative",
        flexShrink: 0,
        height: 43,
        width: 402,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0
    },
    contents: {
        position: "absolute",
        flexShrink: 0,
        height: 43,
        width: 402,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0
    },
    titleandControls: {
        position: "relative",
        alignSelf: "stretch",
        flexShrink: 0,
        height: 44,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        rowGap: 19
    },
    leading: {
        position: "absolute",
        flexShrink: 0,
        paddingLeft: 8,
        paddingRight: 0,
        display: "flex",
        alignItems: "center",
        columnGap: 0,
        paddingVertical: 11
    },
    button1: {
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        columnGap: 6
    },
    chevron: {
        position: "relative",
        flexShrink: 0,
        textAlign: "left",
        color: "rgba(0, 122, 255, 1)",
        fontFamily: "SF Pro",
        fontSize: 17,
        fontWeight: "600",
        lineHeight: 22
    },
    label: {
        position: "relative",
        flexShrink: 0,
        textAlign: "left",
        color: "rgba(0, 122, 255, 1)",
        fontFamily: "Open Sans",
        fontSize: 17,
        fontWeight: "400",
        letterSpacing: -0.43,
        lineHeight: 22
    },
    pressTrackerAppLogo: {
        position: "absolute",
        flexShrink: 0,
        top: 3,
        right: 159,
        bottom: 3,
        left: 159
    },
    informationHelpicon: {
        position: "absolute",
        flexShrink: 0,
        top: 11,
        height: 22,
        left: 366,
        width: 22,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0
    },
    group: {
        position: "absolute",
        flexShrink: 0,
        top: 1,
        height: 20,
        left: 1,
        width: 20
    }
});

export default HeaderSection;