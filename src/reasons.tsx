import React, {FC, useRef, useState} from "react";
import {
  Alert,
  Button,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Route, useRoute, useNavigation} from "@react-navigation/native";
import {Picker} from "@react-native-picker/picker";
import useObservable from "@soywod/react-use-observable";
import {DateTime} from "luxon";

import {useTheme} from "./theme";
import {DateTimeField} from "./field/datetime";
import {profile$, profiles$, findProfileIndex} from "./profile";
import {Certificate, emptyCert} from "./cert";

export type ReasonKey =
  | "travail"
  | "sante"
  | "famille"
  | "handicap"
  | "convocation"
  | "missions"
  | "transits"
  | "animaux";

export const reasonKeys: ReasonKey[] = [
  "travail",
  "sante",
  "famille",
  "handicap",
  "convocation",
  "missions",
  "transits",
  "animaux",
];

type ReasonsMap = Partial<{[key in ReasonKey]: boolean}>;

const allReasons: {[key in ReasonKey]: JSX.Element} = {
  travail: (
    <Text>
      Déplacements entre le domicile et le lieu d’exercice de l’activité professionnelle ou le lieu
      d’enseignement et de formation, déplacements professionnels ne pouvant être différés.
    </Text>
  ),
  sante: (
    <Text>
      Déplacements pour des consultations et soins ne pouvant être assurés à distance et ne pouvant
      être différés ou pour l’achat de produits de santé.
    </Text>
  ),
  famille: (
    <Text>
      Déplacements pour motif familial impérieux, pour l’assistance aux personnes vulnérables ou
      précaires ou pour la garde d’enfants.
    </Text>
  ),
  handicap: (
    <Text>Déplacements des personnes en situation de handicap et de leur accompagnant.</Text>
  ),
  convocation: (
    <Text>Déplacements pour répondre à une convocation judiciaire ou administrative</Text>
  ),
  missions: (
    <Text>
      Déplacements pour participer à des missions d’intérêt général sur demande de l’autorité
      administrative.
    </Text>
  ),
  transits: (
    <Text>
      Déplacements liés à des transits ferroviaires ou aériens pour des déplacements de longues
      distances.
    </Text>
  ),
  animaux: (
    <Text>
      Déplacements brefs, dans un rayon maximal d’un kilomètre autour du domicile pour les besoins
      des animaux de compagnie.
    </Text>
  ),
};

type EditReasonsRouteParams = Route<"edit-reasons", {index: number; cert: Certificate}>;

