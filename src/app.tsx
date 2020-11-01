import React, {FC} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";

import {useTheme} from "./theme";
import InitScreen from "./init";
import ProfileScreen from "./profile";
import ProfileInitScreen from "./profile-init";
import ReasonsScreen, {ReasonsScreenHeaderRight} from "./reasons";
import PDFScreen, {PDFScreenHeaderRight} from "./pdf";

const {Screen, Navigator} = createStackNavigator();

const App: FC = () => {
  const theme = useTheme();

  const getScreenOpts = (title: string) => ({
    title,
    headerTintColor: theme.primaryTextColor,
    headerStyle: {backgroundColor: theme.headerBackgroundColor},
    headerRight: () => null,
  });

  return (
    <NavigationContainer>
      <Navigator initialRouteName="init">
        <Screen name="init" component={InitScreen} options={{header: () => null}} />
        <Screen name="profile" component={ProfileScreen} options={getScreenOpts("Profil")} />
        <Screen
          name="profile-init"
          component={ProfileInitScreen}
          options={getScreenOpts("Bienvenue")}
        />
        <Screen
          name="reasons"
          component={ReasonsScreen}
          options={{
            ...getScreenOpts("Motif(s)"),
            headerRight: ReasonsScreenHeaderRight,
          }}
        />
        <Screen
          name="pdf"
          component={PDFScreen}
          options={{...getScreenOpts("Attestation"), headerRight: PDFScreenHeaderRight}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default App;
