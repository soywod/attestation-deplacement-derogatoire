import React, {FC} from "react";
import {ActivityIndicator, StyleSheet} from "react-native";

import {useTheme} from "./theme";
const Loader: FC = () => {
  const theme = useTheme();

  const s = StyleSheet.create({
    loader: {flex: 1},
  });

  return <ActivityIndicator animating color={theme.primaryColor} size="large" style={s.loader} />;
};

export default Loader;