export const EditReasonsScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const emptyCertRef = useRef(emptyCert());
  const {index: certIndex = -1, cert = emptyCertRef.current} =
    useRoute<EditReasonsRouteParams>().params || {};
  const [profiles] = useObservable(profiles$, profiles$.value);
  const [profile] = useObservable(profile$, profile$.value);
  const [profileIndex, setProfileIndex] = useState(findProfileIndex(profiles, cert.profile));
  const [date, setDate] = useState(DateTime.fromISO(cert.leaveAt));
  const [reasonsMap, setReasonsMap] = useState<ReasonsMap>(
    cert.reasons.reduce((map, cert) => ({...map, [cert]: true}), {}),
  );

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    footer: {height: "auto", padding: 10},
    button: {paddingVertical: 10},
    link: {color: "blue", textDecorationLine: "underline"},
    loader: {flex: 1},
    headerButton: {padding: 10, marginRight: 5},
    reason: {textTransform: "uppercase", fontWeight: "bold"},
    dateTimeContainer: {flexDirection: "row", marginBottom: 10},
    date: {flex: 1, marginRight: 5},
    time: {flex: 1, marginLeft: 5},
    pickerLabel: {
      color: theme.fieldLabelColor,
    },
    pickerContainer: {
      width: "100%",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.fieldBorderColor,
      backgroundColor: theme.fieldBackgroundColor,
      borderRadius: 4,
      fontSize: 14,
    },
    picker: {
      color: theme.primaryTextColor,
      fontSize: 14,
      height: 39,
    },
    pickerItem: {
      fontSize: 10,
      color: theme.primaryTextColor,
    },
  });

  function nextStep() {
    const reasons = reasonKeys.filter(key => reasonsMap[key]);

    if (reasons.length === 0) {
      return Alert.alert("Erreur", "Vous devez choisir au moins un motif.", [{text: "OK"}], {
        cancelable: true,
      });
    }

    function navigateToNextStep() {
      const nextCert = {
        profile: profileIndex === -1 ? profile : profiles[profileIndex],
        reasons,
        createdAt: cert.createdAt,
        leaveAt: date.toISO(),
      };

      navigation.reset({
        index: 1,
        routes: [
          {name: "list-certs"},
          {name: "render-pdf", params: {index: certIndex, cert: nextCert}},
        ],
      });
    }

    if (date < DateTime.fromISO(cert.createdAt)) {
      return Alert.alert(
        "Attention",
        "La date de sortie est inférieure à la date de création. Cela peut poser problème lors d'un contrôle. Continuer ?",
        [{text: "Non"}, {text: "Oui", onPress: navigateToNextStep}],
        {cancelable: true},
      );
    }

    navigateToNextStep();
  }

  return (
    <View style={s.container}>
      <ScrollView style={s.content}>
        <Text style={s.pickerLabel}>Profil</Text>
        <View style={s.pickerContainer}>
          <Picker
            mode="dialog"
            style={s.picker}
            itemStyle={s.pickerItem}
            selectedValue={profileIndex}
            onValueChange={index => setProfileIndex(Number(index))}
            dropdownIconColor={theme.primaryTextColor}
          >
            <Picker.Item label="Principal" value="-1" />
            {profiles.map((profile, index) => (
              <Picker.Item key={profile.label} label={profile.label} value={index} />
            ))}
          </Picker>
        </View>
        <View style={s.dateTimeContainer}>
          <DateTimeField
            type="date"
            label="Date de sortie"
            value={date}
            onChange={nextDate => {
              if (nextDate) {
                setDate(date.set({year: nextDate.year, month: nextDate.month, day: nextDate.day}));
              }
            }}
            style={s.date}
          />
          <DateTimeField
            type="time"
            label="Heure de sortie"
            value={date}
            onChange={nextDate => {
              if (nextDate) {
                setDate(date.set({hour: nextDate.hour, minute: nextDate.minute}));
              }
            }}
            style={s.time}
          />
        </View>
        {reasonKeys.map(key => (
          <Reason
            key={key}
            isOn={Boolean(reasonsMap[key])}
            onToggle={val => setReasonsMap(map => ({...map, [key]: val}))}
          >
            <Text style={s.reason}>{key.replace("_", "/")}</Text>
            {" - "}
            {allReasons[key]}
          </Reason>
        ))}
      </ScrollView>
      <View style={s.footer}>
        <Button title="Générer" onPress={nextStep} color={theme.primaryColor} />
      </View>
    </View>
  );
};

type ReasonProps = {
  isOn: boolean;
  onToggle: (val: boolean) => void;
};

const Reason: FC<ReasonProps> = ({isOn, onToggle: toggle, children}) => {
  const theme = useTheme();

  const s = StyleSheet.create({
    view: {display: "flex", flexDirection: "row", marginBottom: 10, paddingLeft: 5},
    switchView: {justifyContent: "center"},
    textView: {flex: 1, justifyContent: "center", paddingHorizontal: 10},
    text: {fontSize: 13, color: isOn ? theme.primaryTextColor : theme.switchLabelColor},
  });

  function handlePress(evt: GestureResponderEvent) {
    evt.preventDefault();
    toggle(!isOn);
  }

  return (
    <View style={s.view}>
      <View style={s.switchView}>
        <Switch
          value={isOn}
          onValueChange={toggle}
          trackColor={{true: "#ee98fb", false: theme.switchTrackColor}}
          thumbColor={isOn ? theme.primaryColor : theme.switchThumbColor}
        />
      </View>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={s.textView}>
        <Text style={s.text}>{children}</Text>
      </TouchableOpacity>
    </View>
  );
};
