import {Alert} from "react-native";
import {setJSExceptionHandler, setNativeExceptionHandler} from "react-native-exception-handler";

setJSExceptionHandler((err, isFatal) => {
  Alert.alert(
    isFatal ? "Erreur critique" : "Erreur",
    `${err.name} : ${err.message}`,
    [{text: "OK"}],
    {cancelable: false},
  );
});

setNativeExceptionHandler(err => console.error(err), true, true);
