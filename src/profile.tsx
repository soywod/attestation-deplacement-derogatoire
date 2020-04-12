import React, {FC, useEffect, useRef, useState} from "react"
import {BehaviorSubject} from "rxjs"
import {useToggle, useBehaviorSubject} from "react-captain"
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import {NavigationStackScreenComponent} from "react-navigation-stack"
import DateTimePicker from "@react-native-community/datetimepicker"
import {DateTime} from "luxon"
import AsyncStorage from "@react-native-community/async-storage"

export type Profile = {
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  city: string
  zip: string
  isReady: boolean
}

export const defaultProfile: Profile = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  address: "",
  city: "",
  zip: "",
  isReady: false,
}

export const profile$ = new BehaviorSubject(defaultProfile)

AsyncStorage.getItem("profile")
  .then(str => JSON.parse(String(str || null)))
  .then(maybeProfile => maybeProfile || defaultProfile)
  .then(profile => profile$.next(Object.assign(profile, {isReady: true})))

export function isProfileComplete(profile: Profile) {
  if (!profile) return false
  if (!profile.firstName) return false
  if (!profile.lastName) return false
  if (!profile.dateOfBirth) return false
  if (!profile.placeOfBirth) return false
  if (!profile.address) return false
  if (!profile.city) return false
  if (!profile.zip) return false
  return true
}

const s = StyleSheet.create({
  container: {height: "100%"},
  content: {flex: 1, padding: 10},
  footer: {height: "auto", padding: 10},
  button: {paddingVertical: 10},
  address: {display: "flex", flexDirection: "row"},
  city: {flex: 1},
  zip: {marginLeft: 10, width: 110},
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
})

const ProfileScreen: NavigationStackScreenComponent = props => {
  const [profile, setProfile] = useState(defaultProfile)

  function nextStep() {
    const nextProfile: Profile = Object.assign({}, defaultProfile, profile)

    if (!isProfileComplete(nextProfile)) {
      return Alert.alert(
        "Formulaire incomplet",
        "Vous devez remplir tous les champs pour pouvoir générer une attestation de déplacement dérogatoire.",
        [{text: "OK"}],
        {cancelable: false},
      )
    }

    props.navigation.goBack()
    profile$.next(nextProfile)
    AsyncStorage.setItem("profile", JSON.stringify(nextProfile))
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
  )
}

ProfileScreen.navigationOptions = () => ({
  title: "Profil",
})

export const ProfileForm: FC<{onChange: (p: Profile) => void}> = props => {
  const updateProfile = props.onChange
  const now = DateTime.local()
  const [profile] = useBehaviorSubject(profile$)
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth)
  const dateOfBirthPicker = useRef<TextInput | null>(null)
  const [isDateOfBirthPickerVisible, setDateOfBirthPickerVisible] = useToggle()
  const [placeOfBirth, setPlaceOfBirth] = useState(profile.placeOfBirth)
  const [address, setAddress] = useState(profile.address)
  const [city, setCity] = useState(profile.city)
  const [zip, setZip] = useState(profile.zip)

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
    )
  }, [address, city, dateOfBirth, firstName, lastName, placeOfBirth, profile, updateProfile, zip])

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
      <TouchableOpacity activeOpacity={0.75} onPress={setDateOfBirthPickerVisible}>
        <View pointerEvents="none">
          <TextInput
            ref={dateOfBirthPicker}
            placeholder={
              dateOfBirth
                ? DateTime.fromISO(dateOfBirth).toFormat("dd/MM/yyyy")
                : "Date de naissance"
            }
            placeholderTextColor={dateOfBirth ? "#333333" : "#d3d3d3"}
            style={s.input}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      {isDateOfBirthPickerVisible && (
        <>
          <DateTimePicker
            display="spinner"
            maximumDate={now.toJSDate()}
            value={dateOfBirth ? DateTime.fromISO(dateOfBirth).toJSDate() : now.toJSDate()}
            onChange={(_, date) => {
              Platform.OS === "android" && setDateOfBirthPickerVisible(false)
              setDateOfBirth(date ? DateTime.fromJSDate(date).toISO() : "")
            }}
          />
          {Platform.OS === "ios" && (
            <Button title="Valider" onPress={() => setDateOfBirthPickerVisible(false)} />
          )}
        </>
      )}
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
          placeholder="Ville"
          placeholderTextColor="#d3d3d3"
          value={city || ""}
          onChangeText={setCity}
          style={Object.assign({}, s.input, s.city)}
        />
        <TextInput
          placeholder="Code postal"
          placeholderTextColor="#d3d3d3"
          value={zip || ""}
          keyboardType="numeric"
          onChangeText={setZip}
          style={Object.assign({}, s.input, s.zip)}
        />
      </View>
    </>
  )
}

export default ProfileScreen
