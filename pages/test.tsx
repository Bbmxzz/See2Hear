// //test

// import React from 'react';
// import { View, Text } from 'react-native';
// import DoubleClick from 'double-click-react-native';
// import Tts from 'react-native-tts';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../App';

// type HomeScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'testpage'
// >;
// type Props = {
//   navigation: HomeScreenNavigationProp;
// };


// const testpage = ({ navigation }: Props) => {
//     return (
//         <DoubleClick 
//             singleTap={() => {
//                 Tts.speak('hello test');
//                 console.log('single Tap');
//             }}
//             doubleTap={() => {
//                 navigation.navigate('Login');
//                 console.log('Double Tap');
//             }}
//             delay={300}
//             style={{ backgroundColor: 'blue', marginTop: 100, height: 25 }}>
//                 <Text style={{color: 'white'}}>Click</Text>
//         </DoubleClick>
//     );
// }

// export default testpage
