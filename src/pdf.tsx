import React, {FC, useEffect, useState} from "react";
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import Share from "react-native-share";
import {Route, useRoute, useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import {Picker} from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFS from "react-native-fs";
/* import GooglePlayAvailability from "react-native-google-api-availability-bridge"; */
import QRCode from "react-native-qrcode-svg";
import Pdf from "react-native-pdf";
import InAppReview from "react-native-in-app-review";
import useObservable from "@soywod/react-use-observable";
import {Subject} from "rxjs";
import {DateTime} from "luxon";
import {PDFDocument, StandardFonts} from "pdf-lib";

import {DATE_FMT, TIME_FMT} from "./field/datetime";
import {Loader} from "./loader";
import {useTheme} from "./theme";
import {Certificate, emptyCert, certs$} from "./cert";

const actions$ = new Subject<string>();

async function generatePdf(cert: Certificate, qrcode: string) {
  const {profile, reasons} = cert;
  const {lastName, firstName, dateOfBirth, placeOfBirth, address, city, zip} = profile;
  const date = DateTime.fromISO(cert.leaveAt).toFormat(DATE_FMT);
  const time = DateTime.fromISO(cert.leaveAt).toFormat(TIME_FMT);
  const readFile = Platform.OS === "android" ? RNFS.readFileAssets : RNFS.readFile;
  const tplPath = Platform.OS === "android" ? "" : RNFS.MainBundlePath + "/";
  const existingPdfBytes = await readFile(tplPath + "certificate.pdf", "base64");

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page1 = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const drawText = (text: string, x: number, y: number, size = 11) => {
    page1.drawText(text, {x, y, size, font});
  };

  drawText(`${firstName} ${lastName}`, 107, 657);
  drawText(DateTime.fromISO(dateOfBirth).toFormat(DATE_FMT), 107, 627);
  drawText(placeOfBirth, 240, 627);
  drawText(`${address}, ${zip} ${city}`, 124, 596);

  reasons.includes("travail") && drawText("×", 57, 486, 20);
  reasons.includes("achats") && drawText("×", 57, 415, 20);
  reasons.includes("sante") && drawText("×", 57, 370, 20);
  reasons.includes("famille") && drawText("×", 57, 348, 20);
  reasons.includes("handicap") && drawText("×", 57, 315, 20);
  reasons.includes("sport_animaux") && drawText("×", 57, 292, 20);
  reasons.includes("convocation") && drawText("×", 57, 210, 20);
  reasons.includes("missions") && drawText("×", 57, 177, 20);
  reasons.includes("enfants") && drawText("×", 57, 155, 20);

  drawText(city, 93, 122);
  drawText(date, 76, 92);
  drawText(time, 246, 92);
  drawText(`${firstName} ${lastName}`, 120, 35);

  const qrImage = await pdfDoc.embedPng(qrcode);

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 140,
    y: 25,
    width: 120,
    height: 120,
  });

  pdfDoc.addPage();
  const page2 = pdfDoc.getPages()[1];
  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - page2.getWidth() + 50,
    width: page2.getWidth() - 100,
    height: page2.getWidth() - 100,
  });

  return await pdfDoc.saveAsBase64();
}

type PDFScreenRouteParams = Route<"pdf", {cert: Certificate; index: number}>;

