import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Cameratest from './pages/Cameratest';
import Scantext from './pages/Scantext';
import Homepage from './pages/Homepage';
import ColorDetector from './pages/ColorDetector';
import Translate from './pages/Translate';
import RoboflowScreen from './pages/Roboflowscreen';

export type RootStackParamList = {
  Cameratest: { feature: 'Scantext'| 'ColorDetector' | 'Translate'| 'RoboflowScreen' };
  Scantext: { imagePath: string };
  Homepage: undefined;
  ColorDetector: { imagePath: string };
  Translate: { imagePath: string };
  RoboflowScreen: { imagePath: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Homepage" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Cameratest" component={Cameratest} />
        <Stack.Screen name="Scantext" component={Scantext} />
        <Stack.Screen name="Homepage" component={Homepage}/>
        <Stack.Screen name="ColorDetector" component={ColorDetector}/>
        <Stack.Screen name="Translate" component={Translate}/>
        <Stack.Screen name="RoboflowScreen" component={RoboflowScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}