import * as React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Circleforvisualrelevancyonid3teamcolor from "../assets/circle-for-visual-relevancy-on-id3-team-color.svg";
import Circleforvisualrelevancyonid2teamcolor from "../assets/circle-for-visual-relevancy-on-id2-team-color.svg";
import Circleforvisualrelevancyonid1teamcolor from "../assets/circle-for-visual-relevancy-on-id1-team-color.svg";

const TeamsLayout = ({ team1Name = '', team2Name = '', team3Name = '' }) => {
    return (
        <View style={styles.teamsLayout}>
            {/* Team 3 */}
            <View style={[styles.id3Team3IfSelectedIn, styles.team3Layout]}>
                <View style={[styles.team3, styles.team3Layout]}>
                    <Circleforvisualrelevancyonid3teamcolor style={[styles.circleForVisualRelevancyOn, styles.circleLayout]} width={44} height={44} />
                    <Text style={[styles.id3Team3, styles.teamTypo]}>{team3Name}</Text>
                    <Text style={[styles.firstLetterInitial, styles.teamTypo]}>{team3Name.charAt(0)}</Text>
                </View>
            </View>
            {/* Team 2 */}
            <View style={[styles.id2Team2, styles.groupLayout]}>
                <View style={[styles.group, styles.groupLayout]}>
                    <Circleforvisualrelevancyonid2teamcolor style={[styles.circleForVisualRelevancyOn1, styles.circleLayout]} width={44} height={44} />
                    <Text style={[styles.id2Team21, styles.teamTypo]}>{team2Name}</Text>
                    <Text style={[styles.firstLetterInitial1, styles.firstTypo]}>{team2Name.charAt(0)}</Text>
                </View>
            </View>
            {/* Team 1 */}
            <View style={[styles.id1Team1, styles.id1Team1Layout]}>
                <View style={[styles.circleForVisualRelevancyOnParent, styles.id1Team1Layout]}>
                    <Circleforvisualrelevancyonid1teamcolor style={[styles.circleForVisualRelevancyOn2, styles.circleLayout]} width={44} height={44} />
                    <Text style={[styles.id3Team3, styles.teamTypo]}>{team1Name}</Text>
                    <Text style={[styles.firstLetterInitial2, styles.firstTypo]}>{team1Name.charAt(0)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    team3Layout: {
        height: 70,
        width: 72,
        position: "absolute",
        top: 0
    },
    circleLayout: {
        height: 44,
        width: 44,
        top: 0,
        position: "absolute"
    },
    teamTypo: {
        textAlign: "left",
        color: "#000",
        fontFamily: "OpenSans-SemiBold",
        fontWeight: "600",
        lineHeight: 18,
        fontSize: 12,
        position: "absolute"
    },
    groupLayout: {
        width: 44,
        height: 70,
        position: "absolute"
    },
    firstTypo: {
        top: 13,
        textAlign: "left",
        color: "#000",
        fontFamily: "OpenSans-SemiBold",
        fontWeight: "600",
        lineHeight: 18,
        fontSize: 12,
        position: "absolute"
    },
    id1Team1Layout: {
        width: 61,
        left: 0,
        height: 70,
        position: "absolute"
    },
    circleForVisualRelevancyOn: {
        left: 14
    },
    id3Team3: {
        top: 52,
        color: "#000",
        fontFamily: "OpenSans-SemiBold",
        fontWeight: "600",
        lineHeight: 18,
        fontSize: 12,
        left: 0
    },
    firstLetterInitial: {
        top: 14,
        left: 33
    },
    team3: {
        left: 0
    },
    id3Team3IfSelectedIn: {
        left: 221
    },
    circleForVisualRelevancyOn1: {
        left: 0
    },
    id2Team21: {
        left: 7,
        top: 52,
        color: "#000",
        fontFamily: "OpenSans-SemiBold",
        fontWeight: "600",
        lineHeight: 18,
        fontSize: 12
    },
    firstLetterInitial1: {
        left: 18
    },
    group: {
        left: 0,
        top: 0
    },
    id2Team2: {
        left: 122,
        top: 1
    },
    circleForVisualRelevancyOn2: {
        left: 9
    },
    firstLetterInitial2: {
        left: 27
    },
    circleForVisualRelevancyOnParent: {
        top: 0
    },
    id1Team1: {
        top: 1
    },
    teamsLayout: {
        flex: 1,
        width: "100%",
        height: 71
    }
});

export default TeamsLayout;