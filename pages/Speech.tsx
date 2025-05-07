import React from 'react'
import { Button } from 'react-native'
import Tts from 'react-native-tts'
 
//Tts.setDefaultLanguage('en-GB')
Tts.setDefaultLanguage('ja-JP');

Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')
 
const Speech = () => (
 <Button
   title="Speak!"
  //  onPress={() => Tts.speak('Hello World!')}
   onPress={() => Tts.speak('こんにちは、元気ですか')}
 />
)
 
export default Speech