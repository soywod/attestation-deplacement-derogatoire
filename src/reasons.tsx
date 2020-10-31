import React, {FC, useEffect, useRef} from "react"
import {useToggle} from "react-captain"
import {
  Button,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import {NavigationStackScreenComponent} from "react-navigation-stack"
import {DateTime} from "luxon"

import DateTimePicker, {DATE_FMT, TIME_FMT} from "./datetime-picker"

export type ReasonKey =
  | "travail"
  | "achats"
  | "sante"
  | "famille"
  | "handicap"
  | "sport_animaux"
  | "convocation"
  | "missions"
  | "enfants"

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
]

export let reasons: ReasonKey[] = []
export let dateStr: string
export let timeStr: string

const s = StyleSheet.create({
  container: {height: "100%"},
  content: {flex: 1, padding: 10},
  footer: {height: "auto", padding: 10},
  button: {paddingVertical: 10},
  reason: {display: "flex", flexDirection: "row", marginBottom: 10, paddingLeft: 5},
  reasonSwitchView: {justifyContent: "center"},
  reasonTextView: {flex: 1, justifyContent: "center", paddingHorizontal: 10},
  reasonText: {fontSize: 13, color: "#333333"},
  link: {color: "blue", textDecorationLine: "underline"},
  loader: {flex: 1},
  headerButton: {padding: 10, marginRight: 5},
})

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
}

const ReasonsScreen: NavigationStackScreenComponent = props => {
  const reasonsMap = useRef<Partial<{[key in ReasonKey]: boolean}>>({})

  function nextStep() {
    const now = DateTime.local()
    reasons = reasonKeys.filter(key => reasonsMap.current[key])
    dateStr = dateStr || now.toFormat(DATE_FMT)
    timeStr = timeStr || now.toFormat(TIME_FMT)
    props.navigation.navigate("PDFScreen", {reset: true})
  }

  function setDateStr(date?: DateTime) {
    dateStr = (date || DateTime.local()).toFormat(DATE_FMT)
  }

  function setTimeStr(date?: DateTime) {
    timeStr = (date || DateTime.local()).toFormat(TIME_FMT)
  }

  return (
    <View style={s.container}>
      <ScrollView style={s.content}>
        <DateTimePicker
          type="date"
          placeholder={`Date de sortie (${DateTime.local().toFormat(DATE_FMT)})`}
          onChange={setDateStr}
        />
        <DateTimePicker
          type="time"
          placeholder={`Heure de sortie (${DateTime.local().toFormat(TIME_FMT)})`}
          onChange={setTimeStr}
        />
        {reasonKeys.map(key => (
          <Reason key={key} onToggle={val => (reasonsMap.current[key] = val)}>
            {allReasons[key]}
          </Reason>
        ))}
      </ScrollView>
      <View style={s.footer}>
        <Button title="Suivant" onPress={nextStep} />
      </View>
    </View>
  )
}

type ReasonProps = {
  onToggle: (val: boolean) => void
}

const Reason: FC<ReasonProps> = props => {
  const [isOn, toggle] = useToggle()

  useEffect(() => {
    props.onToggle(isOn)
  }, [isOn, props])

  function handlePress(evt: GestureResponderEvent) {
    evt.preventDefault()
    toggle()
  }

  return (
    <View style={s.reason}>
      <View style={s.reasonSwitchView}>
        <Switch value={isOn} onValueChange={toggle} />
      </View>
      <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={s.reasonTextView}>
        <Text style={s.reasonText}>{props.children}</Text>
      </TouchableOpacity>
    </View>
  )
}

ReasonsScreen.navigationOptions = props => ({
  title: "Motif(s)",
  headerRight: () => (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => props.navigation.navigate("ProfileScreen")}
    >
      <Text style={s.headerButton}>Profil</Text>
    </TouchableOpacity>
  ),
})

export default ReasonsScreen
