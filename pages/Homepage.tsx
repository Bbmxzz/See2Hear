import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Homepage'
>

type Props = {
    navigation: HomeScreenNavigationProp;
}

export default function Homepage({navigation}: Props){
    return((
        <View style={styles.container}>          
            <View style={styles.feature}>
                <TouchableOpacity onPress={() => navigation.navigate('Cameratest')}>
                    <Text style={styles.textFeature}>Scan</Text>
                </TouchableOpacity>
            </View>       
            <View style={styles.feature}>
                <TouchableOpacity onPress={() => navigation.navigate('Cameratest')}>
                    <Text style={styles.textFeature}>Color</Text>
                </TouchableOpacity>
            </View>     
            <View style={styles.feature}>
                <TouchableOpacity onPress={() => navigation.navigate('Cameratest')}>
                    <Text style={styles.textFeature}>Translate</Text>
                </TouchableOpacity>
            </View>  
            <View style={styles.feature}>
                <TouchableOpacity onPress={() => navigation.navigate('Cameratest')}>
                    <Text style={styles.textFeature}>Qr/Barcode</Text>
                </TouchableOpacity>
            </View>  
            
        </View>
    ))
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    width: '50%',
    height: '45%',
    backgroundColor: 'black',
  },
  textFeature: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }

})