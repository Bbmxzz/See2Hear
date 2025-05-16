import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import axios from 'axios';

type Props = {
  route: { params: { imagePath: string }};
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
  const [imageDisplaSize, setImageDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    Image.getSize(
      `file://${imagePath}`,
      (width, height) => {
        const ratio = width / height;
        let displayWidth = screenWidth;
        let displayHeight = displayWidth / ratio;

        if (displayHeight > screenHeight * 0.7) {
          displayHeight = screenHeight * 0.7;
          displayWidth = displayHeight * ratio;
        }
        setImageDisplaySize({ width: displayWidth, height: displayHeight });
      },
      (error) => console.error('Error loading image size:', error)
    );
    const scan = async () => {
      try {
        const result = await BarcodeScanning.scan(`file://${imagePath}`);
        setBarcodes(result);

        const productMap: Record<string, ProductInfo | null> = {};
        for (const barcode of result) {
          if (isBarcode(barcode.value)) {
            const product = await getProductInfo(barcode.value);
            productMap[barcode.value] = product;
          } else {
            productMap[barcode.value] = null;
          }
        }
        setProducts(productMap);
      } catch (e) {
        console.warn('Error scanning barcode:', e);
      } finally {
        setLoading(false);
      }
    };
    scan();
  }, [imagePath]);

  const isBarcode = (value: string) => {
    return /^[0-9]{8,14}$/.test(value);
  };
  const isValidUrl = (text: string) => {
    return /^https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(text);
  };

  const getProductInfo = async (barcode: string): Promise<ProductInfo | null> => {
    try{
      const res = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (res.data.status === 1) {
        const product = res.data.product;
        return {
          name: product.product_name || 'Unknown',
          brand: product.brands || 'Unknown',
          image: product.imagefront_url || '',
          quantity: product.quantity || 'Unknown',
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error('API error:', err);
      return null;
    }
  };
  return (
    <View style={{ flex:1, backgroundColor: '#FBF*EF' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source= {{uri: `file://${imagePath}` }}
          style= {[styles.image, {width: imageDisplaSize.width-20 , height: imageDisplaSize.height}]}
        />

        {loading ? (
          <ActivityIndicator size='large' color='#0000ff' style={{marginTop: 20}}/>
        ) : (
          barcodes.map((barcode, index) => {
            const value = barcode.value;
            const format = barcode.format;
            const product = products[value];
            const isLink = isValidUrl(value);

            return (
              <View key={index} style={styles.productInfo}>
                <Text style={styles.barcodeText}>
                  {value} ({format})
                </Text>

                {isBarcode(value) ? (
                  product ? (
                    <>
                      <Text style={styles.productText}>Product: {product.name}</Text>
                      <Text style={styles.productText}>Brand: {product.brand}</Text>
                      <Text style={styles.productText}>Quantity: {product.quantity}</Text>
                      {product.image ? (
                        <Image source={{uri: product.image}} style={styles.productImage}/>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.productText}>No product info available.</Text>
                  )
                ) : isLink ? (
                  <TouchableOpacity onPress={() => Linking.openURL(value)}>
                    <Text style={[styles.productText, {color: '#007bff'}]}>
                      Open Link →
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.productText}>Scanned Value: {value}</Text>
                )}
              </View>
            );
          })
        )}
        <View style={{height: 100}}/>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    borderRadius: 10,
    marginTop: '10%',
  },
  productInfo: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 5,
    elevation: 2,
  },
  barcodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
  },
})