import React, {FC, useEffect} from "react";
import {View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {combineLatest} from "rxjs";

import {Loader} from "./loader";
import {profile$, isProfileValid} from "./profile";
import {pdf$} from "./pdf";
import {useTheme} from "./theme";

export const InitScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    const sub = combineLatest(profile$, pdf$).subscribe(([profile, pdf]) => {
      if (!profile.isReady || !pdf.isReady) {
        return;
      }

      if (!isProfileValid(profile)) {
        return navigation.reset({index: 0, routes: [{name: "init-primary-profile"}]});
      }

      if (pdf.isGenerated) {
        return navigation.reset({index: 1, routes: [{name: "edit-reasons"}, {name: "render-pdf"}]});
      }

      return navigation.reset({index: 0, routes: [{name: "edit-reasons"}]});
    });

    return () => sub.unsubscribe();
  }, [navigation]);

  return (
    <View style={{flex: 1, height: "100%", backgroundColor: theme.backgroundColor}}>
      <Loader />
    </View>
  );
};
