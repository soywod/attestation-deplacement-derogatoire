import React, {FC, useState} from "react";
import {Alert, Button, ScrollView, StyleSheet, Text, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";

import {useTheme} from "./theme";
import {ProfileForm, profile$, isProfileComplete} from "./profile";

const ProfileInitScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [profile, setProfile] = useState(profile$.value);

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    paragraph: {marginBottom: 10, color: theme.primaryTextColor},
    subParagraph: {marginBottom: 10, fontStyle: "italic", color: theme.secondaryTextColor},
    footer: {height: "auto", padding: 10},
  });

  function saveProfile() {
    if (!isProfileComplete(profile)) {
      return Alert.alert(
        "Profil incomplet",
        "Vous devez remplir tous les champs pour pouvoir générer une attestation de déplacement dérogatoire.",
        [{text: "OK"}],
        {cancelable: false},
      );
    }

    navigation.reset({index: 0, routes: [{name: "reasons"}]});
    profile$.next(profile);
    AsyncStorage.setItem("profile", JSON.stringify(profile));
  }

  return (
    <View style={s.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={s.content}>
        <Text style={s.paragraph}>
          Pour générer vos attestations de déplacement dérogatoire, veuillez saisir vos informations
          :
        </Text>
        <Text style={s.subParagraph}>
          Les données saisies sont stockées exclusivement sur votre téléphone, et ne servent qu'à
          générer les attestations. Aucune information n'est collectée ou revendue à des tiers.
        </Text>
        <ProfileForm onChange={setProfile} />
      </ScrollView>
      <View style={s.footer}>
        <Button title="Valider" onPress={saveProfile} color={theme.primaryColor} />
      </View>
    </View>
  );
};

export default ProfileInitScreen;
