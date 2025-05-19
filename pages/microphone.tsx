import React, {JSX, useEffect, useState} from 'react';
import {PermissionsAndroid, SafeAreaView, Text} from 'react-native';

const MicPermissions = () => {
  const [audioAccessGranted, setAudioAccessGranted] = useState(false);

  useEffect(() => {
    requestMicPermission();
  },[]);

  const requestMicPermission = async() => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
        setAudioAccessGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
    } catch(err) {
      return setAudioAccessGranted(false);
    }
  };

  return (
    <>
      <Text style={{fontSize: 40}}>
        {audioAccessGranted ? 'Can use microphone':'Access'}
      </Text>
    </>
  );
};
function microphonetest(): JSX.Element {
  return(
    <SafeAreaView>
      <MicPermissions/>
    </SafeAreaView>
    );
}
export default microphonetest;