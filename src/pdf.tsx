import React, {useEffect, useState} from "react"
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native"
import {NavigationStackScreenComponent} from "react-navigation-stack"
import RNFS from "react-native-fs"
import FileViewer from "react-native-file-viewer"
import QRCode from "react-native-qrcode-svg"
import Pdf from "react-native-pdf"
import {useBehaviorSubject} from "react-captain"
import {DateTime} from "luxon"
import {PDFDocument, StandardFonts, PDFFont} from "pdf-lib"

import {Profile, profile$} from "./profile"
import {ReasonKey, reasons} from "./reasons"
import Loader from "./loader"

const DATE_FMT = "dd/MM/yyyy"
const TIME_FMT = "HH'h'mm"

let lastPdf: string

function idealFontSize(
  font: PDFFont,
  text: string,
  maxWidth: number,
  minSize: number,
  defaultSize: number,
) {
  let currentSize = defaultSize
  let textWidth = font.widthOfTextAtSize(text, defaultSize)

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize)
  }

  return textWidth > maxWidth ? null : currentSize
}

async function generatePdf(profile: Profile, reasons: ReasonKey[], qrcode: string) {
  const now = DateTime.local()
  const {lastName, firstName, dateOfBirth, placeOfBirth, address, city, zip} = profile
  const readFile = Platform.OS === "android" ? RNFS.readFileAssets : RNFS.readFile
  const tplPath = Platform.OS === "android" ? "" : RNFS.MainBundlePath + "/"
  const existingPdfBytes = await readFile(tplPath + "template.pdf", "base64")

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const page1 = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawText = (text: string, x: number, y: number, size = 11) => {
    page1.drawText(text, {x, y, size, font})
  }

  drawText(`${firstName} ${lastName}`, 135, 685)
  drawText(DateTime.fromISO(dateOfBirth).toFormat(DATE_FMT), 135, 661)
  drawText(placeOfBirth, 135, 637)
  drawText(`${address}, ${zip} ${city}`, 135, 612)

  reasons.includes("travail") && drawText("×", 76, 527, 19)
  reasons.includes("courses") && drawText("×", 76, 477, 19)
  reasons.includes("sante") && drawText("×", 76, 436, 19)
  reasons.includes("famille") && drawText("×", 76, 400, 19)
  reasons.includes("sport") && drawText("×", 76, 344, 19)
  reasons.includes("judiciaire") && drawText("×", 76, 297, 19)
  reasons.includes("missions") && drawText("×", 76, 261, 19)

  let locationSize = idealFontSize(font, city, 83, 7, 11)

  if (!locationSize) {
    console.warn(
      "Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. " +
        'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.',
    )
    locationSize = 7
  }

  drawText(profile.city, 111, 225, locationSize)

  drawText(`${now.toFormat(DATE_FMT)}`, 92, 201)
  drawText(now.toFormat(TIME_FMT), 200, 201)
  drawText("Date de création:", 464, 150, 7)
  drawText(`${now.toFormat(DATE_FMT)} à ${now.toFormat(TIME_FMT)}`, 455, 144, 7)

  const qrImage = await pdfDoc.embedPng(qrcode)

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 160,
    y: 165,
    width: 80,
    height: 80,
  })

  pdfDoc.addPage()
  const page2 = pdfDoc.getPages()[1]
  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - 350,
    width: 300,
    height: 300,
  })

  return await pdfDoc.saveAsBase64()
}

const s = StyleSheet.create({
  container: {
    height: "100%",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
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
  loader: {
    flex: 1,
  },
  headerButton: {padding: 10, marginRight: 5},
})

const PDFScreen: NavigationStackScreenComponent = () => {
  const [profile] = useBehaviorSubject(profile$)
  const [pdf, setPdf] = useState<string | null>(null)
  const now = DateTime.local()
  const qrCodeData = [
    `Cree le: ${now.toFormat(DATE_FMT)} a ${now.toFormat(TIME_FMT)}`,
    `Nom: ${profile.lastName}`,
    `Prenom: ${profile.firstName}`,
    `Naissance: ${DateTime.fromISO(profile.dateOfBirth).toFormat(DATE_FMT)} a ${
      profile.placeOfBirth
    }`,
    `Adresse: ${profile.address} ${profile.zip} ${profile.city}`,
    `Sortie: ${now.toFormat(DATE_FMT)} a ${now.toFormat(TIME_FMT)}`,
    `Motifs: ${reasons.join(" ")}`,
  ].join("; ")

  function qrCodeDataURLHandler(qrCodeDataURL: string) {
    generatePdf(profile, reasons, qrCodeDataURL.replace(/(\r\n|\n|\r)/gm, "")).then(pdf => {
      setPdf(pdf)
      lastPdf = pdf
    })
  }

  useEffect(() => {
    lastPdf = ""
  }, [])

  return (
    <View style={s.container}>
      {pdf ? (
        <Pdf
          activityIndicator={<Loader />}
          source={{uri: "data:application/pdf;base64," + pdf}}
          style={s.pdf}
        />
      ) : (
        <View>
          <Loader />
          <View style={s.qrcodeView}>
            <QRCode
              ecl="L"
              getRef={svg => svg && svg.toDataURL(qrCodeDataURLHandler)}
              value={qrCodeData}
            />
          </View>
        </View>
      )}
    </View>
  )
}

PDFScreen.navigationOptions = () => ({
  title: "Attestation",
  headerRight: () => (
    <TouchableOpacity activeOpacity={0.5} onPress={() => lastPdf && download(lastPdf)}>
      <Text style={s.headerButton}>Télécharger</Text>
    </TouchableOpacity>
  ),
})

async function download(data: string) {
  const path = await (() => {
    switch (Platform.OS) {
      case "ios":
        return downloadIOS(data)
      case "android":
        return downloadAndroid(data)
      default:
    }
  })()

  if (path) {
    FileViewer.open(path)
  }
}

async function downloadIOS(data: string) {
  const path = RNFS.DocumentDirectoryPath + "/attestation-deplacement-derogatoire.pdf"
  await RNFS.writeFile(path, data, "base64")
  return path
}

async function downloadAndroid(data: string) {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    )

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const path = RNFS.DownloadDirectoryPath + "/attestation-deplacement-derogatoire.pdf"
      await RNFS.writeFile(path, data, "base64")
      ToastAndroid.show("Attestation téléchargée dans le dossier Download.", ToastAndroid.SHORT)
      return path
    }
  } catch (err) {
    ToastAndroid.show(err.message, ToastAndroid.SHORT)
  }
}

export default PDFScreen
