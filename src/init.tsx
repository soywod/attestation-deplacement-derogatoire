import React, {FC, useEffect} from "react";
import {View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {combineLatest} from "rxjs";

import {useTheme} from "./theme";
import {Loader} from "./loader";
import {profile$, isProfileValid} from "./profile";

export const InitScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    const sub = combineLatest(profile$).subscribe(([profile]) => {
      if (!profile.isReady) {
        return;
      }

      if (!isProfileValid(profile)) {
        return navigation.reset({index: 0, routes: [{name: "init-primary-profile"}]});
      }

      return navigation.reset({index: 0, routes: [{name: "list-certs"}]});
    });

    return () => {
      sub.unsubscribe();
    };
  }, [navigation]);

  return (
    <View style={{flex: 1, height: "100%", backgroundColor: theme.backgroundColor}}>
      <Loader />
    </View>
  );
};
