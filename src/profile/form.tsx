import React, {FC, useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {DateTime} from "luxon";

import {Profile, isSecondaryProfile} from "./model";
import {DateTimeField} from "../field/datetime";
import {TextField} from "../field/text";

type ProfileFormProps = {
  profile: Profile;
  onChange: (profile: Profile) => void;
};

export const ProfileForm: FC<ProfileFormProps> = ({profile, onChange: triggerChange}) => {
  const [label, setLabel] = useState(isSecondaryProfile(profile) ? profile.label : "");
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
    triggerChange(
      Object.assign(profile, {
        label,
        firstName,
        lastName,
        dateOfBirth,
        placeOfBirth,
        address,
        city,
        zip,
      }),
    );
  }, [
    address,
    city,
    dateOfBirth,
    firstName,
    label,
    lastName,
    placeOfBirth,
    profile,
    triggerChange,
    zip,
  ]);

  return (
    <>
      {isSecondaryProfile(profile) && (
        <TextField label="Libellé" value={label} onChangeText={setLabel} />
      )}
      <TextField label="Prénom" value={firstName} onChangeText={setFirstName} />
      <TextField label="Nom" autoCompleteType="name" value={lastName} onChangeText={setLastName} />
      <DateTimeField
        type="date"
        display="spinner"
        label="Date de naissance"
        value={dateOfBirth ? DateTime.fromISO(dateOfBirth) : undefined}
        onChange={date => setDateOfBirth(date ? date.toISO() : "")}
      />
      <TextField label="Lieu de naissance" value={placeOfBirth} onChangeText={setPlaceOfBirth} />
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

export default ProfileForm;
