import React, { useState, useRef } from 'react';
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
  const webviewRef = useRef(null);

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
        Alert.alert('Permission Denied', 'Cannot access micrphone');
        return false;
      }
    }
    return true;
  }
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
        console.log('TranslateText result:', result);
        setTranslatedText(result.translatedText || result.text || JSON.stringify(result));
      })
      .catch(error => Alert.alert('Error', error.message || 'Translation failed'))
      .finally(() => setLoading(false));
  };
  const handleSpeak = () => {
    if (!translatedText) {
      Alert.alert('Nothing to speak','Please translate text fist.');
      return;
    }
    const lang = ttsLanguageMap[targetLang];
    Tts.setDefaultLanguage(lang);
    Tts.setDefaultRate(0.5);
    const cleanText = (translatedText || '').replace(/["“”]/g, '');
    Tts.speak(cleanText);

  };
  const handleSpeechResult = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    if (message.startsWith('ERROR:')) {
      Alert.alert('Speech Error', message);
    } else {
      setText(message);
    }
  };
  const getSpeechHTML = (langCode: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background-color: transparent;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          button {
            background-color: #22668D;
            color: white;
            font-size: 22px;
            font-weight: bold;
            height: 56px;
            line-height: 56px;
            border: none;
            border-radius: 16px;
            padding: 0 20px;
            width: 100%;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <button onclick="start()">Speak</button>
        <script>
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = '${langCode}';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          function start() {
            recognition.start();
          }

          recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            window.ReactNativeWebView.postMessage(text);
          };

          recognition.onerror = (event) => {
            window.ReactNativeWebView.postMessage("ERROR: " + event.error);
          };
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
      <Text style={styles.header}>Translate Text</Text>
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
            mode="dropdown"
          >
            <Picker.Item label="English" value="EN"/>
            <Picker.Item label="Thai" value="TH"/>
            <Picker.Item label="Japanese" value="JA"/>
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>To</Text>
          <Picker
            selectedValue={targetLang}
            onValueChange={(value: LangCode) => setTargetLang(value)}
            style={styles.picker}
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
      {translatedText !== null &&(
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Translation:</Text>
          <ScrollView style={styles.resultBox} nestedScrollEnabled>
            <Text style={styles.resultText}>{translatedText}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.readButton}
            onPress={handleSpeak}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Read Translation</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webviewRef}
          originWitelist={['*']}
          source={{ html: getSpeechHTML(webSpeechLang[sourceLang])}}
          onMessage={handleSpeechResult}
          onLoadStart={requestMicrophonePermission}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f5f8fa',
    flexGrow: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22668D',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    height: 130,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    fontSize: 18,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webviewContainer: {
    height: 66,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
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
    marginTop: 20,
    elevation: 4,
  },
  readButton: {
    backgroundColor: '#44A6BF',
    height: 66,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 4,
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
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 4,
    maxHeight: 220,
    marginBottom: 30,
  },
  resultLabel: {
    fontWeight: '700',
    color: '#22668D',
    marginBottom: 12,
    fontSize: 18,
  },
  resultBox: {
    maxHeight: 100,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
    color: '#333',
  },
});
export default Translate;

