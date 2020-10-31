import React, {FC} from "react";
import {ActivityIndicator, StyleSheet} from "react-native";

const s = StyleSheet.create({
  loader: {flex: 1},
});

const Loader: FC = () => {
  return <ActivityIndicator animating color="#333333" size="large" style={s.loader} />;
};

export default Loader;
