import React, {FC} from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFS from "react-native-fs";
import {useNavigation} from "@react-navigation/native";
import useObservable from "@soywod/react-use-observable";
import {DateTime} from "luxon";

import {useTheme} from "../theme";
import {DATE_FMT, TIME_FMT} from "../field/datetime";
import {isPrimaryProfile} from "../profile";
import {Certificate, certs$, stringifyReasons} from ".";

export const CertListScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [certs] = useObservable(certs$, certs$.value);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10, paddingTop: 15},
    certContainer: {
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.fieldBorderColor,
      backgroundColor: theme.headerBackgroundColor,
      borderRadius: 5,
      padding: 10,
      elevation: 2,
    },
    certTitleContainer: {
      flexDirection: "row",
    },
    certTitle: {
      color: theme.primaryTextColor,
      flex: 1,
      fontWeight: "bold",
      textTransform: "capitalize",
      fontSize: 16,
      marginBottom: 10,
    },
    certTitleIcon: {
      fontSize: 22,
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

  const deleteCert = (cert: Certificate, certIndex: number) => () => {
    Alert.alert(
      "Attention",
      "Êtes-vous sûr de vouloir supprimer cette attestation ?",
      [
        {text: "Non"},
        {
          text: "Oui",
          onPress: () => {
            const nextCerts = certs.filter((_, index) => index !== certIndex);
            certs$.next(nextCerts);
            AsyncStorage.setItem("certs", JSON.stringify(nextCerts));
            cert.path && RNFS.unlink(cert.path).catch();
            ToastAndroid.show("Attestation supprimée", ToastAndroid.SHORT);
          },
        },
      ],
      {cancelable: true},
    );
  };

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
            onLongPress={deleteCert(cert, index)}
            style={s.certContainer}
          >
            <View style={s.certTitleContainer}>
              <Text style={s.certTitle}>{stringifyReasons(cert)}</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                delayPressIn={0}
                delayPressOut={0}
                onPress={deleteCert(cert, index)}
              >
                <Icon name="close" color={theme.dangerColor} style={s.certTitleIcon} />
              </TouchableOpacity>
            </View>
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
    container: {flexDirection: "row"},
    text: {padding: 10, marginRight: 5, color: theme.primaryTextColor},
  });

  return (
    <View style={s.container}>
      <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("show-about")}>
        <Text style={s.text}>À propos</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("show-profiles")}>
        <Text style={s.text}>Profils</Text>
      </TouchableOpacity>
    </View>
  );
};
