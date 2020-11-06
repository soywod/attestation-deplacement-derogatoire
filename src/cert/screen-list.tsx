import React, {FC} from "react";
import {Button, FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {useNavigation} from "@react-navigation/native";
import useObservable from "@soywod/react-use-observable";
import {DateTime} from "luxon";

import {useTheme} from "../theme";
import {DATE_FMT, TIME_FMT} from "../field/datetime";
import {isPrimaryProfile} from "../profile";
import {certs$, stringifyReasons} from ".";

export const CertListScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [certs] = useObservable(certs$, certs$.value);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    certContainer: {
      marginVertical: 5,
      borderRightWidth: 1,
      borderLeftWidth: 1,
      borderColor: theme.fieldBorderColor,
      backgroundColor: theme.headerBackgroundColor,
      borderRadius: 3,
      padding: 10,
      shadowColor: "#333333",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 3,
    },
    certTitle: {
      color: theme.primaryTextColor,
      fontWeight: "bold",
      textTransform: "capitalize",
      fontSize: 16,
      marginBottom: 10,
    },
    certInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    certInfoIconsColumn: {
      alignItems: "center",
    },
    certInfoIconContainer: {
      justifyContent: "center",
      flex: 1,
    },
    certInfoIcon: {
      fontSize: 16,
      color: theme.secondaryTextColor,
    },
    certInfo: {
      color: theme.secondaryTextColor,
      marginLeft: 5,
      fontSize: 14,
    },
    footer: {height: "auto", padding: 10},
  });

  return (
    <View style={s.container}>
      <FlatList
        data={certs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
        renderItem={({item: cert, index}) => (
          <TouchableOpacity
            activeOpacity={0.9}
            delayPressIn={0}
            delayPressOut={0}
            onPress={() => navigation.navigate("render-pdf", {index, cert})}
            style={s.certContainer}
          >
            <Text style={s.certTitle}>{stringifyReasons(cert)}</Text>
            <View style={s.certInfoContainer}>
              <View style={s.certInfoIconsColumn}>
                <View style={s.certInfoIconContainer}>
                  <Icon name="account" color={theme.primaryTextColor} style={s.certInfoIcon} />
                </View>
                <View style={s.certInfoIconContainer}>
                  <Icon
                    name="calendar-month"
                    color={theme.primaryTextColor}
                    style={s.certInfoIcon}
                  />
                </View>
                <View style={s.certInfoIconContainer}>
                  <Icon name="clock" color={theme.primaryTextColor} style={s.certInfoIcon} />
                </View>
              </View>
              <View>
                <Text style={s.certInfo}>
                  {isPrimaryProfile(cert.profile) ? "Principal" : cert.profile.label}
                </Text>
                <Text style={s.certInfo}>
                  Créé le {DateTime.fromISO(cert.createdAt).toFormat(`${DATE_FMT} 'à' ${TIME_FMT}`)}
                </Text>
                <Text style={s.certInfo}>
                  Sortie le {DateTime.fromISO(cert.leaveAt).toFormat(`${DATE_FMT} 'à' ${TIME_FMT}`)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(_, idx) => idx.toString()}
        style={s.content}
      />
      <View style={s.footer}>
        <Button
          title="Ajouter"
          onPress={() => navigation.navigate("edit-reasons", {index: certs.length})}
          color={theme.primaryColor}
        />
      </View>
    </View>
  );
};

export const CertListHeaderRight = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  const s = StyleSheet.create({
    text: {padding: 10, marginRight: 5, color: theme.primaryTextColor},
  });

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("show-profiles")}>
      <Text style={s.text}>Profils</Text>
    </TouchableOpacity>
  );
};
