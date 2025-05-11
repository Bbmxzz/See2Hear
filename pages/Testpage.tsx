import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function TranslateScreen() {
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        const response = await axios.post('https://translate.argosopentech.com/translate', {
          q: 'Good morning',
          source: 'en',
          target: 'tha',
          format: 'text',
        });

        setTranslatedText(response.data.translatedText);
      } catch (error) {
        setTranslatedText('Translation failed');
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thai Translation</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : (
        <Text style={styles.translation}>{translatedText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  translation: {
    fontSize: 20,
    color: '#0066cc',
  },
});
