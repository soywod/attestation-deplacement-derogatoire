import React, {FC} from "react";
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";

import {useTheme} from "../theme";
import {PrimaryProfileTab} from "./primary";
import {SecondaryProfilesTab} from "./secondary";

const Tab = createMaterialTopTabNavigator();

export const ShowProfilesScreen: FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      backBehavior="none"
      tabBarOptions={{
        activeTintColor: theme.primaryTextColor,
        inactiveTintColor: theme.primaryTextColor,
        indicatorStyle: {
          backgroundColor: theme.primaryColor,
          height: 4,
        },
        style: {
          backgroundColor: theme.headerBackgroundColor,
        },
      }}
      sceneContainerStyle={{backgroundColor: theme.headerBackgroundColor}}
    >
      <Tab.Screen name="Principal" component={PrimaryProfileTab} />
      <Tab.Screen name="Secondaires" component={SecondaryProfilesTab} />
    </Tab.Navigator>
  );
};

export * from "./model";
export * from "./primary";
export * from "./secondary";
