import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import RNPhotoManipulator from 'react-native-photo-manipulator';
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Tts from 'react-native-tts';
import { WebView } from 'react-native-webview';

type Props = {
  route: { params: { imagePath: string } };
};

export default function Pricetag({ route }: Props) {
  const { imagePath } = route.params;
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [recognizedInfoList, setRecognizedInfoList] = useState<any[]>([]);
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const [listening, setListening] = useState(false);
  const isSpeakingRef = useRef(true);

  const ROBFLOW_API = 'https://detect.roboflow.com/pricetag-vnluk/3?api_key=aBPcgn7xI7UGZm1uHn82';
  const screenWidth = Dimensions.get('window').width;
  const maxHeight = 400;

  const convertNumbersToJapanese = (text: string): string => {
    const digitMap: { [key: string]: string } = {
      '0': 'ぜろ', '1': 'いち', '2': 'に', '3': 'さん', '4': 'よん',
      '5': 'ご', '6': 'ろく', '7': 'なな', '8': 'はち', '9': 'きゅう'
    };
    return text.replace(/\d+/g, (num) =>
      num.split('').map((d) => digitMap[d] || d).join('')
    );
  };

  const findFeatureByCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes('read') || lower.includes('scan') || lower.includes('price') || lower.includes('tag') || lower.includes('detect') || lower.includes('scanner') || lower.includes('detector')) {
      handleSpeakContent();
    } else {
      Tts.speak("Sorry, I didn't catch that.");
    }
  };

  // const handleSpeakLabel = async () => {
  //   try {
  //     await Tts.setDefaultLanguage('en-US');
  //     Tts.speak('This is the price tag scanner screen. At the bottom, there are 3 buttons. At the right is');
  //   } catch(error) {
  //     console.error('TTS label error:', error);
  //   }
  // };

  const handleSpeakContent = async () => {
    try {
      if (recognizedInfoList.length === 0) {
        Tts.speak("No price tag information detected.");
        return;
      }

      const texts = recognizedInfoList.map((info) => {
        const parts = [];
        if (info.name) parts.push(`Product: ${info.name}`);
        if (info.brand) parts.push(`Brand: ${info.brand}`);
        if (info.quantity) parts.push(`Quantity: ${info.quantity}`);
        if (info.price) parts.push(`Price: ${info.price}`);
        if (info.vat) parts.push(`VAT: ${info.vat}`);
        return parts.join(', ');
      });

      const combined = texts.join('. ');
      const segments = combined.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}0-9]+|[a-zA-Z\s.,:¥$]+/gu) || [];

      for (const segment of segments) {
        if (!isSpeakingRef.current) break;

        const isJapanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(segment);
        const spoken = isJapanese && /\d/.test(segment) ? convertNumbersToJapanese(segment) : segment;

        await Tts.setDefaultLanguage(isJapanese ? 'ja-JP' : 'en-US');
        await Tts.setDefaultRate(isJapanese ? 0.4 : 0.5);
        Tts.speak(spoken);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  useEffect(() => {
    isSpeakingRef.current = true;

    if (imagePath) {
      setLoading(true);
      Image.getSize(
        imagePath,
        async (width, height) => {
          setImageSize({ width, height });
          await sendToRoboflow(imagePath);
        },
        (err) => {
          console.error('GetSize error:', err);
          setLoading(false);
        }
      );
    }

    return () => {
      Tts.stop();
      setListening(false);
      isSpeakingRef.current = false;
    };
  }, [imagePath]);

  const sendToRoboflow = async (uri: string) => {
    const form = new FormData();
    form.append('file', {
      uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const res = await fetch(ROBFLOW_API, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      setResult(json);
      assignColors(json.predictions);

      setTimeout(() => {
        cropImageWithPriceTags(json);
      }, 2000);
    } catch (err) {
      console.error('Roboflow error:', err);
      setResult({ error: true });
      setLoading(false);
    }
  };

  const assignColors = (predictions: any[]) => {
    const colors = ['red', 'green', 'blue', 'orange', 'purple', 'cyan'];
    const newMap: { [key: string]: string } = {};
    let colorIndex = 0;
    predictions.forEach((p) => {
      if (!newMap[p.class]) {
        newMap[p.class] = colors[colorIndex % colors.length];
        colorIndex++;
      }
    });
    setColorMap(newMap);
  };

  const cropImageWithPriceTags = async (json: any) => {
    setLoading(true);
    const tags = json?.predictions?.filter((p: any) => p.class === 'priceTag');
    if (!tags || tags.length === 0) {
      setLoading(false);
      return;
    }

    const croppedUris: string[] = [];
    const allInfos: any[] = [];

    for (let tag of tags) {
      const cropRegion = {
        x: Math.max(0, tag.x - tag.width / 2),
        y: Math.max(0, tag.y - tag.height / 2),
        width: tag.width,
        height: tag.height,
      };

      try {
        const cropped = await RNPhotoManipulator.crop(imagePath, cropRegion, {
          width: tag.width,
          height: tag.height,
        });
        croppedUris.push(cropped);

        const subBoxes = json.predictions
          .filter((p: any) =>
            p.class !== 'priceTag' &&
            p.x >= cropRegion.x &&
            p.x <= cropRegion.x + cropRegion.width &&
            p.y >= cropRegion.y &&
            p.y <= cropRegion.y + cropRegion.height
          )
          .map((p: any) => ({
            ...p,
            x: p.x - cropRegion.x,
            y: p.y - cropRegion.y,
          }));

        const info = await extractTagInfo(cropped, subBoxes);
        allInfos.push(info);
      } catch (err) {
        console.error('Crop or OCR error:', err);
      }
    }

    setCroppedImages(croppedUris);
    setRecognizedInfoList(allInfos);
    setLoading(false);
  };

  const extractTagInfo = async (croppedPath: string, boxes: any[]): Promise<any> => {
    const info: any = {};
    for (let p of boxes) {
      const boxCrop = {
        x: Math.max(0, p.x - p.width / 2),
        y: Math.max(0, p.y - p.height / 2),
        width: p.width,
        height: p.height,
      };
      try {
        const croppedTag = await RNPhotoManipulator.crop(
          croppedPath,
          boxCrop,
          { width: boxCrop.width, height: boxCrop.height }
        );
        const ocr = await TextRecognition.recognize(
          `file://${croppedTag}`,
          TextRecognitionScript.JAPANESE
        );
        const text = ocr.blocks.flatMap(block => block.lines.map(line => line.text)).join(' ');
        if (p.class === 'brand') info.brand = text;
        if (p.class === 'name') info.name = text;
        if (p.class === 'quantity') info.quantity = text;
        if (p.class === 'price') info.price = text;
        if (p.class === 'vat') info.vat = text;
      } catch (err) {
        console.warn("OCR failed on box:", p.class, err);
      }
    }
    return info;
  };

  const scaledHeight = Math.min((imageSize.height * screenWidth) / imageSize.width, maxHeight);

  const renderBoxes = (
    predictions: any[],
    imageWidth: number,
    imageHeight: number,
    colorMap: { [key: string]: string }
  ) => {
    const scale = Math.min(screenWidth / imageWidth, scaledHeight / imageHeight);
    const offsetX = (screenWidth - imageWidth * scale) / 2;
    const offsetY = (scaledHeight - imageHeight * scale) / 2;

    return predictions.map((p, index) => {
      const color = colorMap[p.class] || 'black';
      const boxWidth = p.width * scale;
      const boxHeight = p.height * scale;
      const left = p.x * scale - boxWidth / 2 + offsetX;
      const top = p.y * scale - boxHeight / 2 + offsetY;

      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            left,
            top,
            width: boxWidth,
            height: boxHeight,
            borderWidth: 2,
            borderColor: color,
            backgroundColor: `${color}33`,
          }}
        />
      );
    });
  };

  const renderLegend = (colorMap: { [key: string]: string }) => (
    <View style={styles.legendContainer}>
      {Object.entries(colorMap).map(([cls, color]) => (
        <View key={cls} style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: color }]} />
          <Text style={styles.legendLabel}>{cls}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topsection}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.container}>
            <Text style={styles.header}>Price Tag Scanner</Text>
            <View style={[styles.imageWrapper, { width: screenWidth, height: scaledHeight }]}>
              <Image
                source={{ uri: imagePath }}
                style={{ width: screenWidth, height: scaledHeight }}
                resizeMode="contain"
              />
              {result && renderBoxes(result.predictions, result.image.width, result.image.height, colorMap)}
            </View>

            {result && renderLegend(colorMap)}
            {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />}

            {croppedImages.map((uri, index) => {
              const info = recognizedInfoList[index] || {};
              return (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>Price Tag #{index + 1}</Text>
                  <View style={styles.cardContent}>
                    <Image source={{ uri }} style={styles.tagImage} />
                    <View style={styles.info}>
                      {info.name && <Text style={styles.infoText}>Product: {info.name}</Text>}
                      {info.brand && <Text style={styles.infoText}>Brand: {info.brand}</Text>}
                      {info.quantity && <Text style={styles.infoText}>Quantity: {info.quantity}</Text>}
                      {info.price && <Text style={styles.infoText}>Price: {info.price}</Text>}
                      {info.vat && <Text style={styles.infoText}>VAT: {info.vat}</Text>}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
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
        <TouchableOpacity
          style={styles.help}
          // onPress={handleSpeakLabel}
        >
          <Icon name="comment-dots" size={28} color="#22668D"solid/>
        </TouchableOpacity>
      </View>

      {listening && (
        <View style={{ position: 'absolute', width: 0, height: 0, top: 0, left: 0, pointerEvents: 'none' }}>
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
                // Do nothing
// 
// 
// 
// 
//                 
                Tts.speak("Can't recognize speech.");
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
    backgroundColor: 'white',
  },
  container: {
    alignItems: 'center',
    margin: 20,
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
    paddingTop: 35,
  },
  imageWrapper: {
    position: 'relative',
    marginTop: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#22668D',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
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
  help: {
    position: 'absolute',
    left: 50,
  },
});
