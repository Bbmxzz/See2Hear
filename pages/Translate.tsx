import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import TranslateText, { TranslateLanguage } from '@react-native-ml-kit/translate-text';
import Tts from 'react-native-tts';

const languageOptions = {
  EN: TranslateLanguage.ENGLISH,
  TH: TranslateLanguage.THAI,
  JA: TranslateLanguage.JAPANESE,
};

const ttsLanguageMap = {
  EN: 'en-US',
  TH: 'th-TH',
  JA: 'ja-JP',
};

const Translate = () => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState<'EN' | 'TH' | 'JA'>('EN');
  const [targetLang, setTargetLang] = useState<'EN' | 'TH' | 'JA'>('JA');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
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
      .then(result => {
        setTranslatedText(result);
      })
      .catch(error => {
        Alert.alert(error.message || 'Translation failed');
        setTranslatedText(null);
      })
      .finally(() => setLoading(false));
  };

  const handleSpeak = () => {
    const ttsLang = ttsLanguageMap[targetLang];
    Tts.setDefaultLanguage(ttsLang);
    Tts.setDefaultRate(ttsLang === 'en-US' ? 0.4 : 0.5);
    Tts.speak(translatedText || '');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Translate Text</Text>

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
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={sourceLang}
              onValueChange={setSourceLang}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode="dropdown"
            >
              <Picker.Item label="English" value="EN" />
              <Picker.Item label="Thai" value="TH" />
              <Picker.Item label="Japanese" value="JA" />
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>To</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={targetLang}
              onValueChange={setTargetLang}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode="dropdown"
            >
              <Picker.Item label="English" value="EN" />
              <Picker.Item label="Thai" value="TH" />
              <Picker.Item label="Japanese" value="JA" />
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Translating...' : 'Translate'}</Text>
      </TouchableOpacity>

      {translatedText !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Translation:</Text>
          <ScrollView style={styles.resultBox} nestedScrollEnabled>
            <Text style={styles.resultText}>{translatedText}</Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.speakButton}
            onPress={handleSpeak}
            activeOpacity={0.8}
          >
            <Text style={styles.speakButtonText}>🔊 Read</Text>
          </TouchableOpacity>
        </View>
      )}
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
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#22668D',
    alignSelf: 'center',
  },
  input: {
    height: 130,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#22668D',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  picker: {
    height: 55,
    width: '100%',
    color: '#22668D',
  },
  pickerItem: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffb433',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ffa500',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#f0c169',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    maxHeight: 200,
  },
  resultLabel: {
    fontWeight: '700',
    color: '#22668D',
    marginBottom: 8,
    fontSize: 16,
  },
  resultBox: {
    maxHeight: 80,
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  speakButton: {
    backgroundColor: '#22668D',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  speakButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Translate;
