import React, {FC, useEffect, useState} from "react";
import {Alert, Button, Dimensions, Platform, StyleSheet, ToastAndroid, View} from "react-native";
import Share from "react-native-share";
import {Route, useRoute, useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import RNFS from "react-native-fs";
import QRCode from "react-native-qrcode-svg";
import Pdf from "react-native-pdf";
import InAppReview from "react-native-in-app-review";
import useObservable from "@soywod/react-use-observable";
import {DateTime} from "luxon";
import {PDFDocument, StandardFonts} from "pdf-lib";

import {DATE_FMT, TIME_FMT} from "./field/datetime";
import {Loader} from "./loader";
import {useTheme} from "./theme";
import {Certificate, emptyCert, certs$} from "./cert";

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

  drawText(`${firstName} ${lastName}`, 135, 696);
  drawText(DateTime.fromISO(dateOfBirth).toFormat(DATE_FMT), 135, 674);
  drawText(placeOfBirth, 320, 674);
  drawText(`${address}, ${zip} ${city}`, 135, 652);

  reasons.includes("travail") && drawText("×", 77, 577, 20);
  reasons.includes("achats") && drawText("×", 77, 532, 20);
  reasons.includes("sante") && drawText("×", 77, 476, 20);
  reasons.includes("famille") && drawText("×", 77, 435, 20);
  reasons.includes("handicap") && drawText("×", 77, 394, 20);
  reasons.includes("sport_animaux") && drawText("×", 77, 356, 20);
  reasons.includes("convocation") && drawText("×", 77, 293, 20);
  reasons.includes("missions") && drawText("×", 77, 254, 20);
  reasons.includes("enfants") && drawText("×", 77, 209, 20);

  drawText(city, 111, 175);
  drawText(date, 111, 153);
  drawText(time, 275, 153);
  drawText(`${firstName} ${lastName}`, 130, 119);

  const qrImage = await pdfDoc.embedPng(qrcode);

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 160,
    y: 115,
    width: 80,
    height: 80,
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

  const s = StyleSheet.create({
    container: {
      height: "100%",
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: theme.backgroundColor,
    },
    content: {flex: 1},
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
    footer: {height: "auto", padding: 10, flexDirection: "row", backgroundColor: "#ffffff"},
    footerLeftButton: {flex: 1, marginRight: 5},
    footerMiddleButton: {flex: 1, marginHorizontal: 5},
    footerRightButton: {flex: 1, marginLeft: 5},
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

      NetInfo.fetch().then(state => {
        if (state.isConnected && InAppReview.isAvailable()) {
          InAppReview.RequestInAppReview();
        }
      });
    }
  }, [cert, certIndex, certs, isPathProceeded, path]);

  function deleteCert() {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette attestation ?",
      [
        {
          text: "Non",
        },
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
      {
        cancelable: true,
      },
    );
  }

  async function duplicateCert() {
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
              leaveAt: leaveAt.toISO(),
            },
          },
        },
      ],
    });
  }

  async function shareCert() {
    if (!cert.path) return;
    Share.open({title: "Attestation de déplacement dérogatoire", url: `file://${cert.path}`});
  }

  return (
    <View style={s.container}>
      {path ? (
        <View style={s.content}>
          <Pdf activityIndicator={<Loader />} source={{uri: path}} style={s.pdf} spacing={1} />
          <View style={s.footer}>
            <View style={s.footerLeftButton}>
              <Button title="Supprimer" color={theme.dangerColor} onPress={deleteCert} />
            </View>
            <View style={s.footerMiddleButton}>
              <Button title="Dupliquer" color={theme.secondaryColor} onPress={duplicateCert} />
            </View>
            <View style={s.footerRightButton}>
              <Button title="Partager" color={theme.primaryColor} onPress={shareCert} />
            </View>
          </View>
        </View>
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
