import React, { useState, useEffect } from 'react';
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

  const ROBFLOW_API = 'https://detect.roboflow.com/pricetag-vnluk/2?api_key=aBPcgn7xI7UGZm1uHn82';
  const screenWidth = Dimensions.get('window').width;
  const maxHeight = 400;

  useEffect(() => {
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
      const cropX = tag.x - tag.width / 2;
      const cropY = tag.y - tag.height / 2;
      const cropRegion = {
        x: Math.max(0, cropX),
        y: Math.max(0, cropY),
        width: tag.width,
        height: tag.height,
      };
      const targetSize = {
        width: tag.width,
        height: tag.height,
      };

      try {
        const cropped = await RNPhotoManipulator.crop(imagePath, cropRegion, targetSize);
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

  const scaledHeight = Math.min(
    (imageSize.height * screenWidth) / imageSize.width,
    maxHeight
  );

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
        <TouchableOpacity style={styles.microphone}>
          <Icon name="microphone" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.volume}>
          <Icon name="volume-up" size={28} color="#22668D" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'white' },
  container: { alignItems: 'center', margin: 20 },
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
  info: { flex: 1 },
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
});
