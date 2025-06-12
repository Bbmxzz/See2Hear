import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import axios from 'axios';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/FontAwesome5';

type Props = {
  route: { params: { imagePath: string } };
};
interface ProductInfo {
  name: string;
  brand: string;
  image: string;
  quantity: string;
}

export default function ScanBarcode({ route }: Props) {
  const { imagePath } = route.params;
  const [barcodes, setBarcodes] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, ProductInfo | null>>({});
  const [loading, setLoading] = useState(true);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [lastSpeakText, setLastSpeakText] = useState<string>('');
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    Image.getSize(
      `file://${imagePath}`,
      (width, height) => {
        const ratio = width / height;
        let displayWidth = screenWidth * 0.95;
        let displayHeight = displayWidth / ratio;
        if (displayHeight > screenHeight * 0.5) {
          displayHeight = screenHeight * 0.5;
          displayWidth = displayHeight * ratio;
        }
        setImageSize({ width: displayWidth, height: displayHeight });
      },
      (error) => console.error('Failed to get image size:', error)
    );

    const scanAndFetch = async () => {
      try {
        const result = await BarcodeScanning.scan(`file://${imagePath}`);
        setBarcodes(result);

        const productData: Record<string, ProductInfo | null> = {};

        for (const barcode of result) {
          if (isBarcode(barcode.value)) {
            const product = await fetchProductInfo(barcode.value);
            productData[barcode.value] = product;
          } else {
            productData[barcode.value] = null;
          }
        }

        setProducts(productData);

        if (result.length > 0) {
          const first = result[0];
          if (isBarcode(first.value) && productData[first.value]) {
            const p = productData[first.value];
            setLastSpeakText(`${p?.name}. Brand: ${p?.brand}. Quantity: ${p?.quantity}.`);
          } else {
            setLastSpeakText(first.value);
          }
        } else {
          setLastSpeakText('No barcodes detected.');
        }
      } catch (e) {
        console.warn('Barcode scan error:', e);
        setLastSpeakText('Failed to scan barcodes.');
      } finally {
        setLoading(false);
      }
    };
    scanAndFetch();
  }, [imagePath]);

  const isBarcode = (value: string) => /^[0-9]{8,14}$/.test(value);
  const isValidUrl = (text: string) => /^https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(text);

  const fetchProductInfo = async (barcode: string): Promise<ProductInfo | null> => {
    try {
      const res = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (res.data.status === 1) {
        const p = res.data.product;
        return {
          name: p.product_name || 'Unknown product',
          brand: p.brands || 'Unknown brand',
          image: p.image_front_url || '',
          quantity: p.quantity || 'N/A',
        };
      }
      return null;
    } catch (error) {
      console.error('API fetch error:', error);
      return null;
    }
  };

  const speakText = (text: string) => {
    Tts.stop();
    Tts.speak(text);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Scanned Image</Text>
        <Image
          source={{ uri: `file://${imagePath}` }}
          style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
          resizeMode="contain"
          accessible
          accessibilityLabel="Scanned image"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#3178c6" style={{ marginTop: 30 }} />
        ) : (
          <>
            <Text style={styles.subtitle}>Detected QR/Barcode</Text>
            {barcodes.length === 0 && (
              <Text style={styles.noBarcodesText}>No barcodes detected in this image.</Text>
            )}

            {barcodes.map(({ value, format }, index) => {
              const product = products[value];
              const link = isValidUrl(value);

              return (
                <View key={index} style={styles.card} accessible accessibilityRole="summary">
                  <Text style={styles.barcodeValue}>
                    {value} <Text style={styles.barcodeFormat}>({format})</Text>
                  </Text>

                  {isBarcode(value) ? (
                    product ? (
                      <>
                        {product.image ? (
                          <Image
                            source={{ uri: product.image }}
                            style={styles.productImage}
                            accessible
                            accessibilityLabel={`Product image of ${product.name}`}
                          />
                        ) : (
                          <View style={styles.noImageBox}>
                            <Text style={styles.noImageText}>No image available</Text>
                          </View>
                        )}

                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productBrand}>Brand: {product.brand}</Text>
                        <Text style={styles.productQuantity}>Quantity: {product.quantity}</Text>
                      </>
                    ) : (
                      <Text style={styles.noDataText}>No product info found.</Text>
                    )
                  ) : link ? (
                    <Text
                      style={styles.linkText}
                      onPress={() => Linking.openURL(value)}
                      accessible
                      accessibilityRole="link"
                      accessibilityLabel={`Open link ${value}`}
                    >
                      Open Link
                    </Text>
                  ) : (
                    <Text style={styles.genericText}>Scanned value: {value}</Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingSpeakButton}
        onPress={() => speakText(lastSpeakText)}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Read aloud scanned information"
        accessibilityHint="Reads the scanned product or barcode information aloud"
      >
          <Icon name="volume-up" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9E5',
    paddingTop: 60,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22668D',
    textAlign: 'center',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 12,
    color: '#22668D',
    alignSelf: 'flex-start',
  },
  image: {
    borderRadius: 12,
    backgroundColor: '#e1e9f5',
  },
  noBarcodesText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00000020',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  barcodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  barcodeFormat: {
    fontWeight: '400',
    color: '#666',
  },
  productImage: {
    width: 180,
    height: 180,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  noImageBox: {
    width: 180,
    height: 180,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  noImageText: {
    color: '#bbb',
    fontSize: 14,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  productBrand: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#3178c6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  genericText: {
    fontSize: 15,
    color: '#444',
  },
  floatingSpeakButton: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    backgroundColor: '#22668D',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
