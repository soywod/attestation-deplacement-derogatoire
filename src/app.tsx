import {createAppContainer} from "react-navigation"
import {createStackNavigator} from "react-navigation-stack"

import InitScreen from "./init"
import ProfileScreen from "./profile"
import ProfileInitScreen from "./profile-init"
import ReasonsScreen from "./reasons"
import PDFScreen from "./pdf"

const App = createStackNavigator(
  {
    InitScreen: {screen: InitScreen},
    ProfileScreen: {screen: ProfileScreen},
    ProfileInitScreen: {screen: ProfileInitScreen},
    ReasonsScreen: {screen: ReasonsScreen},
    PDFScreen: {screen: PDFScreen},
  },
  {initialRouteKey: "InitScreen"},
)

export default createAppContainer(App)
