import React, { useState } from 'react';
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
import { WebView } from 'react-native-webview';
import DoubleClick from 'double-click-react-native';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Homepage'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const features = [
  {
    label: 'Text Reader',
    icon: 'file-alt',
    color: '#4F959D',
    tts: 'Text reader',
    navigate: 'Cameratest',
    params: { feature: 'Scantext' },
  },
  {
    label: 'Color Detector',
    icon: 'palette',
    color: '#FFC45B',
    tts: 'Color Detector',
    navigate: 'Cameratest',
    params: { feature: 'ColorDetector' },
  },
  {
    label: 'Translator',
    icon: 'globe',
    color: '#6ED5CC',
    tts: 'Translator',
    navigate: 'Translate',
  },
  {
    label: 'Price Tag Scanner',
    icon: 'tag',
    color: '#8CCBDC',
    tts: 'Price Tag Scanner',
    navigate: 'Cameratest',
    params: { feature: 'RoboflowScreen' }
  },
];

export default function Homepage({ navigation }: Props) {
  const [listening, setListening] = useState(false);

  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact');

  const findFeatureByCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes('scan') || lower.includes('text') || lower.includes('read') || lower.includes('reader')) return features[0];
    if (lower.includes('color')) return features[1];
    if (lower.includes('translate') || lower.includes('language') || lower.includes('translator')) return features[2];
    if (lower.includes('price') || lower.includes('tag') || lower.includes('tags')) return features[3];
    return undefined;
  };

  const handleVoiceCommand = (transcript: string) => {
    const feature = findFeatureByCommand(transcript);
    if (feature) {
      Tts.speak(feature.tts);
      if ('params' in feature && feature.params) {
        navigation.navigate(feature.navigate as any, feature.params);
      } else {
        navigation.navigate(feature.navigate as any);
      }
    } else {
      Tts.speak("Sorry, I didn't catch that.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topsection}>
        {features.map((feature, index) => (
          <View key={index} style={styles.buttons}>
            <DoubleClick 
              singleTap={() => {
                  Tts.speak(feature.tts);
              }}
              doubleTap={() => {
                  if ('params' in feature && feature.params){
                    navigation.navigate(feature.navigate as any, feature.params);
                    Tts.speak(`navigate to ${feature.tts}`);
                    Tts.speak('Please choose to upload a photo or take a new one.');
                  } else {
                    navigation.navigate(feature.navigate as any);
                    Tts.speak(`navigate to ${feature.tts}`);
                  }
              }}  
              delay={300}
              style={[styles.featureCard, {  backgroundColor: feature.color}]}
            >
              <Icon name={feature.icon} size={28} solid color='#FFF'/>
              <Text style={styles.textFeature}>{feature.label}</Text>
            </DoubleClick>
          </View>
        ))}
      </View>

      <View style={styles.bottomsection}>
        <TouchableOpacity
          style={styles.microphone}
          onPress={() => {
            Tts.speak('Listening...');
            setListening(true);
          }}
        >
          <Icon name="microphone" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.volume}
          onPress={() => {
            Tts.speak('The top left is the Text Reader, the top right is the Color Detector, the bottom left is the Translator, and the bottom right is the Price Tag Scanner. When selecting a feature, you need to double-tap the button. The first tap announces the feature name, and the second tap confirms your selection.');
          }}
        >
          <Icon name="volume-up" size={28} color="#22668D"solid />
        </TouchableOpacity>
      </View>

      {listening && (
        <WebView
          source={{
            html: `
              <!DOCTYPE html>
              <html>
              <body>
                <script>
                  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                  recognition.lang = 'en-US';
                  recognition.continuous = false;
                  recognition.interimResults = false;
                  recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    window.ReactNativeWebView.postMessage(transcript);
                  };
                  recognition.onerror = function(event) {
                    window.ReactNativeWebView.postMessage("ERROR:" + event.error);
                  };
                  recognition.onend = function() {
                  window.ReactNativeWebView.postMessage("END");
                  };
                  recognition.start();
                </script>
              </body>
              </html>
            `,
          }}
          onMessage={event => {
            const msg = event.nativeEvent.data;
            if (msg.startsWith('ERROR:')) {
              Tts.speak('Speech recognition error.');
            } else if (msg === 'END'){
              // silence
            } else {
              Tts.speak(`You said: ${msg}`);
              handleVoiceCommand(msg);
            }
            setListening(false);
          }}
          style={{ width: 0, height: 0 }}
        />
      )}
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
    width: '46%',
    height: '47.5%',
    margin: '2%',
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
    fontSize: 19,
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
    right:0,
    padding: 50,
  },
});
