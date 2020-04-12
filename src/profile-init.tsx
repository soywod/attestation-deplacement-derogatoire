import React, {useState} from "react"
import {Alert, Button, ScrollView, StyleSheet, Text, View} from "react-native"
import {NavigationStackScreenComponent} from "react-navigation-stack"
import AsyncStorage from "@react-native-community/async-storage"

import {ProfileForm, profile$, isProfileComplete} from "./profile"

const s = StyleSheet.create({
  container: {height: "100%"},
  content: {flex: 1, padding: 10},
  paragraph: {marginBottom: 10},
  subParagraph: {marginBottom: 20, opacity: 0.25, fontStyle: "italic"},
  footer: {height: "auto", padding: 10},
})

const ProfileInitScreen: NavigationStackScreenComponent = props => {
  const [profile, setProfile] = useState(profile$.value)

  function saveProfile() {
    if (!isProfileComplete(profile)) {
      return Alert.alert(
        "Profil incomplet",
        "Vous devez remplir tous les champs pour pouvoir générer une attestation de déplacement dérogatoire.",
        [{text: "OK"}],
        {cancelable: false},
      )
    }

    props.navigation.replace("ReasonsScreen")
    profile$.next(profile)
    AsyncStorage.setItem("profile", JSON.stringify(profile))
  }

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <Text style={s.paragraph}>
          Pour générer votre attestation de déplacement dérogatoire, veuillez saisir vos
          informations :
        </Text>
        <Text style={s.subParagraph}>
          Les données saisies sont stockées exclusivement sur votre téléphone, et ne servent qu'à
          générer l'attestation. Aucune information n'est collectée ou revendue à des tiers.
        </Text>
        <ProfileForm onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        <Button title="Suivant" onPress={saveProfile} />
      </View>
    </View>
  )
}

ProfileInitScreen.navigationOptions = () => ({
  title: "Bienvenue",
})

export default ProfileInitScreen
