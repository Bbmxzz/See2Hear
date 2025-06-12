import React, { useState } from 'react';
import {
  View,
  Button,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

export default function RoboflowScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  const IMAGE_DISPLAY_WIDTH = 300;
  const IMAGE_DISPLAY_HEIGHT = 300;

  const ROBFLOW_API =
    'https://detect.roboflow.com/pricetag-vnluk/1?api_key=aBPcgn7xI7UGZm1uHn82';

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

  return (
    <View style={styles.container}>
      <Button title="Pick Image" onPress={pickImage} />

      {imageUri && (
        <>
          {/* ภาพแรก: ภาพปกติ */}
          <View style={{ marginTop: 20 }}>
            <Text>Original Image</Text>
            <Image
              source={{ uri: imageUri }}
              style={{ width: IMAGE_DISPLAY_WIDTH, height: IMAGE_DISPLAY_HEIGHT, resizeMode: 'contain' }}
            />
          </View>

          {/* ภาพที่สอง: เป็นกรอบ (bounding box) ทับบนภาพโปร่งใส */}
          <View style={{ marginTop: 20, position: 'relative', width: IMAGE_DISPLAY_WIDTH, height: IMAGE_DISPLAY_HEIGHT }}>
            <Text>Bounding Boxes Overlay</Text>
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            />

            {result?.predictions &&
              result.predictions.map((pred: any, index: number) => {
                // const scaleX = IMAGE_DISPLAY_WIDTH / imageSize.width;
                // const scaleY = IMAGE_DISPLAY_HEIGHT / imageSize.height;

                // const left = (pred.x - pred.width / 2) * scaleX;
                // const top = (pred.y - pred.height / 2) * scaleY;
                // const width = pred.width * scaleX;
                // const height = pred.height * scaleY;

                return (
                  <View
                    key={index}
                    style={[
                      // styles.boundingBox,
                      // {
                      //   position: 'absolute',
                      //   left,
                      //   top,
                      //   width,
                      //   height,
                      // },
                    ]}
                  >
                    <Text style={styles.label}>{pred.class}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  boundingBox: {
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
