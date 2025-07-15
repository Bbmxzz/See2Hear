import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
} from 'react-native';
import {
  getAverageColor,
  getSegmentsAverageColor,
  type PaletteResult,
} from '@somesoap/react-native-image-palette';
import chroma from 'chroma-js';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WebView } from 'react-native-webview';

type Props = {
  route: {
    params: {
      imagePath: string;
    };
  };
};

export default function ColorDetector({ route }: Props) {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact');
  const { imagePath } = route.params;
  const uri = imagePath;
  const [averageColor, setAverageColor] = useState<string>('');
  const [avgSectors, setAvgSectors] = useState<string[]>([]);
  const [centerColor, setCenterColor] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [listening, setListening] = useState(false);
  const segmentOptions = Platform.OS === 'android' ? { pixelSpacingAndroid: 2 } : undefined;

  const findFeatureByCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes('color') || lower.includes('center') || lower.includes('detect') || lower.includes('detector')) {
      handleSpeakContent();
    } else {
      Tts.speak("Sorry, I didn't catch that.");
    }
  };

  const handleSpeakLabel = async () => {
    try {
      await Tts.setDefaultLanguage('en-US');
      Tts.speak('This is the color detector screen. Point the camera to detect a color. At the bottom, there are 3 buttons: On the left is the help button, which describes the screen. In the center is the microphone button for voice commands. On the right is the speaker button, which repeats the current color out loud.');
    } catch (error) {
      console.error('TTS label error:', error);
    }
  }

  const handleSpeakContent = async () => {
    try {
      if (!centerColor){
        Tts.speak("Can't detect.");
        return;
      } 
      const colorName = getSimpleColorName(centerColor);
      Tts.speak(`Center color is ${colorName}`);
    } catch (error) {
      console.error('TTs error:', error);
    }
  };

  useEffect(() => {
    getAverageColor(uri)
      .then((color) => {
        setAverageColor(color);
        Tts.speak(`Average color is ${getSimpleColorName(color)}`);
      });

    getSegmentsAverageColor(
      uri,
      [
        { fromX: 0, toX: 33, fromY: 0, toY: 33 },
        { fromX: 34, toX: 66, fromY: 0, toY: 33 },
        { fromX: 67, toX: 100, fromY: 0, toY: 33 },
        { fromX: 0, toX: 33, fromY: 34, toY: 66 },
        { fromX: 34, toX: 66, fromY: 34, toY: 66 },
        { fromX: 67, toX: 100, fromY: 34, toY: 66 },
        { fromX: 0, toX: 33, fromY: 67, toY: 100 },
        { fromX: 34, toX: 66, fromY: 67, toY: 100 },
        { fromX: 67, toX: 100, fromY: 67, toY: 100 },
      ],
      segmentOptions
    ).then(setAvgSectors);

    getSegmentsAverageColor(uri, [{ fromX: 40, toX: 60, fromY: 40, toY: 60 }], segmentOptions)
      .then((colors) => {
        if (colors.length > 0) {
          setCenterColor(colors[0]);
          Tts.speak(`Center color is ${getSimpleColorName(colors[0])}`);
        }
      })
      .catch(console.error);

    return () => {
      Tts.stop();
      Tts.setDefaultLanguage('en-US');
      setListening(false);
    };
  }, [uri]);

  return (
    <View style={styles.screen}>
      <View style={styles.topsection}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        >
          <Text style={styles.header}>Color Detector</Text>
          <Image source={{ uri }} style={styles.image} />
          {centerColor && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Center Color</Text>
              <ColorBlock
                color={centerColor}
                label={`Center - ${getSimpleColorName(centerColor)}`}
                big
              />
            </View>
          )}
          <ToggleSection
            title="Show All Colors"
            expanded={showAll}
            onToggle={() => {
              LayoutAnimation.easeInEaseOut();
              setShowAll(!showAll);
            }}
          >
            {showAll && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Segmented Colors</Text>
                  <View style={styles.grid}>
                    {avgSectors.map((color, idx) => (
                      <ColorBlock
                        key={idx}
                        color={color}
                        label={`Block ${idx + 1} - ${getSimpleColorName(color)}`}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </ToggleSection>
        </ScrollView>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.microphone}
          onPress={() => {
            Tts.speak('Listening...');
            setListening(true);
          }}
        >
          <Icon name="microphone" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.volume} onPress={handleSpeakContent}>
          <Icon name="volume-up" size={28} color="#22668D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.help} 
         onPress={handleSpeakLabel}
        >
          <Icon name="comment-dots" size={30} color="#22668D"solid/>
        </TouchableOpacity>
      </View>

      {listening && (
        <View style={{ position: 'absolute', width: 0, height: 0, top: 0, left: 0, pointerEvents: 'none'}}>
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
                // silence
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

function ToggleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.toggleHeader, { backgroundColor: '#44A6BF' }]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleIcon}>{expanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}

function ColorBlock({
  color,
  label,
  big = false,
}: {
  color: string;
  label?: string;
  big?: boolean;
}) {
  const speakColor = () => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
    Tts.speak(label || color);
  };
  const textColor = chroma(color).luminance() < 0.5 ? '#FFF' : '#222';
  return (
    <TouchableOpacity
      style={[
        styles.colorBlock,
        { backgroundColor: color },
        big && styles.colorBlockBig,
      ]}
      onPress={speakColor}
      accessibilityLabel={`Speak color ${label}`}
      accessibilityRole="button"
    >
      {label && <Text style={[styles.colorLabel, { color: textColor }]}>{label}</Text>}
      <Text style={[styles.colorCode, { color: textColor }]}>{color}</Text>
    </TouchableOpacity>
  );
}

function getSimpleColorName(hex: string): string {
  const [h, s, l] = chroma(hex).hsl();
  if (isNaN(h)) return 'White';
  if (s < 0.15) {
    if (l < 0.2) return 'Black';
    if (l < 0.4) return 'Dark Gray';
    if (l < 0.7) return 'Gray';
    return 'Light Gray';
  }
  if (h >= 20 && h <= 50 && s < 0.5) {
    if (l < 0.3) return 'Dark Brown';
    if (l < 0.5) return 'Brown';
    if (l < 0.7) return 'Light Brown';
    return 'Tan';
  }
  if (h >= 30 && h <= 60 && s < 0.4 && l > 0.75) return 'Cream';
  if (h >= 30 && h <= 50 && s < 0.4 && l > 0.6 && l <= 0.75) return 'Beige';
  if (h >= 0 && h < 10) return l < 0.4 ? 'Dark Red' : 'Red';
  if (h >= 10 && h < 20) return 'Red-Orange';
  if (h >= 20 && h < 30) return 'Orange';
  if (h >= 30 && h < 40) return 'Orange-Yellow';
  if (h >= 40 && h < 65) return 'Yellow';
  if (h >= 65 && h < 85) return 'Yellow-Green';
  if (h >= 85 && h < 140) return 'Green';
  if (h >= 140 && h < 170) return 'Dark Green';
  if (h >= 170 && h < 200) return 'Teal';
  if (h >= 200 && h < 220) return 'Blue';
  if (h >= 220 && h < 240) return 'Light Blue';
  if (h >= 240 && h < 260) return 'Navy Blue';
  if (h >= 260 && h < 275) return 'Indigo';
  if (h >= 275 && h < 290) return 'Purple';
  if (h >= 290 && h < 305) return 'Magenta';
  if (h >= 305 && h < 320) return 'Hot Pink';
  if (h >= 320 && h < 330) return 'Pink';
  if (h >= 330 && h <= 360) return l < 0.4 ? 'Dark Red' : 'Red';
  return 'Unknown';
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF9E5',
    paddingTop: 55,
  },
  topsection: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF9E5',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  bottomBar: {
    height: Dimensions.get('window').height * 0.15,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22668D',
    textAlign: 'center',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    borderRadius: 12,

  },
  section: {
    marginTop: 20,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  toggleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22668D',
    marginBottom: 8,
  },
  toggleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  colorBlock: {
    width: Dimensions.get('window').width / 3 - 20,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    elevation: 2,
  },
  colorBlockBig: {
    height: 250,
    width: '100%',
    borderRadius: 14,
  },
  colorLabel: {
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  colorCode: {
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
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
    right: 0,
    padding: 50,
  },
  help: {
    position: 'absolute',
    left: 0,
    padding: 50,
  },
});
