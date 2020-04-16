import React, {FC, useEffect, useRef} from "react"
import {useToggle} from "react-captain"
import {
  Button,
  GestureResponderEvent,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import {NavigationStackScreenComponent} from "react-navigation-stack"

export type ReasonKey =
  | "travail"
  | "courses"
  | "sante"
  | "famille"
  | "sport"
  | "judiciaire"
  | "missions"

export const reasonKeys: ReasonKey[] = [
  "travail",
  "courses",
  "sante",
  "famille",
  "sport",
  "judiciaire",
  "missions",
]

export let reasons: ReasonKey[]

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
      Déplacements entre le domicile et le lieu d’exercice de l’activité professionnelle, lorsqu'ils
      sont indispensables à l'exercice d’activités ne pouvant être organisées sous forme de
      télétravail ou déplacements professionnels ne pouvant être différés.
    </Text>
  ),
  courses: (
    <Text>
      Déplacements pour effectuer des achats de fournitures nécessaires à l’activité professionnelle
      et des achats de première nécessité dans des établissements dont les activités demeurent
      autorisées (liste sur{" "}
      <Text
        onPress={() =>
          Linking.openURL("https://www.service-public.fr/particuliers/actualites/A13921")
        }
        style={s.link}
      >
        gouvernement.fr
      </Text>
      )
    </Text>
  ),
  sante: (
    <Text>
      Consultations et soins ne pouvant être assurés à distance et ne pouvant être différés ;
      consultations et soins des patients atteints d'une affection de longue durée.
    </Text>
  ),
  famille: (
    <Text>
      Déplacements pour motif familial impérieux, pour l’assistance aux personnes vulnérables ou la
      garde d’enfants.
    </Text>
  ),
  sport: (
    <Text>
      Déplacements brefs, dans la limite d'une heure quotidienne et dans un rayon maximal d'un
      kilomètre autour du domicile, liés soit à l'activité physique individuelle des personnes, à
      l'exclusion de toute pratique sportive collective et de toute proximité avec d'autres
      personnes, soit à la promenade avec les seules personnes regroupées dans un même domicile,
      soit aux besoins des animaux de compagnie.
    </Text>
  ),
  judiciaire: <>Convocation judiciaire ou administrative.</>,
  missions: (
    <Text>
      Participation à des missions d’intérêt général sur demande de l’autorité administrative.
    </Text>
  ),
}

const ReasonsScreen: NavigationStackScreenComponent = props => {
  const reasonsMap = useRef<Partial<{[key in ReasonKey]: boolean}>>({})

  function nextStep() {
    reasons = reasonKeys.filter(key => reasonsMap.current[key])
    props.navigation.navigate("PDFScreen")
  }

  return (
    <View style={s.container}>
      <ScrollView style={s.content}>
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
