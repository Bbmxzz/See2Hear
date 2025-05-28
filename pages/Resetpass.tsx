import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Resetpass'>;
type RouteProps = RouteProp<RootStackParamList, 'Resetpass'>;

type Props = {
    navigation: NavigationProp;
    route: RouteProps;
};

export default function Resetpass({ navigation, route }: Props) {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')
    const [password, setPassword] = useState('');
    const [hidePassword,setHidePassword] = useState(true);
    const email = route.params.email;

    const handleResetPassword = async () => {
        if (password.length < 6) {
            Alert.alert('Password must be at least 6 characters');
            return;
        }
        try {
            const response = await fetch('http://192.168.11.193:8080/reset-password',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({email, new_password: password}),
            });
            if (response.ok) {
                Alert.alert('Success','Password has been reset successfully', [
                    { text: 'OK', onPress: () => navigation.navigate('Login')},
                ]);
                Tts.speak('Password has been reset successfully');
            } else {
                Alert.alert('Failed', 'Failed to reset password');
                Tts.speak('Failed to reset password');
            }
        } catch (err) {
            Alert.alert('Error', 'Cannot connect to server');
            Tts.speak('Cannot connect to server')
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex:1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient
                colors={['#8ECDDD', '#22668D']}
                style={styles.container}
            >
                <View style={styles.card}>
                    <Feather name='lock' size={80} color='#22668D' style={{ marginBottom: 20 }}/>
                    <Text style={styles.headtext}>Set a new</Text>
                    <Text style={styles.headtext}>password</Text>
                    <Text style={styles.subtitle}>
                        Please enter your new password for security
                    </Text>
                    <View style={styles.input}>
                        <TextInput
                            placeholder="New password"
                            placeholderTextColor="rgb(77,118,141)"
                            secureTextEntry = {hidePassword}
                            value={password}
                            onChangeText={setPassword}
                            style={styles.passwordInput}
                        />
                        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                            <Icon 
                                name={hidePassword ? 'eye-off' : 'eye'}
                                size={24}
                                color="rgb(34, 102, 141)"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginVertical: 10 }} />
                    
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleResetPassword}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.resetButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => 
                        {navigation.navigate('Login');
                        Tts.speak('Back to login.');
                    }}>
                        <Text style={styles.link}>&lt;- Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#FBF8EF',
        paddingHorizontal: 30,
        paddingVertical: 35,
        borderRadius: 20,
        width: '85%',
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
        color: 'rgb(68,166,191)',
        fontWeight: '600',
        textDecorationLine: 'underline',
        fontSize: 15,
    },
});