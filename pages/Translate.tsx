import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import TranslateText, { TranslateLanguage } from '@react-native-ml-kit/translate-text';
import Tts from 'react-native-tts';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';

type TranslateScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Translate'>;
type TranslateScreenRouteProp = RouteProp<RootStackParamList, 'Translate'>;
type LangCode = 'EN' | 'TH' | 'JA';

const languageOptions: Record<LangCode, TranslateLanguage> = {
  EN: TranslateLanguage.ENGLISH,
  TH: TranslateLanguage.THAI,
  JA: TranslateLanguage.JAPANESE,
};

const ttsLanguageMap: Record<LangCode, string> = {
  EN: 'en-US',
  TH: 'th-TH',
  JA: 'ja-JP',
};

const webSpeechLang: Record<LangCode, string> = {
  EN: 'en-US',
  TH: 'th-TH',
  JA: 'ja-JP',
};

const Translate = () => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState<LangCode>('EN');
  const [targetLang, setTargetLang] = useState<LangCode>('JA');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const navigation = useNavigation<TranslateScreenNavigationProp>();
  const route = useRoute<TranslateScreenRouteProp>();

  useEffect(() => {
    const params = route.params || {};
    if (params.imagePath) {
      recognizeTextFromImage(params.imagePath);
    }
  }, [route.params]);

  useEffect(() => {
    return () => {
      Tts.stop(); 
    };
  }, []);

  const recognizeTextFromImage = async (imagePath: string) => {
    try {
      const result = await TextRecognition.recognize(
        `file://${imagePath}`,
        TextRecognitionScript.JAPANESE
      );
      const extractedText = result.text || result.blocks.map(b => b.text).join('\n');
      setText(extractedText);

      const isJapanese = /[\u3040-\u30FF\u4E00-\u9FFF]/.test(extractedText);
      const isEnglish = /^[\x00-\x7F\s]*$/.test(extractedText);

      if (isJapanese) {
        setSourceLang('JA');
        setTargetLang('EN');
      } else if (isEnglish) {
        setSourceLang('EN');
        setTargetLang('JA');
      } else {
        setSourceLang('JA');
        setTargetLang('EN');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to extract text from image');
      console.error(error);
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone to recognize speech.',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot access microphone');
        return false;
      }
    }
    return true;
  };

  const handleTranslate = () => {
    if (sourceLang === targetLang) {
      Alert.alert('Please choose different source and target languages');
      return;
    }
    if (text.trim() === '') {
      Alert.alert('Please enter text to translate');
      return;
    }
    setLoading(true);
    TranslateText.translate({
      text,
      sourceLanguage: languageOptions[sourceLang],
      targetLanguage: languageOptions[targetLang],
      downloadModelIfNeeded: true,
    })
      .then((result: any) => {
        setTranslatedText(result.translatedText || result.text || JSON.stringify(result));
      })
      .catch(error => Alert.alert('Error', error.message || 'Translation failed'))
      .finally(() => setLoading(false));
  };

  const handleSpeak = () => {
    if (!translatedText) {
      Alert.alert('Nothing to speak', 'Please translate text first.');
      return;
    }
    const lang = ttsLanguageMap[targetLang];
    Tts.setDefaultLanguage(lang);
    Tts.setDefaultRate(0.5);
    const cleanText = translatedText.replace(/["“”]/g, '');
    Tts.speak(cleanText);
  };

  const handleSpeechResult = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    if (message.startsWith('ERROR:')) {
      Alert.alert('Speech Error', message.replace('ERROR:', '').trim());
    } else {
      setText(message);
    }
  };

  const startSpeechRecognition = async () => {
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) return;
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`start(); true;`);
    }
  };

  const getSpeechHTML = (langCode: string) => `<!DOCTYPE html>
  <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.ReactNativeWebView.postMessage("ERROR: SpeechRecognition API not supported");
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = '${langCode}';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      function start() { recognition.start(); }
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        window.ReactNativeWebView.postMessage(text);
      };
      recognition.onerror = (event) => {
        window.ReactNativeWebView.postMessage("ERROR: " + event.error);
      };
    }
  </script></head><body style="margin:0;background-color:transparent;"></body></html>`;

  const goToCamera = () => {
    navigation.navigate('Cameratest', { feature: 'Translate' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topsection}>
        <Text style={styles.header}>Translator</Text>
        <TextInput
          placeholder="Enter text here"
          multiline
          textAlignVertical="top"
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholderTextColor="#999"
        />
        <View style={styles.pickerRow}>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>From</Text>
            <Picker
              selectedValue={sourceLang}
              onValueChange={(value: LangCode) => setSourceLang(value)}
              style={styles.picker}
              dropdownIconColor="#22668D"
              mode="dropdown"
            >
              <Picker.Item label="English" value="EN" />
              <Picker.Item label="Thai" value="TH" />
              <Picker.Item label="Japanese" value="JA" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>To</Text>
            <Picker
              selectedValue={targetLang}
              onValueChange={(value: LangCode) => setTargetLang(value)}
              style={styles.picker}
              dropdownIconColor="#22668D"
              mode="dropdown"
            >
              <Picker.Item label="English" value="EN" />
              <Picker.Item label="Thai" value="TH" />
              <Picker.Item label="Japanese" value="JA" />
            </Picker>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleTranslate}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Translating...' : 'Translate'}
          </Text>
        </TouchableOpacity>
        {translatedText !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Translation:</Text>
            <ScrollView style={styles.resultBox} nestedScrollEnabled>
              <Text style={styles.resultText}>{translatedText}</Text>
            </ScrollView>
          </View>
        )}
        <View style={styles.webviewContainer}>
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: getSpeechHTML(webSpeechLang[sourceLang]) }}
            onMessage={handleSpeechResult}
            javaScriptEnabled
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
      </View>
      <View style={styles.bottomsection}>
        <TouchableOpacity style={styles.camera} onPress={goToCamera}>
          <Icon name="camera" size={28} color="#22668D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.microphone} onPress={startSpeechRecognition}>
          <Icon name="microphone" size={28} color="#FFF" />
        </TouchableOpacity>
        {translatedText !== null && (
          <TouchableOpacity style={styles.volume} onPress={handleSpeak}>
            <Icon name="volume-up" size={28} color="#22668D" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22668D',
    textAlign: 'center',
    marginVertical: 15,
  },
  input: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    fontSize: 18,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webviewContainer: {
    height: 1,
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 30,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22668D',
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    height: 55,
    width: '100%',
    color: '#22668D',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#FFB433',
    height: 66,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 66,
  },
  buttonDisabled: {
    backgroundColor: '#ffb766',
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 150,
    marginBottom: 30,
  },
  resultLabel: {
    fontWeight: '700',
    color: '#22668D',
    marginBottom: 5,
    fontSize: 18,
  },
  resultBox: {
    maxHeight: 100,
  },
  resultText: {
    fontSize: 18,
    color: '#333',
  },
  topsection: {
    height: '85%',
    width: '100%',
    backgroundColor: '#FFF9E5',
    borderBottomLeftRadius: '10%',
    borderBottomRightRadius: '10%',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  bottomsection: {
    width: '100%',
    height: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  microphone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22668D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'static',
    left: '50%',
  },
  volume: {
    position: 'absolute',
    right: 50,
  },
  camera: {
    position: 'absolute',
    left: 50,
  },
});

export default Translate;
