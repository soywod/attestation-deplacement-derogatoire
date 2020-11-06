import React, {FC, useState} from "react";
import {
  Alert,
  Button,
  FlatList,
  Text,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import {useNavigation, useRoute, Route} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useObservable from "@soywod/react-use-observable";
import {BehaviorSubject} from "rxjs";

import {useTheme} from "../theme";
import {Profile, SecondaryProfile, emptySecondaryProfile, isProfileValid} from "./model";
import {ProfileForm} from "./form";

export const profiles$ = new BehaviorSubject<SecondaryProfile[]>([]);

AsyncStorage.getItem("profiles")
  .then(str => (str ? JSON.parse(str) : []))
  .then(profiles => profiles$.next(profiles));

export const SecondaryProfilesTab: FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [profiles] = useObservable(profiles$, profiles$.value);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    profileContainer: {
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
    profileNames: {
      color: theme.secondaryTextColor,
    },
    profileTitle: {
      color: theme.primaryTextColor,
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 10,
    },
    profileInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileInfoIconsColumn: {
      alignItems: "center",
    },
    profileInfoIconContainer: {
      justifyContent: "center",
      flex: 1,
    },
    profileInfoIcon: {
      fontSize: 16,
      color: theme.secondaryTextColor,
    },
    profileInfo: {
      color: theme.secondaryTextColor,
      marginLeft: 5,
      fontSize: 14,
    },
    footer: {height: "auto", padding: 10},
  });

  return (
    <View style={s.container}>
      <FlatList
        data={profiles}
        renderItem={({item: profile, index}) => (
          <TouchableOpacity
            activeOpacity={0.9}
            delayPressIn={0}
            delayPressOut={0}
            onPress={() => navigation.navigate("edit-secondary-profile", {index, profile})}
            style={s.profileContainer}
          >
            <Text style={s.profileTitle}>{profile.label}</Text>
            <View style={s.profileInfoContainer}>
              <View style={s.profileInfoIconsColumn}>
                <View style={s.profileInfoIconContainer}>
                  <Icon name="account" color={theme.primaryTextColor} style={s.profileInfoIcon} />
                </View>
                <View style={s.profileInfoIconContainer}>
                  <Icon name="home" color={theme.primaryTextColor} style={s.profileInfoIcon} />
                </View>
              </View>
              <View>
                <Text style={s.profileInfo}>
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text style={s.profileInfo}>
                  {profile.address}, {profile.city}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        style={s.content}
        keyboardShouldPersistTaps="handled"
        keyExtractor={profile => profile.label}
      />
      <View style={s.footer}>
        <Button
          title="Ajouter"
          onPress={() => navigation.navigate("edit-secondary-profile")}
          color={theme.primaryColor}
        />
      </View>
    </View>
  );
};

type EditSecondaryProfileScreenRoute = Route<
  "edit-secondary-profile",
  {
    index: number;
    profile: SecondaryProfile;
  }
>;

export const EditSecondaryProfileScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<EditSecondaryProfileScreenRoute>().params || {};
  const [profiles] = useObservable(profiles$, profiles$.value);
  const [profile, setProfile] = useState<Profile>(
    Object.assign(emptySecondaryProfile(), route.profile),
  );

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    footer: {flexDirection: "row", height: "auto", padding: 10},
    footerLeftButton: {flex: 1, marginRight: 5},
    footerRightButton: {flex: 1, marginLeft: 5},
  });

  const insertProfile = () => {
    const nextProfile: SecondaryProfile = {...emptySecondaryProfile(), ...profile};
    const nextProfiles: SecondaryProfile[] = [...profiles, nextProfile];

    if (!isProfileValid(profile)) {
      return Alert.alert(
        "Profil incomplet",
        "Tous les champs doivent être renseignés.",
        [{text: "OK"}],
        {cancelable: false},
      );
    }

    AsyncStorage.setItem("profiles", JSON.stringify(nextProfiles));
    profiles$.next(nextProfiles);
    ToastAndroid.show("Profil secondaire ajouté", ToastAndroid.SHORT);
    navigation.goBack();
  };

  const updateProfile = () => {
    const nextProfile: SecondaryProfile = {...emptySecondaryProfile(), ...profile};
    const nextProfiles: SecondaryProfile[] = profiles.map((profile, index) =>
      index === route.index ? nextProfile : profile,
    );

    if (!isProfileValid(nextProfile)) {
      return Alert.alert(
        "Profil incomplet",
        "Tous les champs doivent être renseignés.",
        [{text: "OK"}],
        {cancelable: false},
      );
    }

    AsyncStorage.setItem("profiles", JSON.stringify(nextProfiles));
    profiles$.next(nextProfiles);
    ToastAndroid.show("Profil secondaire sauvegardé", ToastAndroid.SHORT);
    navigation.goBack();
  };

  const deleteProfile = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce profil ?",
      [
        {
          text: "Non",
        },
        {
          text: "Oui",
          onPress: () => {
            const nextProfiles = profiles$.value.filter((_, index) => index !== route.index);
            AsyncStorage.setItem("profiles", JSON.stringify(nextProfiles));
            profiles$.next(nextProfiles);
            ToastAndroid.show("Profil secondaire supprimé", ToastAndroid.SHORT);
            navigation.goBack();
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <ProfileForm profile={profile} onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        {route.profile && (
          <View style={s.footerLeftButton}>
            <Button title="Supprimer" onPress={deleteProfile} color={theme.dangerColor} />
          </View>
        )}
        <View style={s.footerRightButton}>
          {route.profile ? (
            <Button title="Modifier" onPress={updateProfile} color={theme.primaryColor} />
          ) : (
            <Button title="Ajouter" onPress={insertProfile} color={theme.primaryColor} />
          )}
        </View>
      </View>
    </View>
  );
};