export const RenderPDFScreen: FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {cert = emptyCert(), index: certIndex = 0} = useRoute<PDFScreenRouteParams>().params || {};
  const [certs] = useObservable(certs$, certs$.value);
  const [path, setPath] = useState(cert.path);
  const [isPathProceeded, processPath] = useState(false);

  useEffect(() => {
    const sub = actions$.subscribe(async action => {
      switch (action) {
        case "download": {
          if (!path) {
            return;
          }

          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              const date = DateTime.fromISO(cert.createdAt).toFormat("yyyy-MM-dd_HH-mm-ss");
              const downloadPath = `${RNFS.DownloadDirectoryPath}/attestation-${date}.pdf`;
              await RNFS.copyFile(path, downloadPath);
              Alert.alert(
                "Téléchargement réussi",
                "Attestation téléchargée dans le dossier de téléchargement par défaut de votre téléphone.\n\n" +
                  downloadPath,
                [{text: "OK"}],
                {cancelable: true},
              );
            } else {
              ToastAndroid.show("Permission refusée", ToastAndroid.SHORT);
            }
          } catch (err) {
            ToastAndroid.show(err.message, ToastAndroid.LONG);
          }

          break;
        }

        case "share": {
          Share.open({title: "Attestation de déplacement dérogatoire", url: `file://${cert.path}`});
          break;
        }

        case "duplicate": {
          const now = DateTime.local();
          const leaveAt = DateTime.fromISO(cert.leaveAt).set({
            year: now.year,
            month: now.month,
            day: now.day,
          });

          navigation.reset({
            index: 1,
            routes: [
              {name: "list-certs"},
              {
                name: "edit-reasons",
                params: {
                  index: certs.length,
                  cert: {
                    ...cert,
                    createdAt: now.toISO(),
                    leaveAt: leaveAt.toISO(),
                  },
                },
              },
            ],
          });

          break;
        }

        case "delete": {
          Alert.alert(
            "Attention",
            "Êtes-vous sûr de vouloir supprimer cette attestation ?",
            [
              {text: "Non"},
              {
                text: "Oui",
                onPress: () => {
                  const nextCerts = certs.filter((_, index) => index !== certIndex);
                  certs$.next(nextCerts);
                  AsyncStorage.setItem("certs", JSON.stringify(nextCerts));
                  cert.path && RNFS.unlink(cert.path).catch();
                  ToastAndroid.show("Attestation supprimée", ToastAndroid.SHORT);
                  navigation.goBack();
                },
              },
            ],
            {cancelable: true},
          );

          break;
        }

        default:
          break;
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [cert, cert.createdAt, cert.path, certIndex, certs, certs.length, navigation, path]);

  const s = StyleSheet.create({
    container: {
      height: "100%",
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: theme.backgroundColor,
    },
    qrcodeView: {
      width: 0,
      height: 0,
      flex: 0,
      opacity: 0,
    },
    pdf: {
      flex: 1,
      width: Dimensions.get("window").width,
    },
  });

  function getQRCodeData() {
    const createdAt = DateTime.fromISO(cert.createdAt);
    const leaveAt = DateTime.fromISO(cert.leaveAt);

    return [
      `Cree le: ${createdAt.toFormat(DATE_FMT)} a ${createdAt.toFormat(TIME_FMT)}`,
      `Nom: ${cert.profile.lastName}`,
      `Prenom: ${cert.profile.firstName}`,
      `Naissance: ${DateTime.fromISO(cert.profile.dateOfBirth).toFormat(DATE_FMT)} a ${
        cert.profile.placeOfBirth
      }`,
      `Adresse: ${cert.profile.address} ${cert.profile.zip} ${cert.profile.city}`,
      `Sortie: ${leaveAt.toFormat(DATE_FMT)} a ${leaveAt.toFormat(TIME_FMT)}`,
      `Motifs: ${cert.reasons.join(", ")}`,
    ].join(";\n");
  }

  async function qrCodeDataURLHandler(qrCodeDataURL: string) {
    const qrCode = qrCodeDataURL.replace(/(\r\n|\n|\r)/gm, "");
    const data = await generatePdf(cert, qrCode);
    const now = DateTime.fromISO(cert.createdAt).toFormat("yyyy-MM-dd_HH-mm-ss");
    const path = RNFS.DocumentDirectoryPath + `/attestation-${now}.pdf`;
    RNFS.writeFile(path, data, "base64");
    setPath(path);
  }

  useEffect(() => {
    if (!cert.path && path && !isPathProceeded) {
      cert.path = path;
      certs[certIndex] = cert;
      certs$.next([...certs]);
      AsyncStorage.setItem("certs", JSON.stringify(certs));
      processPath(true);

      try {
        if (InAppReview.isAvailable()) {
          InAppReview.RequestInAppReview();
        }
        /* GooglePlayAvailability.checkGooglePlayServices((status: string) => { */
        /*   switch (status) { */
        /*     case "success": */
        /*     case "update": { */
        /*       if (InAppReview.isAvailable()) { */
        /*         InAppReview.RequestInAppReview(); */
        /*       } */

        /*       break; */
        /*     } */

        /*     default: */
        /*       break; */
        /*   } */
        /* }); */
      } catch (err) {
        //
      }
    }
  }, [cert, certIndex, certs, isPathProceeded, path]);

  return (
    <View style={s.container}>
      {path ? (
        <Pdf activityIndicator={<Loader />} source={{uri: path}} style={s.pdf} spacing={1} />
      ) : (
        <View>
          <Loader />
          <View style={s.qrcodeView}>
            <QRCode
              ecl="L"
              getRef={svg => svg && svg.toDataURL(qrCodeDataURLHandler)}
              value={getQRCodeData()}
              size={512}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export const RenderPDFHeaderRight = () => {
  const theme = useTheme();

  const s = StyleSheet.create({
    container: {width: 50, height: 50},
    picker: {
      position: "absolute",
      width: 50,
      height: 50,
    },
    iconContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 50,
      justifyContent: "center",
      alignItems: "center",
      height: 50,
    },
    icon: {
      color: theme.primaryTextColor,
      fontSize: 25,
    },
  });

  return (
    <View style={s.container}>
      <Picker
        mode="dialog"
        prompt="Actions possibles :"
        selectedValue=""
        onValueChange={action => actions$.next(action.toString())}
        dropdownIconColor={theme.headerBackgroundColor}
        style={s.picker}
      >
        <Picker.Item label="" value="" />
        <Picker.Item label="Télécharger" value="download" />
        <Picker.Item label="Partager" value="share" />
        <Picker.Item label="Dupliquer" value="duplicate" />
        <Picker.Item label="Supprimer" value="delete" />
      </Picker>
      <View style={s.iconContainer}>
        <Icon name="dots-vertical" style={s.icon} />
      </View>
    </View>
  );
};
