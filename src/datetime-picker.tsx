import React, {FC, useRef, useState} from "react";
import {Button, Platform, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {DateTime} from "luxon";

export const DATE_FMT = "dd/MM/yyyy";
export const TIME_FMT = "HH'h'mm";

const s = StyleSheet.create({
  input: {
    opacity: 1,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    color: "#333333",
    borderColor: "#e8e8e8",
    borderRadius: 4,
  },
});

type DatetimeProps = {
  type: "date" | "time";
  defaultValue?: DateTime;
  placeholder?: string;
  onChange: (date?: DateTime) => void;
};

export const DateTimePicker: FC<DatetimeProps> = props => {
  const now = DateTime.local();
  const [dateTime, setDateTime] = useState(props.defaultValue);
  const dateTimeRef = useRef<TextInput | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const format = props.type === "date" ? DATE_FMT : TIME_FMT;

  return (
    <>
      <TouchableOpacity activeOpacity={0.75} onPress={() => setPickerVisible(!isPickerVisible)}>
        <View pointerEvents="none">
          <TextInput
            ref={dateTimeRef}
            placeholder={dateTime ? dateTime.toFormat(format) : props.placeholder}
            placeholderTextColor={dateTime ? "#333333" : "#d3d3d3"}
            style={s.input}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      {isPickerVisible && (
        <>
          <RNDateTimePicker
            mode={props.type}
            display="spinner"
            value={(dateTime || now).toJSDate()}
            onChange={(_, date) => {
              Platform.OS === "android" && setPickerVisible(false);
              setDateTime(date ? DateTime.fromJSDate(date) : undefined);
              props.onChange(date ? DateTime.fromJSDate(date) : undefined);
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

export default DateTimePicker;
