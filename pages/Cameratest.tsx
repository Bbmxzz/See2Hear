import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Image as RNImage,
  Pressable
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
} from 'react-native-vision-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '../App';
import Tts from 'react-native-tts'

Tts.setDefaultLanguage('en-GB')
Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function Cameratest({ navigation }: Props) {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = useCameraDevice('back');

  const [showCamera, setShowCamera] = useState(false);
  const [imageSource, setImageSource] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    }
    getPermission();
  }, []);

  const capturePhoto = async () => {
    if (camera.current !== null) {
      const photo = await camera.current.takePhoto({});
      const path = photo.path;

      RNImage.getSize(
        `file://${path}`,
        (width, height) => {
          setImageSource(path);
          setImageSize({ width, height });
          setShowCamera(false);
        },
        (error) => {
          console.error('Failed to get image size:', error);
          setImageSource(path);
          setShowCamera(false);
        }
      );
    }
  };

  const uploadFromLibrary = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const path = asset.uri?.replace('file://', '') || '';
        if (path) {
          RNImage.getSize(
            `file://${path}`,
            (width, height) => {
              setImageSource(path);
              setImageSize({ width, height });
            },
            (error) => {
              console.error('Failed to get image size from gallery:', error);
              setImageSource(path);
            }
          );
        }
      }
    });
  };

  if (device == null) {
    return <Text>Camera not available</Text>;
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.camButton}
              onPress={capturePhoto}
            />
          </View>
        </>
      ) : (
        <>
          {imageSource !== '' ? (
            <Image
              style={[
                styles.image,
                imageSize.width > 0 &&
                  imageSize.height > 0 && {
                    aspectRatio: imageSize.width / imageSize.height,
                  },
              ]}
              source={{ uri: `file://${imageSource}` }}
              resizeMode="contain"
            />
          ) : null}

          {!showCamera && imageSource === '' && (
            <View style={styles.backButton}>
              <Pressable
                onPress={() => setShowCamera(true)}
                style={({ pressed }) => [
                  styles.takeaPhotoBtn,
                  pressed && styles.takeaPhotoBtnPressed,
                ]}
              >
                <Text style={styles.backText}>Take a Photo</Text>
              </Pressable>
              <Pressable
                onPress={uploadFromLibrary}
                style={({ pressed }) => [
                  styles.takeaPhotoBtn,
                  pressed && styles.takeaPhotoBtnPressed,
                ]}
              >
                <Text style={styles.backText}>Upload a Photo</Text>
              </Pressable>
            </View>
          )}

          {imageSource !== '' && (
            <View style={styles.buttonContainer}>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => {
                    setImageSource('');
                    setImageSize({ width: 0, height: 0 });
                  }}
                >
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.useBtn}
                  onPress={() =>
                    navigation.navigate('Scantext', { imagePath: imageSource })
                  }
                >
                  <Text style={styles.useText}>Use Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgb(251, 248, 239)',
  },
  backButton: {
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    top: 0,
    padding: 20,
  },
  takeaPhotoBtn: {
    // backgroundColor: '#FFB433',
    backgroundColor:'rgb(34, 102, 141)',
    paddingTop: '46%',
    paddingBottom: '46%',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: '#fff',
    width: '100%',
  },
  takeaPhotoBtnPressed: {
    // backgroundColor:'rgb(221, 146, 15)',
    backgroundColor:'rgb(17, 75, 109)',
  },
  backText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#B2BEB5',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  image: {
    width: '100%',
    maxHeight: '100%',
  },
  retakeBtn: {
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#77c3ec',
  },
  retakeText: {
    color: '#77c3ec',
    fontWeight: '500',
  },
  useBtn: {
    backgroundColor: '#77c3ec',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  useText: {
    color: 'white',
    fontWeight: '500',
  },
});
