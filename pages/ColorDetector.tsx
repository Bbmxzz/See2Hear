import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  getAverageColor,
  getPalette,
  getSegmentsAverageColor,
  type PaletteResult,
} from '@somesoap/react-native-image-palette';
import chroma from 'chroma-js';

type Props = {
  route: {
    params: {
      imagePath: string;
    };
  };
};

export default function ColorDetector({ route }: Props) {
  const imagePath = route.params.imagePath;

  const [averageColor, setAverageColor] = useState<string>('');
  const [palette, setPalette] = useState<PaletteResult | null>(null);
  const [avgSectors, setAvgSectors] = useState<string[]>([]);

  useEffect(() => {
    const uri = `file://${imagePath}`;

    getAverageColor(uri)
      .then(setAverageColor)
      .catch(console.error);

    getPalette(uri)
      .then(setPalette)
      .catch(console.error);

    getSegmentsAverageColor(
      uri,
      [
        { fromX: 0, toX: 33, fromY: 0, toY: 33 },
        { fromX: 34, toX: 66, fromY: 0, toY: 33 },
        { fromX: 67, toX: 100, fromY: 0, toY: 33 },
        { fromX: 0, toX: 33, fromY: 34, toY: 66 },
        { fromX: 34, toX: 66, fromY: 34, toY: 66 },
        { fromX: 67, toX: 100, fromY: 34, toY: 66 },
        { fromX: 0, toX: 33, fromY: 67, toY: 100 },
        { fromX: 34, toX: 66, fromY: 67, toY: 100 },
        { fromX: 67, toX: 100, fromY: 67, toY: 100 },
      ],
      { pixelSpacingAndroid: 2 }
    )
      .then(setAvgSectors)
      .catch(console.error);
  }, [route.params.imagePath]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Color Detector</Text>
      <Image source={{ uri: `file://${imagePath}` }} style={styles.image} />

      <Text style={styles.sectionTitle}>Segmented Average Colors</Text>
      <View style={styles.grid}>
        {avgSectors.map((color, idx) => (
          <ColorBlock
            key={idx}
            color={color}
            label={`#${idx + 1} - ${getSimpleColorName(color)}`}
          />
        ))}
      </View>

      {averageColor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Average Color</Text>
          <ColorBlock
            color={averageColor}
            label={getSimpleColorName(averageColor)}
          />
        </View>
      )}

      {palette && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palette</Text>
          <View style={styles.palette}>
            {Object.entries(palette).map(([name, color]) => (
              <ColorBlock
                key={name}
                color={color}
                label={`${name} - ${getSimpleColorName(color)}`}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function ColorBlock({ color, label }: { color: string; label?: string }) {
  return (
    <View style={[styles.colorBlock, { backgroundColor: color }]}>
      {label && <Text style={styles.colorLabel}>{label}</Text>}
      <Text style={styles.colorCode}>{color}</Text>
    </View>
  );
}

// 🟡 ชื่อสีง่ายๆจากค่า HSL
function getSimpleColorName(hex: string): string {
  const [h, s, l] = chroma(hex).hsl();

  if (s < 0.15) {
    if (l < 0.2) return 'black';
    if (l > 0.8) return 'white';
    return 'gray';
  }

  if (h >= 0 && h < 20) return l < 0.4 ? 'dark red' : 'red';
  if (h >= 20 && h < 40) return 'orange';
  if (h >= 40 && h < 65) return 'yellow';
  if (h >= 65 && h < 170) return 'green';
  if (h >= 170 && h < 260) return 'blue';
  if (h >= 260 && h < 290) return 'purple';
  if (h >= 290 && h < 330) return 'pink';
  return 'red';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorBlock: {
    width: Dimensions.get('window').width / 3 - 20,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
  },
  colorLabel: {
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  colorCode: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
});
