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
    listItemView: {
      borderBottomWidth: 1,
      borderBottomColor: theme.fieldBorderColor,
    },
    listItemText: {
      paddingVertical: 20,
      color: theme.primaryTextColor,
    },
    footer: {height: "auto", padding: 10},
  });

  return (
    <View style={s.container}>
      <FlatList
        data={profiles}
        renderItem={({item: profile, index}) => (
          <View style={s.listItemView}>
            <TouchableOpacity
              activeOpacity={0.5}
              delayPressIn={0}
              delayPressOut={0}
              onPress={() => navigation.navigate("edit-secondary-profile", {index, profile})}
            >
              <Text style={s.listItemText}>{profile.label}</Text>
            </TouchableOpacity>
          </View>
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
    ToastAndroid.show("Profil secondaire modifié", ToastAndroid.SHORT);
    navigation.goBack();
  };

  const deleteProfile = () => {
    const nextProfiles = profiles$.value.filter((_, index) => index !== route.index);
    AsyncStorage.setItem("profiles", JSON.stringify(nextProfiles));
    profiles$.next(nextProfiles);
    ToastAndroid.show("Profil secondaire supprimé", ToastAndroid.SHORT);
    navigation.goBack();
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
