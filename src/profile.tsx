import React, {FC, useEffect, useState} from "react";
import {BehaviorSubject} from "rxjs";
import useObservable from "@soywod/react-use-observable";
import {Alert, Button, ScrollView, StyleSheet, TextInput, View} from "react-native";
import {NavigationStackScreenComponent} from "react-navigation-stack";
import AsyncStorage from "@react-native-community/async-storage";
import {DateTime} from "luxon";

import DateTimePicker from "./datetime-picker";

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

const s = StyleSheet.create({
  container: {height: "100%"},
  content: {flex: 1, padding: 10},
  footer: {height: "auto", padding: 10},
  button: {paddingVertical: 10},
  address: {display: "flex", flexDirection: "row"},
  city: {flex: 1},
  zip: {marginRight: 10, width: 110},
  input: {
    opacity: 1,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    color: "#333333",
    borderColor: "#e8e8e8",
    borderRadius: 4,
  },
});

const ProfileScreen: NavigationStackScreenComponent = props => {
  const [profile, setProfile] = useState(defaultProfile);

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

    props.navigation.goBack();
    profile$.next(nextProfile);
    AsyncStorage.setItem("profile", JSON.stringify(nextProfile));
  }

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <ProfileForm onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        <Button title="Sauvegarder" onPress={nextStep} />
      </View>
    </View>
  );
};

ProfileScreen.navigationOptions = () => ({
  title: "Profil",
});

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
      <TextInput
        placeholder="Prénom"
        placeholderTextColor="#d3d3d3"
        value={firstName || ""}
        onChangeText={setFirstName}
        style={s.input}
      />
      <TextInput
        placeholder="Nom"
        placeholderTextColor="#d3d3d3"
        autoCompleteType="name"
        value={lastName || ""}
        onChangeText={setLastName}
        style={s.input}
      />
      <DateTimePicker
        type="date"
        placeholder="Date de naissance"
        defaultValue={dateOfBirth ? DateTime.fromISO(dateOfBirth) : undefined}
        onChange={date => setDateOfBirth(date ? date.toISO() : "")}
      />
      <TextInput
        placeholder="Lieu de naissaince"
        placeholderTextColor="#d3d3d3"
        value={placeOfBirth || ""}
        onChangeText={setPlaceOfBirth}
        style={s.input}
      />
      <TextInput
        placeholder="Adresse"
        placeholderTextColor="#d3d3d3"
        autoCompleteType="street-address"
        value={address || ""}
        onChangeText={setAddress}
        style={s.input}
      />
      <View style={s.address}>
        <TextInput
          placeholder="Code postal"
          placeholderTextColor="#d3d3d3"
          value={zip || ""}
          keyboardType="numeric"
          onChangeText={setZip}
          style={Object.assign({}, s.input, s.zip)}
        />
        <TextInput
          placeholder="Ville"
          placeholderTextColor="#d3d3d3"
          value={city || ""}
          onChangeText={setCity}
          style={Object.assign({}, s.input, s.city)}
        />
      </View>
    </>
  );
};

export default ProfileScreen;
