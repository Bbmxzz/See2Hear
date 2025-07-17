import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native'; 
import { RootStackParamList } from '../App';
import Tts from 'react-native-tts';
import DoubleClick from 'double-click-react-native';

Tts.setDefaultLanguage('en-US');
Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact');

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Cameratest'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: {
    params: {
      feature: 'Scantext' | 'ColorDetector' | 'Translate' | 'RoboflowScreen';
    };
  };
};

export default function Cameratest({ navigation, route }: Props) {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const [showCamera, setShowCamera] = useState(false);
  const [imageSource, setImageSource] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    (async () => {
      await Camera.requestCameraPermission();
    })();
  }, []);

  const capturePhoto = async () => {
    if (!camera.current) return;

    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      const originalPath = `file://${photo.path}`;
      setImageSource(originalPath);

      Image.getSize(originalPath, (width, height) => {
        setImageSize({ width, height });
        setShowCamera(false);
      });
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };

  const uploadFromLibrary = () => {
    Tts.speak('Upload a photo');
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const uri = asset.uri || '';
        if (uri) {
          Image.getSize(
            uri,
            (width, height) => {
              setImageSource(uri);
              setImageSize({ width, height });
            },
            (err) => {
              console.error('Gallery getSize failed:', err);
              setImageSource(uri);
            }
          );
        }
      }
    });
  };

  
  const navigateToFeature = () => {
    const feature = route.params.feature;
    const imagePath = imageSource;

    let targetScreen = '';
    if (feature === 'Translate') {
      targetScreen = 'Translate';
    } else if (feature === 'Scantext') {
      targetScreen = 'Scantext';
    } else if (feature === 'ColorDetector') {
      targetScreen = 'ColorDetector';
    } else if (feature === 'RoboflowScreen') {
      targetScreen = 'RoboflowScreen';
    }

    if (targetScreen !== '') {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Homepage' },
            { name: targetScreen, params: { imagePath } },
          ],
        })
      );
    }
  };

  if (!device) return <Text>Camera not available</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showCamera ? (
          <>
            <View style={styles.cameraContainer}>
              <Camera
                ref={camera}
                style={styles.camera}
                device={device}
                isActive={showCamera}
                photo={true}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.camButton} onPress={capturePhoto} />
            </View>
          </>
        ) : (
          <>
            {imageSource !== '' && (
              <Image
                style={[
                  styles.image,
                  imageSize.width > 0 &&
                    imageSize.height > 0 && {
                      aspectRatio: imageSize.width / imageSize.height,
                    },
                ]}
                source={{ uri: imageSource }}
                resizeMode="contain"
              />
            )}
            {!showCamera && imageSource === '' && (
              <View style={styles.backButton}>
                <DoubleClick
                  singleTap={() => {
                    Tts.speak('Take a photo');
                  }}
                  doubleTap={() => {
                    setShowCamera(true);
                    Tts.speak('Take a photo');
                  }}
                  delay={300}
                  style={styles.takeaPhotoBtn}
                >
                  <Text style={styles.backText}>Take a Photo</Text>
                </DoubleClick>
                <DoubleClick
                  singleTap={() => {
                    Tts.speak('Upload a photo');
                  }}
                  doubleTap={uploadFromLibrary}
                  delay={300}
                  style={styles.takeaPhotoBtn}
                >
                  <Text style={styles.backText}>Upload a Photo</Text>
                </DoubleClick>
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
                      Tts.speak('Retake');
                    }}
                  >
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.useBtn}
                    onPress={() => {
                      navigateToFeature();
                      Tts.speak('Use photo');
                    }}
                  >
                    <Text style={styles.useText}>Use Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E5',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF9E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  backButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  takeaPhotoBtn: {
    backgroundColor: '#4D768D',
    height: '47.5%',
    marginBottom: '2.5%',
    marginTop: '2.5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: '#fff',
    width: '100%',
  },
  backText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  retakeText: {
    color: '#77c3ec',
    fontWeight: '500',
    fontSize: 16,
  },
  useBtn: {
    backgroundColor: '#77c3ec',
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  useText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});
