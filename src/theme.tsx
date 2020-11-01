import {useColorScheme} from "react-native";

export type UseTheme = {
  primaryTextColor: string;
  secondaryTextColor: string;
  backgroundColor: string;
  headerBackgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  switchThumbColor: string;
  switchTrackColor: string;
  switchLabelColor: string;
  fieldLabelColor: string;
  fieldBackgroundColor: string;
  fieldBorderColor: string;
};

export function useTheme(): UseTheme {
  const scheme = useColorScheme();

  switch (scheme) {
    case "dark":
      return {
        backgroundColor: "#121212",
        headerBackgroundColor: "#1d1d1d",
        primaryTextColor: "#dfdfdf",
        secondaryTextColor: "#999999",
        primaryColor: "#7e57c2",
        secondaryColor: "#26a69a",
        switchThumbColor: "#484848",
        switchTrackColor: "#999999",
        switchLabelColor: "#999999",
        fieldLabelColor: "#484848",
        fieldBackgroundColor: "#121212",
        fieldBorderColor: "#242424",
      };

    case "light":
    default:
      return {
        backgroundColor: "#f3f3f3",
        headerBackgroundColor: "#ffffff",
        primaryTextColor: "#333333",
        secondaryTextColor: "#bfbfbf",
        primaryColor: "#7e57c2",
        secondaryColor: "#26a69a",
        switchThumbColor: "#ffffff",
        switchTrackColor: "#d3d3d3",
        switchLabelColor: "#888888",
        fieldLabelColor: "#999999",
        fieldBackgroundColor: "#ffffff",
        fieldBorderColor: "#e3e3e3",
      };
  }
}
