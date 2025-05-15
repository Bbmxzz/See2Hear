import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {
  getAverageColor,
  getPalette,
  getSegmentsAverageColor,
  getSegmentsPalette,
  type PaletteResult,
} from '@somesoap/react-native-image-palette';

// const farm = require('./farm.jpeg');
// const image = 'https://i.imgur.com/68jyjZT.jpg';
// const image = 'https://i.imgur.com/O3XSdU7.jpg';
const image = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';


export default function App() {
  const [avgSectors, setAverageSectors] = useState<string[]>([]);
  const [averageColor, setAverageColor] = useState<string>('');
  const [palette, setPalette] = useState<Partial<PaletteResult>>({});

  useEffect(() => {
    getSegmentsAverageColor(
      image,
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
      .then(setAverageSectors)
      .catch(console.error);

    getSegmentsPalette(image, [
      { fromX: 0, toX: 33, fromY: 0, toY: 33 },
      { fromX: 34, toX: 66, fromY: 0, toY: 33 },
      { fromX: 67, toX: 100, fromY: 0, toY: 33 },

      { fromX: 0, toX: 33, fromY: 34, toY: 66 },
      { fromX: 34, toX: 66, fromY: 34, toY: 66 },
      { fromX: 67, toX: 100, fromY: 34, toY: 66 },

      { fromX: 0, toX: 33, fromY: 67, toY: 100 },
      { fromX: 34, toX: 66, fromY: 67, toY: 100 },
      { fromX: 67, toX: 100, fromY: 67, toY: 100 },
    ])
      .then((res) => {
        console.log({ res });
      })
      .catch(console.error);

    getPalette(image, {
      fallbackColor: '#ABABAB',
      headers: { Auth: 'Bearer 123' },
    })
      .then(setPalette)
      .catch(console.error);

    getAverageColor(image, {
      headers: { Auth: 'Bearer 123' },
    })
      .then(setAverageColor)
      .catch(console.error);
  }, []);

  return (
    <ScrollView bounces={false} style={styles.container}>
      <View style={{ backgroundColor: avgSectors[4], padding: 10 }}>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Image</Text>
        </View>
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={styles.img}
        />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Average colors</Text>
        </View>
      </View>
      <View style={styles.row}>
        {avgSectors[0] && <ColorView color={avgSectors[0]} />}
        {avgSectors[1] && <ColorView color={avgSectors[1]} />}
        {avgSectors[2] && <ColorView color={avgSectors[2]} />}
      </View>
      <View style={styles.row}>
        {avgSectors[3] && <ColorView color={avgSectors[3]} />}
        {avgSectors[4] && <ColorView color={avgSectors[4]} />}
        {avgSectors[5] && <ColorView color={avgSectors[5]} />}
      </View>
      <View style={styles.row}>
        {avgSectors[6] && <ColorView color={avgSectors[6]} />}
        {avgSectors[7] && <ColorView color={avgSectors[7]} />}
        {avgSectors[8] && <ColorView color={avgSectors[8]} />}
      </View>

      {Boolean(averageColor) && (
        <ColorView name="Average Color" color={averageColor} />
      )}
      {Object.entries(palette).map(([name, color]) => (
        <ColorView key={name} name={name} color={color} />
      ))}
    </ScrollView>
  );
}

const ColorView: React.FC<{ color: string; name?: string }> = ({
  name,
  color,
}) => {
  return (
    <View style={[styles.colorView, { backgroundColor: color }]}>
      <View style={styles.textWrapper}>
        {name && <Text style={styles.text}>{name}</Text>}
        <Text style={styles.text}>{color}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  img: {
    height: 300,
    objectFit: 'contain',

    width: '100%',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  colorView: {
    minHeight: Dimensions.get('window').width / 3,
    minWidth: Dimensions.get('window').width / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    backgroundColor: 'rgba(251,251,251,0.47)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? 500 : 'semibold',
    color: '#202020',
  },
  title: {
    fontSize: 36,
    color: '#202020',
  },
});