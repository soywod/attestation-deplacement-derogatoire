import React, {FC, useEffect, useState} from "react";
import {Alert, Button, ScrollView, StyleSheet, View} from "react-native";
import {BehaviorSubject} from "rxjs";
import useObservable from "@soywod/react-use-observable";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import {DateTime} from "luxon";

import {useTheme} from "./theme";
import DateTimeField from "./fields/datetime";
import TextField from "./fields/text";

export type Profile = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: string;
  city: string;
  zip: string;
  isReady: boolean;
};

export const defaultProfile: Profile = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  address: "",
  city: "",
  zip: "",
  isReady: false,
};

export const profile$ = new BehaviorSubject(defaultProfile);

AsyncStorage.getItem("profile")
  .then(str => JSON.parse(String(str || null)))
  .then(maybeProfile => maybeProfile || defaultProfile)
  .then(profile => profile$.next(Object.assign(profile, {isReady: true})));

export function isProfileComplete(profile: Profile) {
  if (!profile) return false;
  if (!profile.firstName) return false;
  if (!profile.lastName) return false;
  if (!profile.dateOfBirth) return false;
  if (!profile.placeOfBirth) return false;
  if (!profile.address) return false;
  if (!profile.city) return false;
  if (!profile.zip) return false;
  return true;
}

const ProfileScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [profile, setProfile] = useState(defaultProfile);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    firstTitle: {fontSize: 20, marginBottom: 10, color: theme.primaryTextColor},
    secondTitle: {fontSize: 20, marginTop: 20, marginBottom: 10, color: theme.primaryTextColor},
    footer: {height: "auto", padding: 10},
  });

  function nextStep() {
    const nextProfile: Profile = Object.assign({}, defaultProfile, profile);

    if (!isProfileComplete(nextProfile)) {
      return Alert.alert(
        "Formulaire incomplet",
        "Vous devez remplir tous les champs pour pouvoir générer une attestation de déplacement dérogatoire.",
        [{text: "OK"}],
        {cancelable: false},
      );
    }

    navigation.goBack();
    profile$.next(nextProfile);
    AsyncStorage.setItem("profile", JSON.stringify(nextProfile));
  }

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <ProfileForm onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        <Button title="Sauvegarder" onPress={nextStep} color={theme.primaryColor} />
      </View>
    </View>
  );
};

export const ProfileForm: FC<{onChange: (p: Profile) => void}> = props => {
  const updateProfile = props.onChange;
  const [profile] = useObservable(profile$, profile$.value);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [placeOfBirth, setPlaceOfBirth] = useState(profile.placeOfBirth);
  const [address, setAddress] = useState(profile.address);
  const [city, setCity] = useState(profile.city);
  const [zip, setZip] = useState(profile.zip);

  const s = StyleSheet.create({
    address: {display: "flex", flexDirection: "row"},
    zip: {marginRight: 10, width: 110},
    city: {flex: 1},
  });

  useEffect(() => {
    updateProfile(
      Object.assign({}, profile, {
        firstName,
        lastName,
        dateOfBirth,
        placeOfBirth,
        address,
        city,
        zip,
      }),
    );
  }, [address, city, dateOfBirth, firstName, lastName, placeOfBirth, profile, updateProfile, zip]);

  return (
    <>
      <TextField label="Prénom" value={firstName} onChangeText={setFirstName} />
      <TextField label="Nom" autoCompleteType="name" value={lastName} onChangeText={setLastName} />
      <DateTimeField
        type="date"
        label="Date de naissance"
        value={dateOfBirth ? DateTime.fromISO(dateOfBirth) : undefined}
        onChange={date => setDateOfBirth(date ? date.toISO() : "")}
      />
      <TextField label="Lieu de naissaince" value={placeOfBirth} onChangeText={setPlaceOfBirth} />
      <TextField
        label="Adresse"
        autoCompleteType="street-address"
        value={address}
        onChangeText={setAddress}
      />
      <View style={s.address}>
        <TextField
          label="Code postal"
          value={zip}
          keyboardType="numeric"
          onChangeText={setZip}
          containerStyle={s.zip}
        />
        <TextField label="Ville" value={city} onChangeText={setCity} containerStyle={s.city} />
      </View>
    </>
  );
};

export default ProfileScreen;
