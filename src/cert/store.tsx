import AsyncStorage from "@react-native-community/async-storage";
import {BehaviorSubject} from "rxjs";

import {Certificate} from ".";

export const certs$ = new BehaviorSubject<Certificate[]>([]);

AsyncStorage.getItem("certs")
  .then(str => (str ? JSON.parse(str) : []))
  .then(certs => certs$.next(certs));
