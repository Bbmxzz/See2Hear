import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import Cameratest from './pages/Cameratest';
import Signup from './pages/Signup';
import Scantext from './pages/Scantext';
import Forgotpass from './pages/Forgotpass';
import Homepage from './pages/Homepage';
import ColorDetector from './pages/ColorDetector';
import Translate from './pages/Translate';
import QRScanner from './pages/QRScanner';
import Resetpass from './pages/Resetpass';
import RoboflowScreen from './pages/Pricetag';

export type RootStackParamList = {
  Login: undefined;
  Cameratest: { feature: 'Scantext'| 'ColorDetector' | 'QRScanner' | 'Translate' };
  Signup: undefined;
  Scantext: { imagePath: string };
  Forgotpass: undefined;
  Homepage: undefined;
  ColorDetector: { imagePath: string };
  QRScanner: { imagePath: string };
  Translate: { imagePath: string };
  Resetpass: { email: string };
  RoboflowScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Cameratest" component={Cameratest} />
        <Stack.Screen name="Scantext" component={Scantext} />
        <Stack.Screen name="Forgotpass" component={Forgotpass} />
        <Stack.Screen name="Homepage" component={Homepage}/>
        <Stack.Screen name="ColorDetector" component={ColorDetector}/>
        <Stack.Screen name="QRScanner" component={QRScanner}/>
        <Stack.Screen name="Translate" component={Translate}/>
        <Stack.Screen name="Resetpass" component={Resetpass}/>
        <Stack.Screen name="RoboflowScreen" component={RoboflowScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}