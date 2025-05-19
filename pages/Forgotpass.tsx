import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import LinearGradient from 'react-native-linear-gradient';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Forgotpass'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function Forgotpass({ navigation }: Props) {
  const [email, setEmail] = useState('');

  return (
    <LinearGradient
      colors={['#8ECDDD', '#22668D']}
      style={styles.linearGradient}
    >
      <View style={styles.card}>
        <View style={styles.headcontainer}>
          <Text style={styles.headtext}>Forgot your</Text>
        </View>
        <View style={styles.headcontainer}>
          <Text style={styles.headtext}>password?</Text>
        </View>
        <View style={{ marginVertical: 12 }} />
    
        <TextInput
          placeholder="example@gmail.com"
          placeholderTextColor="rgb(77, 118, 141)"
          value={email}
          onChangeText={val => setEmail(val)}
          style={styles.input}
          autoCapitalize="none"
          spellCheck={false}
        />

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.resetButtonText}>Reset password</Text>
        </TouchableOpacity>

        <View style={styles.bottomTextContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>&lt;- Back to Login</Text>
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
    height: '85%',
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
  resetButton: {
    backgroundColor:'rgb(255, 180, 51)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: 'rgb(68, 166, 191)',
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  headcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  
  headtext: {
    color: '#22668D',
    fontWeight: '700',
    fontSize: 35,
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
});
