import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import Cameratest from './pages/Cameratest';
import Speech from './pages/Speech';
import Signup from './pages/Signup';
import Scantext from './pages/Scantext';
import Forgotpass from './pages/Forgotpass';

export type RootStackParamList = {
  Login: undefined;
  Cameratest: undefined;
  Speech:undefined;
  Signup: undefined;
  Scantext: { imagePath: string };
  Forgotpass: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Cameratest" component={Cameratest} />
        <Stack.Screen name="Speech" component={Speech} />
        <Stack.Screen name="Scantext" component={Scantext}/>
        <Stack.Screen name="Forgotpass" component={Forgotpass}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}