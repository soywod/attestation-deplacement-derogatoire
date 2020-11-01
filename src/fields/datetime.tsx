import React, {FC, useState} from "react";
import {Text, Button, Platform, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {DateTime} from "luxon";

import {useTheme} from "../theme";

export const DATE_FMT = "dd/MM/yyyy";
export const TIME_FMT = "HH'h'mm";

type DateTimeFieldProps = {
  type: "date" | "time";
  label?: string;
  value?: DateTime;
  onChange: (date?: DateTime) => void;
};

export const DateTimeField: FC<DateTimeFieldProps> = props => {
  const theme = useTheme();
  const format = props.type === "time" ? TIME_FMT : DATE_FMT;
  const textFieldValue = props.value ? props.value.toFormat(format) : "";
  const [isPickerVisible, setPickerVisible] = useState(false);

  const now = DateTime.local();
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
    <>
      <TouchableOpacity activeOpacity={0.75} onPress={() => setPickerVisible(!isPickerVisible)}>
        <View pointerEvents="none">
          {props.label && <Text style={s.label}>{props.label}</Text>}
          <TextInput value={textFieldValue} editable={false} style={s.field} />
        </View>
      </TouchableOpacity>
      {isPickerVisible && (
        <>
          <RNDateTimePicker
            mode={props.type}
            display="spinner"
            value={(props.value || now).toJSDate()}
            onChange={(_, date) => {
              Platform.OS === "android" && setPickerVisible(false);
              props.onChange(date ? DateTime.fromJSDate(date) : props.value);
            }}
          />
          {Platform.OS === "ios" && (
            <Button title="Valider" onPress={() => setPickerVisible(false)} />
          )}
        </>
      )}
    </>
  );
};

export default DateTimeField;
