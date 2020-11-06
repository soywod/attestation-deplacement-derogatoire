import React, {FC, useEffect, useState} from "react";
import {Alert, Button, ScrollView, StyleSheet, Text, ToastAndroid, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import {BehaviorSubject} from "rxjs";

import {useTheme} from "../theme";
import {PrimaryProfile, Profile, emptyPrimaryProfile, isProfileValid} from "./model";
import ProfileForm from "./form";

export const profile$ = new BehaviorSubject(emptyPrimaryProfile());

AsyncStorage.getItem("profile")
  .then(str => JSON.parse(String(str || null)))
  .then(maybeProfile => maybeProfile || emptyPrimaryProfile())
  .then(profile => profile$.next(Object.assign(profile, {isReady: true})));

export const InitPrimaryProfileScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile>(profile$.value);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    paragraph: {marginBottom: 10, color: theme.primaryTextColor},
    subParagraph: {marginBottom: 10, fontStyle: "italic", color: theme.secondaryTextColor},
    footer: {height: "auto", padding: 10},
  });

  function saveProfile() {
    const nextProfile: PrimaryProfile = Object.assign(emptyPrimaryProfile(), profile);
    if (!isProfileValid(nextProfile)) {
      return Alert.alert(
        "Profil incomplet",
        "Vous devez remplir tous les champs pour pouvoir générer une attestation de déplacement dérogatoire.",
        [{text: "OK"}],
        {cancelable: false},
      );
    }

    AsyncStorage.setItem("profile", JSON.stringify(profile));
    navigation.reset({
      index: 1,
      routes: [{name: "list-certs"}, {name: "edit-reasons", params: {index: 0}}],
    });
    profile$.next(nextProfile);
  }

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <Text style={s.paragraph}>Pour commencer, veuillez saisir vos informations :</Text>
        <Text style={s.subParagraph}>
          Les données saisies sont stockées exclusivement sur votre téléphone, et ne servent qu'à
          générer les attestations. Aucune information n'est collectée ou revendue à des tiers.
        </Text>
        <ProfileForm profile={profile} onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        <Button title="Valider" onPress={saveProfile} color={theme.primaryColor} />
      </View>
    </View>
  );
};

export const PrimaryProfileTab: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile>(profile$.value);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    firstTitle: {fontSize: 20, marginBottom: 10, color: theme.primaryTextColor},
    secondTitle: {fontSize: 20, marginTop: 20, marginBottom: 10, color: theme.primaryTextColor},
    footer: {height: "auto", padding: 10},
  });

  useEffect(() => {
    const sub = profile$.subscribe(setProfile);

    return () => {
      sub.unsubscribe();
    };
  }, []);

  function save() {
    const nextProfile: PrimaryProfile = Object.assign(emptyPrimaryProfile(), profile);

    if (!isProfileValid(nextProfile)) {
      return Alert.alert(
        "Profil incomplet",
        "Tous les champs doivent être renseignés.",
        [{text: "OK"}],
        {cancelable: false},
      );
    }

    AsyncStorage.setItem("profile", JSON.stringify(nextProfile));
    ToastAndroid.show("Profil principal sauvegardé", ToastAndroid.SHORT);
    navigation.goBack();
    profile$.next(nextProfile);
  }

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <ProfileForm profile={profile} onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        <Button title="Sauvegarder" onPress={save} color={theme.primaryColor} />
      </View>
    </View>
  );
};
