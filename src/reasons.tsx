import React, {FC, useEffect, useRef, useState} from "react";
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
import {useNavigation} from "@react-navigation/native";
import {Picker} from "@react-native-picker/picker";
import useObservable from "@soywod/react-use-observable";
import {DateTime} from "luxon";

import {useTheme} from "./theme";
import DateTimeField, {DATE_FMT, TIME_FMT} from "./fields/datetime";
import {profile$, profiles$} from "./profiles";

export type ReasonKey =
  | "travail"
  | "achats"
  | "sante"
  | "famille"
  | "handicap"
  | "sport_animaux"
  | "convocation"
  | "missions"
  | "enfants";

export const reasonKeys: ReasonKey[] = [
  "travail",
  "achats",
  "sante",
  "famille",
  "handicap",
  "sport_animaux",
  "convocation",
  "missions",
  "enfants",
];

const allReasons: {[key in ReasonKey]: JSX.Element} = {
  travail: (
    <Text>
      Déplacements entre le domicile et le lieu d’exercice de l’activité professionnelle ou un
      établissement d’enseignement ou de formation, déplacements professionnels ne pouvant être
      différés, déplacements pour un concours ou un examen.
    </Text>
  ),
  achats: (
    <Text>
      Déplacements pour effectuer des achats de fournitures nécessaires à l'activité
      professionnelle, des achats de première nécessité dans des établissements dont les activités
      demeurent autorisées, le retrait de commande et les livraisons à domicile.
    </Text>
  ),
  sante: (
    <Text>
      Consultations, examens et soins ne pouvant être ni assurés à distance ni différés et l’achat
      de médicaments.
    </Text>
  ),
  famille: (
    <Text>
      Déplacements pour motif familial impérieux, pour l'assistance aux personnes vulnérables et
      précaires ou la garde d'enfants.
    </Text>
  ),
  handicap: <Text>Déplacement des personnes en situation de handicap et leur accompagnant.</Text>,
  // eslint-disable-next-line @typescript-eslint/camelcase
  sport_animaux: (
    <Text>
      Déplacements brefs, dans la limite d'une heure quotidienne et dans un rayon maximal d'un
      kilomètre autour du domicile, liés soit à l'activité physique individuelle des personnes, à
      l'exclusion de toute pratique sportive collective et de toute proximité avec d'autres
      personnes, soit à la promenade avec les seules personnes regroupées dans un même domicile,
      soit aux besoins des animaux de compagnie.
    </Text>
  ),
  convocation: (
    <>Convocation judiciaire ou administrative et pour se rendre dans un service public.</>
  ),
  missions: (
    <Text>
      Participation à des missions d'intérêt général sur demande de l'autorité administrative.
    </Text>
  ),
  enfants: (
    <Text>
      Déplacement pour chercher les enfants à l’école et à l’occasion de leurs activités
      périscolaires.
    </Text>
  ),
};

export const EditReasonsScreen: FC = () => {
  const now = DateTime.local();
  const theme = useTheme();
  const navigation = useNavigation();
  const [profiles] = useObservable(profiles$, profiles$.value);
  const [profile] = useObservable(profile$, profile$.value);
  const [profileIndex, setProfileIndex] = useState(-1);
  const [date, setDate] = useState(now);
  const [time, setTime] = useState(now);
  const reasonsMap = useRef<Partial<{[key in ReasonKey]: boolean}>>({});

  const s = StyleSheet.create({
    container: {height: "100%", backgroundColor: theme.backgroundColor},
    content: {flex: 1, padding: 10},
    footer: {height: "auto", padding: 10},
    button: {paddingVertical: 10},
    link: {color: "blue", textDecorationLine: "underline"},
    loader: {flex: 1},
    headerButton: {padding: 10, marginRight: 5},
    reason: {textTransform: "uppercase", fontWeight: "bold"},
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
    const reasons = reasonKeys.filter(key => reasonsMap.current[key]);
    if (reasons.length === 0) {
      return Alert.alert("Erreur", "Vous devez choisir au moins un motif.", [{text: "OK"}], {
        cancelable: false,
      });
    }

    navigation.navigate("render-pdf", {
      profile: profileIndex === -1 ? profile : profiles[profileIndex],
      date: date.toFormat(DATE_FMT),
      time: time.toFormat(TIME_FMT),
      reasons,
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setProfileIndex(-1);
      setDate(now);
      setTime(now);
      reasonsMap.current = {};
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, now]);

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
          >
            <Picker.Item label="Principal" value="-1" />
            {profiles.map((profile, index) => (
              <Picker.Item key={profile.label} label={profile.label} value={index} />
            ))}
          </Picker>
        </View>
        <DateTimeField
          type="date"
          label="Date de sortie"
          value={date}
          onChange={d => setDate(d || date)}
        />
        <DateTimeField
          type="time"
          label="Heure de sortie"
          value={time}
          onChange={t => setTime(t || time)}
        />
        {reasonKeys.map(key => (
          <Reason key={key} onToggle={val => (reasonsMap.current[key] = val)}>
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
  onToggle: (val: boolean) => void;
};

const Reason: FC<ReasonProps> = props => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isOn, toggle] = useState(false);

  const s = StyleSheet.create({
    view: {display: "flex", flexDirection: "row", marginBottom: 10, paddingLeft: 5},
    switchView: {justifyContent: "center"},
    textView: {flex: 1, justifyContent: "center", paddingHorizontal: 10},
    text: {fontSize: 13, color: isOn ? theme.primaryTextColor : theme.switchLabelColor},
  });

  useEffect(() => {
    props.onToggle(isOn);
  }, [isOn, props]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      toggle(false);
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

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
      <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={s.textView}>
        <Text style={s.text}>{props.children}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const EditReasonsScreenHeaderRight = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  const s = StyleSheet.create({
    text: {padding: 10, marginRight: 5, color: theme.primaryTextColor},
  });

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate("show-profiles")}>
      <Text style={s.text}>Profils</Text>
    </TouchableOpacity>
  );
};
