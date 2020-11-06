import React, {FC} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";

import {useTheme} from "./theme";
import {InitScreen} from "./init";
import {ShowProfilesScreen, InitPrimaryProfileScreen, EditSecondaryProfileScreen} from "./profile";
import {EditReasonsScreen} from "./reasons";
import {RenderPDFScreen} from "./pdf";
import {CertListScreen, CertListHeaderRight} from "./cert";

import "./error-handler";

const {Screen, Navigator} = createStackNavigator();

const App: FC = () => {
  const theme = useTheme();

  const getScreenOpts = (title: string, elevation = 3) => ({
    title,
    headerTintColor: theme.primaryTextColor,
    headerStyle: {backgroundColor: theme.headerBackgroundColor, elevation},
    headerRight: () => null,
  });

  return (
    <NavigationContainer>
      <Navigator initialRouteName="init">
        <Screen name="init" component={InitScreen} options={{header: () => null}} />
        <Screen
          name="list-certs"
          component={CertListScreen}
          options={{...getScreenOpts("Mes attestations"), headerRight: CertListHeaderRight}}
        />
        <Screen
          name="show-profiles"
          component={ShowProfilesScreen}
          options={getScreenOpts("Profils", 0)}
        />
        <Screen
          name="edit-secondary-profile"
          component={EditSecondaryProfileScreen}
          options={getScreenOpts("Profil secondaire")}
        />
        <Screen
          name="init-primary-profile"
          component={InitPrimaryProfileScreen}
          options={getScreenOpts("Bienvenue")}
        />
        <Screen
          name="edit-reasons"
          component={EditReasonsScreen}
          options={getScreenOpts("Nouvelle attestation")}
        />
        <Screen
          name="render-pdf"
          component={RenderPDFScreen}
          options={{...getScreenOpts("Attestation"), header: () => null}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default App;
