import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import Tts from 'react-native-tts';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/FontAwesome5';

type ScantextRouteProp = RouteProp<RootStackParamList, 'Scantext'>;
type Props = {
  route: ScantextRouteProp;
};

export default function Scantext({ route }: Props) {
  const { imagePath } = route.params;
  const [recognizedText, setRecognizedText] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isSpeakingContent, setIsSpeakingContent] = useState(false);
  const [isSpeakingLabel, setIsSpeakingLabel] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

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

    const handleStart = () => {
      if (isSpeakingContent) setIsSpeakingContent(true);
      if (isSpeakingLabel) setIsSpeakingLabel(true);
    };
    const handleFinish = () => {
      setIsSpeakingContent(false);
      setIsSpeakingLabel(false);
    };

    Tts.addEventListener('tts-start', handleStart);
    Tts.addEventListener('tts-finish', handleFinish);
    Tts.addEventListener('tts-cancel', handleFinish);

    return () => {
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, [imagePath]);

  const handleSpeakContent = async () => {
    try {
      const language = recognizedText.some((text) => /[a-zA-Z]/.test(text)) ? 'en-US' : 'ja-JP';
      await Tts.setDefaultLanguage(language);
      Tts.setDefaultRate(language === 'en-US' ? 0.4 : 0.7);
      setIsSpeakingContent(true);
      Tts.speak(recognizedText.join(' '));
    } catch (error) {
      console.error('TTS content error:', error);
    }
  };

  const handleSpeakLabel = async () => {
    try {
      await Tts.setDefaultLanguage('en-US');
      setIsSpeakingLabel(true);
      Tts.speak('Text Reader');
    } catch (error) {
      console.error('TTS label error:', error);
    }
  };

  const handleStop = () => {
    Tts.stop();
    setIsSpeakingContent(false);
    setIsSpeakingLabel(false);
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
        <Pressable
          onPress={isSpeakingContent ? handleStop : handleSpeakContent}
          style={styles.leftButton}
          hitSlop={20}
        >
          <Icon name={isSpeakingContent ? 'stop' : 'play'} size={28} color="#22668D" />
        </Pressable>

        <Pressable
          onPress={() => console.log('Microphone pressed')}
          style={styles.microphone}
          hitSlop={20}
        >
          <Icon name="microphone" size={28} color="white" />
        </Pressable>

        <Pressable
          onPress={handleSpeakLabel}
          style={styles.rightButton}
          hitSlop={20}
        >
          <Icon name="volume-up" size={28} color="#22668D" />
        </Pressable>
      </View>
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
