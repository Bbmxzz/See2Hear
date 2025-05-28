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
import Tts from 'react-native-tts';
import { TranslateLanguage } from '@react-native-ml-kit/translate-text';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Homepage'
>;
type Props = {
  navigation: HomeScreenNavigationProp;
};

type LangCode = 'EN' | 'TH' | 'JA';
const languageOptions: Record<LangCode, TranslateLanguage> = {
  EN: TranslateLanguage.ENGLISH,
  TH: TranslateLanguage.THAI,
  JA: TranslateLanguage.JAPANESE,
};

const features = [
  {
    label: 'Scan Text',
    icon: 'search',
    color: '#4F959D',
    tts: 'Scan text',
    navigate: 'Cameratest',
    params: { feature: 'Scantext' },
  },
  {
    label: 'Detect Color',
    icon: 'palette',
    color: '#FFC45B',
    tts: 'Detect color',
    navigate: 'Cameratest',
    params: { feature: 'ColorDetector' },
  },
  {
    label: 'Translate',
    icon: 'globe',
    color: '#6ED5CC',
    tts: 'Translate',
    navigate: 'Translate',
  },
  {
    label: 'Scan QR/Barcode',
    icon: 'qrcode',
    color: '#8CCBDC',
    tts: 'Scan QR code or barcode',
    navigate: 'Cameratest',
    params: { feature: 'QRScanner' },
  },
];

export default function Homepage({ navigation }: Props){
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact');

  return (
    <View style={styles.container}>
      <View style={styles.topsection}>
        {features.map((feature, index) => (
          <View key={index} style={styles.buttons}>
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: feature.color }]}
              onPress={() => {
                Tts.speak(feature.tts);
                if ('params' in feature) {
                  navigation.navigate(feature.navigate as any, feature.params);
                } else {
                  navigation.navigate(feature.navigate as any);
                }
              }}
            >
              <Icon name={feature.icon} size={28} color="#FFF" />
              <Text style={styles.textFeature}>{feature.label}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.bottomsection}>
        <TouchableOpacity style={styles.microphone}>
          <Icon name="microphone" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.volume}>
          <Icon name="volume-up" size={28} color="#22668D" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topsection: {
    height: '85%',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E5',
    borderBottomLeftRadius: '10%',
    borderBottomRightRadius: '10%',
    padding: '5%',
  },
  bottomsection: {
    width: '100%',
    height: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttons: {
    width: '45%',
    height: '47.5%',
    margin: '2.5%',
  },
  featureCard: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textFeature: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  microphone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22668D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  volume: {
    position: 'absolute',
    right: 50,
  },
});
