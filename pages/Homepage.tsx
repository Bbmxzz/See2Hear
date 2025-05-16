import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Homepage'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function Homepage({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.feature}
          onPress={() => navigation.navigate('Cameratest', { feature: 'Scantext' })}
        >
          <Icon name="search" size={28} color="#FBF8EF" />
          <Text style={styles.textFeature}>Scan Text</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.feature}
          onPress={() => navigation.navigate('Cameratest', { feature: 'ColorDetector' })}
        >
          <Icon name="palette" size={28} color="#FBF8EF" />
          <Text style={styles.textFeature}>Detect Color</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.feature}
          onPress={() => navigation.navigate('Translate')}
        >
          <Icon name="globe" size={28} color="#FBF8EF" />
          <Text style={styles.textFeature}>Translate</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.feature}
          onPress={() => navigation.navigate('Cameratest', { feature: 'QRScanner' })}
        >
          <Icon name="qrcode" size={28} color="#FBF8EF" />

          <Text style={styles.textFeature}>Scan QR/Barcode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    height: '100%',
    backgroundColor: '#FBF8EF',
  },
  feature: {
    width: '100%',
    height: '100%',
    backgroundColor: '#22668D',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textFeature: {
    color: '#FBF8EF',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10, 
    textAlign: 'center',
  },
  buttons: {
    width: '45%',
    height: '47.5%',
    margin: '2.5%',
  },
});
