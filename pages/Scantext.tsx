import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import TextRecognition, {
  TextRecognitionScript,
} from '@react-native-ml-kit/text-recognition';
import Tts from 'react-native-tts';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type ScantextRouteProp = RouteProp<RootStackParamList, 'Scantext'>;

type Props = {
  route: ScantextRouteProp;
};

export default function Scantext({ route }: Props) {
  const { imagePath } = route.params;
  const [recognizedText, setRecognizedText] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageDisplaySize, setImageDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStartPressed, setIsStartPressed] = useState(false);
  const [isStopPressed, setIsStopPressed] = useState(false);

  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    Image.getSize(
      `file://${imagePath}`,
      (width, height) => {
        const imageRatio = width / height;
        let displayWidth = Dimensions.get('window').width;
        let displayHeight = displayWidth / imageRatio;

        if (displayHeight > screenHeight * 0.7) {
          displayHeight = screenHeight * 0.7;
          displayWidth = displayHeight * imageRatio;
        }

        setImageDisplaySize({ width: displayWidth, height: displayHeight });
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

    Tts.addEventListener('tts-start', () => setIsSpeaking(true));
    Tts.addEventListener('tts-finish', () => setIsSpeaking(false));
    Tts.addEventListener('tts-cancel', () => setIsSpeaking(false));

    return () => {
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, [imagePath]);

  const onContentLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  const isScrollable = contentHeight > screenHeight;

  const handleSpeak = () => {
    const language = recognizedText.some((text) => /[a-zA-Z]/.test(text)) ? 'en-US' : 'ja-JP';
    Tts.setDefaultLanguage(language);
    Tts.setDefaultRate(language === 'en-US' ? 0.5 : 0.7);
    Tts.speak(recognizedText.join(' '));
  };

  const handleStop = () => {
    Tts.stop();
    setIsSpeaking(false);
  };

  const Content = (
    <View onLayout={onContentLayout} style={styles.inner}>
      <Image
        source={{ uri: `file://${imagePath}` }}
        style={{
          width: imageDisplaySize.width - 20,
          height: imageDisplaySize.height - 20,
          borderRadius: 10,
          marginTop: "10%",
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <Text style={styles.ocrText}>{recognizedText.join('\n')}</Text>
      )}

      <View style={{ height: 100 }} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {isScrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: 120 }]}
        >
          {Content}
        </ScrollView>
      ) : (
        <View style={styles.scrollContainer}>{Content}</View>
      )}

      <View style={styles.fixedButtonContainer}>
        <Pressable
          onPressIn={() => setIsStartPressed(true)}
          onPressOut={() => setIsStartPressed(false)}
          onPress={handleSpeak}
          disabled={isSpeaking}
          style={[
            styles.button,
            {
              backgroundColor: isSpeaking
                ? 'rgb(121, 160, 180)'
                : isStartPressed
                ? 'rgba(34, 102, 141, 1)'
                : 'rgba(34, 102, 141, 1)',
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: isSpeaking ? 'rgba(255, 255, 255 ,0.7)' : isStartPressed ? 'rgba(255, 255, 255, 1)' : 'rgb(255, 255, 255)' },
            ]}
          >
            Start
          </Text>
        </Pressable>

        <Pressable
          onPressIn={() => setIsStopPressed(true)}
          onPressOut={() => setIsStopPressed(false)}
          onPress={handleStop}
          disabled={!isSpeaking}
          style={[
            styles.button,
            {
              backgroundColor: !isSpeaking
                ? 'rgb(231, 149, 143)'
                : isStopPressed
                ? 'rgba(217, 83, 79, 1)'
                : 'rgba(217, 83, 79, 1)',
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: !isSpeaking ? 'rgba(255, 255, 255, 0.7)' : isStopPressed ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)' },
            ]}
          >
            Stop
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
    alignItems: 'center',
    backgroundColor: '#FBF8EF',
    padding: 20,
  },
  inner: {
    width: '100%',
    alignItems: 'center',
  },
  ocrText: {
    marginTop: 40,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
});
