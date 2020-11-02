import React, {FC} from "react";
import {ActivityIndicator} from "react-native";

import {useTheme} from "./theme";

export const Loader: FC = () => {
  const theme = useTheme();

  return <ActivityIndicator animating color={theme.primaryColor} size="large" style={{flex: 1}} />;
};
