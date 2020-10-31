import React, {useEffect} from "react";
import {StyleSheet, View} from "react-native";
import {NavigationStackScreenComponent} from "react-navigation-stack";
import {combineLatest} from "rxjs";

import Loader from "./loader";
import {profile$, isProfileComplete} from "./profile";
import {pdf$} from "./pdf";

const s = StyleSheet.create({
  container: {flex: 1, height: "100%"},
});

const InitScreen: NavigationStackScreenComponent = props => {
  useEffect(() => {
    const sub = combineLatest(profile$, pdf$).subscribe(([profile, pdf]) => {
      if (!profile.isReady) return;
      if (!pdf.isReady) return;
      if (!isProfileComplete(profile)) return props.navigation.replace("ProfileInitScreen");

      props.navigation.replace("ReasonsScreen");
      pdf.isGenerated && props.navigation.push("PDFScreen");
    });

    return () => sub.unsubscribe();
  }, [props.navigation]);

  return (
    <View style={s.container}>
      <Loader />
    </View>
  );
};

InitScreen.navigationOptions = () => ({
  header: () => null,
});

export default InitScreen;
