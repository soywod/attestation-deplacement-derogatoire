import React, {FC} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";

import {useTheme} from "./theme";
import {InitScreen} from "./init";
import {ShowProfilesScreen, InitPrimaryProfileScreen, EditSecondaryProfileScreen} from "./profile";
import {EditReasonsScreen, EditReasonsScreenHeaderRight} from "./reasons";
import {RenderPDFScreen, RenderPDFScreenHeaderRight} from "./pdf";

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
          options={{
            ...getScreenOpts("Motifs"),
            headerRight: EditReasonsScreenHeaderRight,
          }}
        />
        <Screen
          name="render-pdf"
          component={RenderPDFScreen}
          options={{...getScreenOpts("Attestation"), headerRight: RenderPDFScreenHeaderRight}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default App;
