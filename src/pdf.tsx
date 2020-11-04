import React, {FC, useEffect} from "react";
import {BehaviorSubject} from "rxjs";
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import {Route, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import QRCode from "react-native-qrcode-svg";
import Pdf from "react-native-pdf";
import InAppReview from "react-native-in-app-review";
import useObservable from "@soywod/react-use-observable";
import {DateTime} from "luxon";
import {PDFDocument, StandardFonts, PDFFont} from "pdf-lib";

import {DATE_FMT, TIME_FMT} from "./field/datetime";
import {Profile} from "./profile";
import {ReasonKey} from "./reasons";
import {Loader} from "./loader";
import {useTheme} from "./theme";

export type PDF =
  | {
      isReady: false;
    }
  | {
      isReady: true;
      isGenerated: false;
    }
  | {
      isReady: true;
      isGenerated: true;
      data: string;
    };

export const pdf$ = new BehaviorSubject<PDF>({isReady: false});

AsyncStorage.getItem("pdf").then(data =>
  pdf$.next(
    data
      ? {
          isReady: true,
          isGenerated: true,
          data,
        }
      : {
          isReady: true,
          isGenerated: false,
        },
  ),
);

function idealFontSize(
  font: PDFFont,
  text: string,
  maxWidth: number,
  minSize: number,
  defaultSize: number,
) {
  let currentSize = defaultSize;
  let textWidth = font.widthOfTextAtSize(text, defaultSize);

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize);
  }

  return textWidth > maxWidth ? null : currentSize;
}

async function generatePdf(
  profile: Profile,
  reasons: ReasonKey[],
  date: string,
  time: string,
  qrcode: string,
) {
  const {lastName, firstName, dateOfBirth, placeOfBirth, address, city, zip} = profile;
  const readFile = Platform.OS === "android" ? RNFS.readFileAssets : RNFS.readFile;
  const tplPath = Platform.OS === "android" ? "" : RNFS.MainBundlePath + "/";
  const existingPdfBytes = await readFile(tplPath + "template-v3.pdf", "base64");

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

  let locationSize = idealFontSize(font, city, 83, 7, 11);

  if (!locationSize) {
    console.warn(
      "Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. " +
        'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.',
    );
    locationSize = 7;
  }

  drawText(profile.city, 111, 175, locationSize);
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

type PDFScreenRouteParams = Route<
  "pdf",
  {
    profile: Profile;
    date: string;
    time: string;
    reasons: ReasonKey[];
  }
>;

export const RenderPDFScreen: FC = () => {
  const now = DateTime.local();
  const theme = useTheme();
  const {profile, date, time, reasons = []} = useRoute<PDFScreenRouteParams>().params || {};
  const [pdf] = useObservable(pdf$, pdf$.value);

  const s = StyleSheet.create({
    container: {
      height: "100%",
      flex: 1,
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
      height: Dimensions.get("window").height,
    },
  });

  function getQRCodeData() {
    return [
      `Cree le: ${now.toFormat(DATE_FMT)} a ${now.toFormat(TIME_FMT)}`,
      `Nom: ${profile.lastName}`,
      `Prenom: ${profile.firstName}`,
      `Naissance: ${DateTime.fromISO(profile.dateOfBirth).toFormat(DATE_FMT)} a ${
        profile.placeOfBirth
      }`,
      `Adresse: ${profile.address} ${profile.zip} ${profile.city}`,
      `Sortie: ${date} a ${time}`,
      `Motifs: ${reasons.join(", ")}`,
    ].join(";\n");
  }

  async function qrCodeDataURLHandler(qrCodeDataURL: string) {
    const qrCode = qrCodeDataURL.replace(/(\r\n|\n|\r)/gm, "");
    const data = await generatePdf(profile, reasons, date, time, qrCode);
    pdf$.next({isReady: true, isGenerated: true, data});
    AsyncStorage.setItem("pdf", data);
  }

  useEffect(() => {
    if (reasons.length > 0) {
      AsyncStorage.removeItem("pdf");
      pdf$.next({isReady: true, isGenerated: false});
    }
  }, [reasons.length]);

  useEffect(() => {
    if (pdf.isReady && pdf.isGenerated && InAppReview.isAvailable()) {
      InAppReview.RequestInAppReview();
    }
  }, [pdf]);

  return (
    <View style={s.container}>
      {pdf.isReady && pdf.isGenerated ? (
        <Pdf
          activityIndicator={<Loader />}
          source={{uri: "data:application/pdf;base64," + pdf.data}}
          style={s.pdf}
        />
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

export const RenderPDFScreenHeaderRight = () => {
  const theme = useTheme();

  const s = StyleSheet.create({
    text: {padding: 10, marginRight: 5, color: theme.primaryTextColor},
  });

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => pdf$.value.isReady && pdf$.value.isGenerated && download(pdf$.value.data)}
    >
      <Text style={s.text}>Télécharger</Text>
    </TouchableOpacity>
  );
};

async function download(data: string) {
  const path = await (() => {
    switch (Platform.OS) {
      case "ios":
        return downloadIOS(data);
      case "android":
        return downloadAndroid(data);
      default:
    }
  })();

  if (path) {
    FileViewer.open(path);
  }
}

async function downloadIOS(data: string) {
  const now = DateTime.local().toFormat("yyyy-MM-dd-HH-mm");
  const path = RNFS.DocumentDirectoryPath + `/attestation-${now}.pdf`;
  await RNFS.writeFile(path, data, "base64");
  return path;
}

async function downloadAndroid(data: string) {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const now = DateTime.local().toFormat("yyyy-MM-dd-HH-mm");
      const path = RNFS.DownloadDirectoryPath + `/attestation-${now}.pdf`;
      await RNFS.writeFile(path, data, "base64");
      ToastAndroid.show("Attestation téléchargée dans le dossier Download.", ToastAndroid.LONG);
      return path;
    }
  } catch (err) {
    ToastAndroid.show(err.message, ToastAndroid.SHORT);
  }
}
