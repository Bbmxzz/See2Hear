import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import Cameratest from './pages/Cameratest';
import Speech from './pages/Speech';
import Signup from './pages/Signup';
import Scantext from './pages/Scantext';
import Forgotpass from './pages/Forgotpass';
import Homepage from './pages/Homepage';
import ColorDetector from './pages/ColorDetector';
import Translate from './pages/Translate';
import QRScanner from './pages/QRScanner';
// import ImageLabelingScreen from './pages/ImageLabelingScreen';

export type RootStackParamList = {
  Login: undefined;
  Cameratest: { feature: 'Scantext'| 'ColorDetector' | 'QRScanner' };
  Speech:undefined;
  Signup: undefined;
  Scantext: { imagePath: string };
  Forgotpass: undefined;
  Homepage: undefined;
  ColorDetector: { imagePath: string };
  QRScanner: { imagePath: string };
  Translate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Cameratest" component={Cameratest} />
        <Stack.Screen name="Speech" component={Speech} />
        <Stack.Screen name="Scantext" component={Scantext} />
        <Stack.Screen name="Forgotpass" component={Forgotpass} />
        <Stack.Screen name="Homepage" component={Homepage}/>
        <Stack.Screen name="ColorDetector" component={ColorDetector}/>
        <Stack.Screen name="QRScanner" component={QRScanner}/>
        <Stack.Screen name="Translate" component={Translate}/>
        {/* <Stack.Screen name="ImageLabelingScreen" component={ImageLabelingScreen}/> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}