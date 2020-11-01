import React, {FC, useEffect} from "react";
import {StyleSheet, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {combineLatest} from "rxjs";

import Loader from "./loader";
import {profile$, isProfileComplete} from "./profile";
import {pdf$} from "./pdf";
import {useTheme} from "./theme";

const InitScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const s = StyleSheet.create({
    container: {flex: 1, height: "100%", backgroundColor: theme.backgroundColor},
  });

  useEffect(() => {
    const sub = combineLatest(profile$, pdf$).subscribe(([profile, pdf]) => {
      if (!profile.isReady || !pdf.isReady) {
        return;
      }

      if (!isProfileComplete(profile)) {
        return navigation.reset({index: 0, routes: [{name: "profile-init"}]});
      }

      if (pdf.isGenerated) {
        return navigation.reset({index: 1, routes: [{name: "reasons"}, {name: "pdf"}]});
      }

      return navigation.reset({index: 0, routes: [{name: "reasons"}]});
    });

    return () => sub.unsubscribe();
  }, [navigation]);

  return (
    <View style={s.container}>
      <Loader />
    </View>
  );
};

export default InitScreen;
