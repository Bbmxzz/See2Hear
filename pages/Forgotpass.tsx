import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Tts from 'react-native-tts';

type ForgotPassScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  'Forgotpass'
>;

type Props = {
  navigation: ForgotPassScreenProp;
};

export default function Forgotpass({ navigation }: Props) {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')
  const [email, setEmail] = useState('');

  const handleEmailCheck = async () => {
    if (!email.trim()) {
      Alert.alert('Please enter your email');
      Tts.speak('Please enter your email');
      return;
    }

    try {
      const res = await axios.post('http://192.168.11.193:8080/check-email', { email });
      if (res.data.exists) {
        Tts.speak('Email found. Please reset your password.');
        navigation.navigate('Resetpass', { email });
      } else {
        Alert.alert('Email not found');
        Tts.speak('Email not found');
      }
    } catch (error) {
      Alert.alert('Error checking email');
      Tts.speak('Error checking email');
    }
  };

  return (
    <LinearGradient
      colors={['#8ECDDD', '#22668D']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={styles.card}>
          <Text style={styles.headtext}>Forgot your</Text>
          <Text style={styles.headtext}>password?</Text>
          <Text style={styles.subtitle}>
            Please enter your email address to reset your password
          </Text>

          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="rgb(77, 118, 141)"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            spellCheck={false}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleEmailCheck}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            navigation.navigate('Login');
            Tts.speak('Back to login.');
          }}>
            <Text style={styles.link}>&lt;- Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8ECDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '85%',
  },
  card: {
    backgroundColor: '#FBF8EF',
    paddingHorizontal: 30,
    paddingVertical: 35,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
  },
  headtext: {
    color: '#22668D',
    fontWeight: '700',
    fontSize: 34,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgb(68, 166, 191)',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#22668D',
    borderWidth: 2,
    borderColor: 'rgb(34, 102, 141)',
    width: '100%',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#FFC45B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    shadowColor: '#EBA917',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    color: 'rgb(68, 166, 191)',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
});
