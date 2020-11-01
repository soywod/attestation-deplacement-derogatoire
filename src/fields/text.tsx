import React, {FC} from "react";
import {
  View,
  ViewStyle,
  Text,
  StyleSheet,
  StyleProp,
  TextInput,
  TextInputProps,
} from "react-native";

import {useTheme} from "../theme";

export type TextFieldProps = TextInputProps & {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const TextField: FC<TextFieldProps> = props => {
  const theme = useTheme();

  const s = StyleSheet.create({
    label: {
      color: theme.fieldLabelColor,
    },
    field: {
      opacity: 1,
      backgroundColor: theme.fieldBackgroundColor,
      marginBottom: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      color: theme.primaryTextColor,
      borderColor: theme.fieldBorderColor,
      borderRadius: 4,
    },
  });

  return (
    <View style={props.containerStyle}>
      {props.label && <Text style={s.label}>{props.label}</Text>}
      <TextInput
        {...props}
        value={props.value || ""}
        style={Object.assign({}, s.field, props.style)}
      />
    </View>
  );
};

export default TextField;
