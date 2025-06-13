import React, { useState } from 'react';
import {
  View,
  Button,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

export default function Pricetag() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  const ROBFLOW_API = 'https://detect.roboflow.com/pricetag-vnluk/1?api_key=aBPcgn7xI7UGZm1uHn82';

  const screenWidth = Dimensions.get('window').width;
  const expandFactor = 1.2;

  const pickImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri!;
        setImageUri(uri);
        setResult(null);
        setLoading(true);

        Image.getSize(
          uri,
          async (width, height) => {
            setImageSize({ width, height });
            await sendToRoboflow(uri);
          },
          (error) => {
            console.error('Cannot get image size:', error);
            setLoading(false);
          }
        );
      }
    });
  };

  const sendToRoboflow = async (uri: string) => {
    const form = new FormData();
    form.append('file', {
      uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch(ROBFLOW_API, {
        method: 'POST',
        body: form,
      });

      const json = await response.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      setResult({ error: true });
    }
    setLoading(false);
  };

  const rfWidth = result?.image?.width || imageSize.width;
  const rfHeight = result?.image?.height || imageSize.height;

  const scaleX = imageSize.width / rfWidth;
  const scaleY = imageSize.height / rfHeight;

  const pricetagPred = result?.predictions?.find((p: any) => p.class === 'pricetag');

  let cropRect = null;
  if (pricetagPred) {
    const centerX = pricetagPred.x * scaleX;
    const centerY = pricetagPred.y * scaleY;
    const width = pricetagPred.width * scaleX * expandFactor;
    const height = pricetagPred.height * scaleY * expandFactor;
    const x = Math.max(0, centerX - width / 2);
    const y = Math.max(0, centerY - height / 2);
    const maxWidth = Math.min(width, imageSize.width - x);
    const maxHeight = Math.min(height, imageSize.height - y);
    cropRect = { x, y, width: maxWidth, height: maxHeight };
  }

  const displayScale = cropRect ? screenWidth / cropRect.width : screenWidth / imageSize.width;
  const displayHeight = cropRect ? cropRect.height * displayScale : imageSize.height * displayScale;

  const colors = ['red', 'green', 'blue', 'orange', 'purple', 'cyan'];
  const classColorMap: { [key: string]: string } = {};
  let colorIndex = 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Button title="Pick Image" onPress={pickImage} />

        {imageUri && (
          <>
            <Text style={{ marginTop: 20, fontWeight: 'bold', fontSize: 15}}>
              Price Tag Detection
            </Text>

            <View
              style={{
                marginTop: 10,
                width: screenWidth,
                height: displayHeight,
                backgroundColor: '#eee',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: imageUri }}
                style={{
                  position: 'absolute',
                  left: cropRect ? -cropRect.x * displayScale : 0,
                  top: cropRect ? -cropRect.y * displayScale : 0,
                  width: imageSize.width * displayScale,
                  height: imageSize.height * displayScale,
                  resizeMode: 'cover',
                }}
              />
              {result?.predictions &&
                result.predictions.map((pred: any, index: number) => {
                  const x = pred.x * scaleX;
                  const y = pred.y * scaleY;
                  const w = pred.width * scaleX;
                  const h = pred.height * scaleY;

                  const left = cropRect ? (x - w / 2 - cropRect.x) * displayScale : (x - w / 2) * displayScale;
                  const top = cropRect ? (y - h / 2 - cropRect.y) * displayScale : (y - h / 2) * displayScale;
                  const width = w * displayScale;
                  const height = h * displayScale;

                  if (!classColorMap[pred.class]) {
                    classColorMap[pred.class] = colors[colorIndex % colors.length];
                    colorIndex++;
                  }
                  const color = classColorMap[pred.class];
                  return (
                    <View
                      key={index}
                      style={[
                        styles.boundingBox,
                        {
                          position: 'absolute',
                          left,
                          top,
                          width,
                          height,
                          borderColor: color,
                          backgroundColor: `${color}33`,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          styles.label,
                          {
                            backgroundColor: color,
                          },
                        ]}
                      >
                        {pred.class}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

        {result?.error && (
          <Text style={{ color: 'red', marginTop: 10 }}>Error sending to Roboflow</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    marginTop: 50,
    alignItems: 'center',
  },
  boundingBox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    position: 'absolute',
    top: -14,
    left: 0,
  },
});
