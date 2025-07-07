import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import Tts from 'react-native-tts';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WebView } from 'react-native-webview';

type ScantextRouteProp = RouteProp<RootStackParamList, 'Scantext'>;
type Props = {
  route: ScantextRouteProp;
};

export default function Scantext({ route }: Props) {
  const { imagePath } = route.params;
  const [recognizedText, setRecognizedText] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isSpeakingOCR, setIsSpeakingOCR] = useState(false);
  const [isSpeakingLabel, setIsSpeakingLabel] = useState(false);
  const [listening, setListening] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const ttsStartListener = useRef<any>(null);
  const ttsFinishListener = useRef<any>(null);
  const ttsCancelListener = useRef<any>(null);

  const findFeatureByCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes('read') || lower.includes('start') || lower.includes('play') || lower.includes('text')) {
      handleSpeakContent();
    } else if (lower.includes('help') || lower.includes('describe')) {
      handleSpeakLabel();
    } else if (lower.includes('stop')) {
      handleStop();
    } else {
      Tts.speak("Sorry, I didn't catch that.");
    }
  };

  useEffect(() => {
    Image.getSize(
      `file://${imagePath}`,
      (width, height) => {
        const ratio = width / height;
        let displayWidth = screenWidth * 0.95;
        let displayHeight = displayWidth / ratio;

        if (displayHeight > screenHeight * 0.5) {
          displayHeight = screenHeight * 0.5;
          displayWidth = displayHeight * ratio;
        }

        setImageSize({ width: displayWidth, height: displayHeight });
      },
      (error) => {
        console.error('Failed to get image size:', error);
      }
    );

    const detectText = async () => {
      try {
        const rawResult = await TextRecognition.recognize(
          `file://${imagePath}`,
          TextRecognitionScript.JAPANESE
        );
        const lines = rawResult.blocks.flatMap(block =>
          block.lines.map(line => line.text)
        );
        setRecognizedText(lines);
      } catch (err) {
        console.error('OCR Error:', err);
        setRecognizedText(['Error detecting text']);
      } finally {
        setLoading(false);
      }
    };

    detectText();

    return () => {
      Tts.stop();
      removeTTSEventListeners();
    };
  }, [imagePath]);

  const removeTTSEventListeners = () => {
    ttsStartListener.current?.remove?.();
    ttsFinishListener.current?.remove?.();
    ttsCancelListener.current?.remove?.();

    ttsStartListener.current = null;
    ttsFinishListener.current = null;
    ttsCancelListener.current = null;
  };

  const handleSpeakContent = async () => {
    try {
      if (recognizedText.length === 0) return;

      const language = recognizedText.some((text) => /[a-zA-Z]/.test(text)) ? 'en-US' : 'ja-JP';
      await Tts.setDefaultLanguage(language);
      Tts.setDefaultRate(language === 'en-US' ? 0.4 : 0.7);

      removeTTSEventListeners();

      ttsStartListener.current = Tts.addEventListener('tts-start', () => setIsSpeakingOCR(true));
      ttsFinishListener.current = Tts.addEventListener('tts-finish', () => {
        setIsSpeakingOCR(false);
        removeTTSEventListeners();
      });
      ttsCancelListener.current = Tts.addEventListener('tts-cancel', () => {
        setIsSpeakingOCR(false);
        removeTTSEventListeners();
      });

      Tts.speak(recognizedText.join(' '));
    } catch (error) {
      console.error('TTS content error:', error);
      setIsSpeakingOCR(false);
    }
  };

  const handleSpeakLabel = async () => {
    try {
      setIsSpeakingLabel(true);
      await Tts.setDefaultLanguage('en-US');
      Tts.speak(
        'This is the Text Reader screen. At the bottom, there are three buttons. On the left is the play button to read the text. In the center is the microphone button to give voice commands. On the right is this help button that describes the screen.'
      );
      setTimeout(() => setIsSpeakingLabel(false), 7000);
    } catch (error) {
      console.error('TTS label error:', error);
      setIsSpeakingLabel(false);
    }
  };

  const handleStop = () => {
    Tts.stop();
    setIsSpeakingOCR(false);
    setIsSpeakingLabel(false);
    removeTTSEventListeners();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topsection}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Text Reader</Text>
          <Image
            source={{ uri: `file://${imagePath}` }}
            style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
            resizeMode="contain"
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
          ) : (
            <Text style={styles.ocrText}>{recognizedText.join('\n')}</Text>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={isSpeakingOCR ? handleStop : handleSpeakContent}
          style={styles.rightButton}
          hitSlop={20}
        >
          <Icon name={isSpeakingOCR ? 'stop' : 'play'} size={28} color="#22668D" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Tts.speak('Listening...');
            setListening(true);
          }}
          style={styles.microphone}
        >
          <Icon name="microphone" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSpeakLabel} style={styles.leftButton}>
          <Icon name="comment-dots" size={28} color="#22668D"solid />
        </TouchableOpacity>

      </View>

      {listening && (
        <View
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
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
              } else if (msg === 'END') {
                // do nothing if silent
              } else {
                Tts.speak(`You said: ${msg}`);
                findFeatureByCommand(msg);
              }
              setListening(false);
            }}
            style={{ width: 0, height: 0 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topsection: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF9E5',
    borderBottomLeftRadius: '10%',
    borderBottomRightRadius: '10%',
    overflow: 'hidden',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22668D',
    textAlign: 'center',
    paddingTop: 50,
  },
  image: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#e1e9f5',
  },
  ocrText: {
    marginTop: 25,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    width: '100%',
  },
  bottomBar: {
    width: '100%',
    height: Dimensions.get('window').height * 0.15,
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
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  leftButton: {
    position: 'absolute',
    left: 50,
  },
  rightButton: {
    position: 'absolute',
    right: 50,
  },
});
