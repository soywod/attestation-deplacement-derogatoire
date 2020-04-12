import React from "react"
import {StyleSheet, View} from "react-native"
import {NavigationStackScreenComponent} from "react-navigation-stack"
import {useBehaviorSubject} from "react-captain"

import {profile$, isProfileComplete} from "./profile"
import Loader from "./loader"

const s = StyleSheet.create({
  container: {flex: 1, height: "100%"},
})

const InitScreen: NavigationStackScreenComponent = props => {
  useBehaviorSubject(profile$, profile => {
    if (profile.isReady) {
      props.navigation.replace(isProfileComplete(profile) ? "ReasonsScreen" : "ProfileInitScreen")
    }
  })

  return (
    <View style={s.container}>
      <Loader />
    </View>
  )
}

InitScreen.navigationOptions = () => ({
  header: () => null,
})

export default InitScreen
