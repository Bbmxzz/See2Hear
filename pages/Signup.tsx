import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Tts from 'react-native-tts';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;
type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function Signup({ navigation }: Props) {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpass, setconfirmpass] = useState('');
  const [hidePassword1, setHidePassword1] = useState(true);
  const [hidePassword2, setHidePassword2] = useState(true);

  const handleSignup = async () => {
    if (!email || !password || !confirmpass) {
      Alert.alert('Please fill in all fields');
      Tts.speak('Please fill in all fields');
      return;
    }
    if (password !== confirmpass) {
      Alert.alert('Password do not match');
      Tts.speak('Password do not match');
      return;
    }
    try {
      const res = await axios.post('http://192.168.11.193:8080/signup', {
        email,
        password,
      });

      if (res.data.success) {
        Alert.alert('Signup successful');
        Tts.speak('Signup successful');
        navigation.navigate('Login');
      } else {
        Alert.alert('Signup Failed', res.data.message || '');
        Tts.speak('Signup failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 409) {
            Alert.alert('Email already exists');
            Tts.speak('Email already exists');
            
          } else {
            Alert.alert('Error', err.response.data.message || 'Could not connect to server');
          }
        } else if (err.request) {
          Alert.alert('Error', 'Could not connect to server');
        }
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  return (
    <LinearGradient colors={['#8ECDDD', '#22668D']} style={styles.linearGradient}>
      <View style={styles.card}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <TextInput
          placeholder="example@gmail.com"
          placeholderTextColor="rgb(77, 118, 141)"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          spellCheck={false}
        />
        <View style={{ marginVertical: 12 }} />
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={hidePassword1}
            placeholder="Create password"
            placeholderTextColor="rgb(77, 118, 141)"
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            autoCapitalize="none"
            spellCheck={false}
          />
          <TouchableOpacity onPress={() => setHidePassword1(!hidePassword1)}>
            <Icon name={hidePassword1 ? 'eye-off' : 'eye'} size={24} color="rgb(34, 102, 141)" />
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 12 }} />
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={hidePassword2}
            placeholder="Confirm password"
            placeholderTextColor="rgb(77, 118, 141)"
            value={confirmpass}
            onChangeText={setconfirmpass}
            style={styles.passwordInput}
            autoCapitalize="none"
            spellCheck={false}
          />
          <TouchableOpacity onPress={() => setHidePassword2(!hidePassword2)}>
            <Icon name={hidePassword2 ? 'eye-off' : 'eye'} size={24} color="rgb(34, 102, 141)" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Signup</Text>
        </TouchableOpacity>
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>Have an account already? </Text>
          <TouchableOpacity onPress={() => {
            navigation.navigate('Login');
            Tts.speak('Go to login page');
          }}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FBF8EF',
    paddingRight: 25,
    paddingLeft: 25,
    borderRadius: 12,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    minHeight: '85%',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 15,
    fontSize: 14,
    color: 'rgb(34, 102, 141)',
    borderWidth: 2,
    borderColor: 'rgb(34, 102, 141)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: 'rgb(34, 102, 141)',
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: 'rgb(34, 102, 141)',
  },
  signupButton: {
    backgroundColor: '#FFC45B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  bottomText: {
    color: '#333',
    fontSize: 13,
  },
  link: {
    color: 'rgb(68, 166, 191)',
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 30,
  },
});
