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
  'Login'
>;
type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function Login({ navigation }: Props) {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const handleLogin = async () => {
    try{
      const res = await axios.post('http://192.168.11.193:8080/login',{
        email,
        password,
      });
      if (res.data.success){
        Tts.speak('Login succesful');
        navigation.navigate('Homepage');
      }
    } catch (err) {
      Alert.alert('Login failed');
      Tts.speak('Login failed');
    }
  };
  return (
    <LinearGradient
      colors={['#8ECDDD', '#22668D']}
      style={styles.linearGradient}
    >
      <View style={styles.card}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TextInput
          placeholder="example@gmail.com"
          placeholderTextColor="rgb(77, 118, 141)"
          value={email}
          onChangeText={val => setEmail(val)}
          style={styles.input}
          autoCapitalize="none"
          spellCheck={false}
        />
        <View style={{ marginVertical: 12 }} />
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={hidePassword}
            placeholder="Password"
            placeholderTextColor="rgb(77, 118, 141)"
            value={password}
            onChangeText={val => setPassword(val)}
            style={styles.passwordInput}
            autoCapitalize="none"
            spellCheck={false}
          />
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Icon
              name={hidePassword ? 'eye-off' : 'eye'}
              size={24}
              color="rgb(34, 102, 141)"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.bottomTextContainer}>
          <TouchableOpacity onPress={() => {
            navigation.navigate('Forgotpass');
            Tts.speak('Forgot your password?');
          }}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => {
            //
            //
            //
            //
            //
            navigation.navigate('RoboflowScreen');
            Tts.speak('Go to signup page.')
          }}>
            <Text style={styles.link}>Signup</Text>
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
    // height: '85%',
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
    borderColor:'rgb(34, 102, 141)',
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: 'rgb(34, 102, 141)',
  },
  loginButton: {
    backgroundColor:'#FFC45B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
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
