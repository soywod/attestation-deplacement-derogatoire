import React, {FC, useEffect, useState} from "react";
import {StyleSheet, Platform, Linking, Text, ScrollView, View, Image} from "react-native";
import RNFS from "react-native-fs";

import {version} from "../../package.json";
import {useTheme} from "../theme";

export const ShowAboutScreen: FC = () => {
  const theme = useTheme();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  const s = StyleSheet.create({
    container: {backgroundColor: theme.backgroundColor, padding: 10},
    aboutContainer: {flexDirection: "row", alignItems: "center", marginBottom: 10},
    aboutAvatar: {width: 60, height: 60, borderRadius: 4, marginRight: 10},
    aboutText: {color: theme.primaryTextColor, flex: 1},
    title: {color: theme.primaryTextColor, fontSize: 20, marginBottom: 10},
    text: {color: theme.secondaryTextColor, marginBottom: 10},
    subtext: {color: theme.secondaryTextColor, marginBottom: 10, fontStyle: "italic"},
    row: {flexDirection: "row", alignItems: "center"},
    link: {color: theme.primaryColor, textDecorationLine: "underline", marginBottom: 10},
  });

  useEffect(() => {
    if (!avatar) {
      const readFile = Platform.OS === "android" ? RNFS.readFileAssets : RNFS.readFile;
      const bundlePath = Platform.OS === "android" ? "" : RNFS.MainBundlePath + "/";
      readFile(bundlePath + "soywod.jpeg", "base64").then(setAvatar);
    }
  }, [avatar]);

  return (
    <ScrollView style={s.container}>
      <View style={s.aboutContainer}>
        <Image
          width={60}
          height={60}
          source={{uri: "data:image/jpeg;base64," + avatar}}
          style={s.aboutAvatar}
        />
        <Text style={s.aboutText}>
          Application développée par Clément DOUIN, développeur web passionné, dans le but de rendre
          notre quotidien de confinés plus agréable.
        </Text>
      </View>
      <View style={s.row}>
        <Text
          style={{...s.link, marginRight: 10}}
          onPress={() => Linking.openURL("https://soywod.me")}
        >
          Accéder à mon portfolio
        </Text>
        <Text
          style={{...s.link, marginRight: 10}}
          onPress={() =>
            Linking.openURL(
              "mailto:clement.douin@posteo.net?subject=Attestation déplacement dérogatoire",
            )
          }
        >
          Me contacter
        </Text>
      </View>
      <Text style={s.title}>Le code source est-il accessible ?</Text>
      <Text style={s.text}>
        Le code source de cette application (tout comme l'appli web du gouvernement) est open
        source, sous licence MIT, et est accessible sur GitHub :
      </Text>
      <Text
        style={s.link}
        onPress={() =>
          Linking.openURL("https://github.com/soywod/attestation-deplacement-derogatoire")
        }
      >
        Accéder au code source
      </Text>
      <Text style={s.title}>Où sont stockés mes données ?</Text>
      <Text style={s.text}>
        Vos données personnelles restent dans la mémoire interne de votre téléphone. Elles sont
        utilisées uniquement pour générer les attestations. L'application fonctionne d'ailleurs hors
        ligne (le réseau n'est jamais utilisé).
      </Text>
      <Text
        style={s.link}
        onPress={() =>
          Linking.openURL(
            "https://github.com/soywod/attestation-deplacement-derogatoire/blob/master/privacy-policy.pdf",
          )
        }
      >
        Accéder au RGPD
      </Text>
      <Text style={s.title}>J'ai rencontré un bug ?</Text>
      <Text style={s.text}>
        Vous pouvez soit me contacter par mail, soit ouvrir une issue sur GitHub :
      </Text>
      <View style={s.row}>
        <Text
          style={{...s.link, marginRight: 10}}
          onPress={() =>
            Linking.openURL(
              "mailto:clement.douin@posteo.net?subject=Attestation de déplacement dérogatoire",
            )
          }
        >
          Me contacter
        </Text>
        <Text
          style={s.link}
          onPress={() =>
            Linking.openURL(
              "https://github.com/soywod/attestation-deplacement-derogatoire/issues/new",
            )
          }
        >
          Ouvrir une issue
        </Text>
      </View>
      <Text style={s.title}>J'ai une idée d'amélioration ?</Text>
      <Text style={s.text}>Vous pouvez ouvrir une issue sur GitHub :</Text>
      <Text
        style={s.link}
        onPress={() =>
          Linking.openURL(
            "https://github.com/soywod/attestation-deplacement-derogatoire/issues/new",
          )
        }
      >
        Ouvrir une issue
      </Text>
      <Text style={s.title}>Est-ce une app officielle ?</Text>
      <Text style={s.text}>
        Cette application ne provient pas du gouvernement. En revanche, elle se base sur le code
        source de l'application web du gouvernement qui est libre de droit, sous licence MIT.
        L'attestation générée est exactement la même que celle du gouvernement.
      </Text>
      <Text style={s.subtext}>
        Je tiens à préciser que cette application a pour simple but d'aider les gens. Aucun profit
        n'est réalisé. Je me dédouane donc de toute responsabilité en cas de problème avec les
        forces de l'ordre.
      </Text>
      <Text
        style={s.link}
        onPress={() =>
          Linking.openURL("https://github.com/LAB-MI/attestation-deplacement-derogatoire-q4-2020")
        }
      >
        Accéder au code source du gouvernement
      </Text>
    </ScrollView>
  );
};

export const AboutHeaderRight = () => {
  const theme = useTheme();

  const s = StyleSheet.create({
    text: {padding: 10, marginRight: 5, color: theme.secondaryTextColor},
  });

  return <Text style={s.text}>v{version}</Text>;
};
