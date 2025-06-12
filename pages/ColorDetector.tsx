import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  getAverageColor,
  getPalette,
  getSegmentsAverageColor,
  type PaletteResult,
} from '@somesoap/react-native-image-palette';
import chroma from 'chroma-js';
import Tts from 'react-native-tts';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
type Props = {
  route: {
    params: {
      imagePath: string;
    };
  };
};

export default function ColorDetector({ route }: Props) {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultVoice('com.apple.ttsbundle.Daniel-compact')
  const imagePath = route.params.imagePath;
  const uri = imagePath;
  const [averageColor, setAverageColor] = useState<string>('');
  const [palette, setPalette] = useState<PaletteResult | null>(null);
  const [avgSectors, setAvgSectors] = useState<string[]>([]);
  const [centerColor, setCenterColor] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    getAverageColor(uri)
      .then((color) => {
        setAverageColor(color);
        Tts.speak(`Average color is ${getSimpleColorName(color)}`);
      })
      .catch(console.error);
    getPalette(uri)
      .then((result) => {
        setPalette(result);
        const keys = ['vibrant', 'muted'] as const;
        const spoken = keys
          .map((key) => result[key])
          .filter(Boolean)
          .map((color) => `${getSimpleColorName(color!)}`)
          .join(', ');
        Tts.speak(`Palette colors: ${spoken}`);
      })
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
    getSegmentsAverageColor(uri, [{ fromX: 40, toX: 60, fromY: 40, toY: 60 }], {
      pixelSpacingAndroid: 2,
    })
      .then((colors) => {
        if (colors.length > 0) {
          setCenterColor(colors[0]);
          Tts.speak(`Center color is ${getSimpleColorName(colors[0])}`);
        }
      })
      .catch(console.error);
  }, [uri]);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      <Text style={styles.header}>Color Detector</Text>
      <Image source={{ uri }} style={styles.image} />
      {centerColor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Center Color</Text>
          <ColorBlock
            color={centerColor}
            label={`Center - ${getSimpleColorName(centerColor)}`}
            big
          />
        </View>
      )}
      <ToggleSection
        title="Show All Colors"
        expanded={showAll}
        onToggle={() => {
          LayoutAnimation.easeInEaseOut();
          setShowAll(!showAll);
        }}
      >
        {showAll && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Segmented Colors</Text>
              <View style={styles.grid}>
                {avgSectors.map((color, idx) => (
                  <ColorBlock
                    key={idx}
                    color={color}
                    label={`Block ${idx + 1} - ${getSimpleColorName(color)}`}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Palette</Text>
              <View style={styles.palette}>
                {palette &&
                  Object.entries(palette).map(([name, color]) => (
                    <ColorBlock
                      key={name}
                      color={color}
                      label={`${name} - ${getSimpleColorName(color)}`}
                    />
                  ))}
              </View>
            </View>
          </>
        )}
      </ToggleSection>
    </ScrollView>
  );
}

function ToggleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.toggleHeader, { backgroundColor: '#44A6BF' }]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleIcon}>{expanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}

function ColorBlock({
  color,
  label,
  big = false,
}: {
  color: string;
  label?: string;
  big?: boolean;
}) {
  const speakColor = () => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
    Tts.speak(label || color);
  };
  const textColor = chroma(color).luminance() < 0.5 ? '#FFF' : '#222';
  return (
    <TouchableOpacity
      style={[
        styles.colorBlock,
        { backgroundColor: color },
        big && styles.colorBlockBig,
      ]}
      onPress={speakColor}
      accessibilityLabel={`Speak color ${label}`}
      accessibilityRole="button"
    >
      {label && <Text style={[styles.colorLabel, { color: textColor }]}>{label}</Text>}
      <Text style={[styles.colorCode, { color: textColor }]}>{color}</Text>
    </TouchableOpacity>
  );
}

function getSimpleColorName(hex: string): string {
  const [h, s, l] = chroma(hex).hsl();
  if (isNaN(h)) return 'White';
  if (s < 0.15) {
    if (l < 0.2) return 'Black';
    if (l < 0.4) return 'Dark Gray';
    if (l < 0.7) return 'Gray';
    return 'Light Gray';
  }
  if (h >= 20 && h <= 50 && s < 0.5) {
    if (l < 0.3) return 'Dark Brown';
    if (l < 0.5) return 'Brown';
    if (l < 0.7) return 'Light Brown';
    return 'Tan';
  }
  if (h >= 30 && h <= 60 && s < 0.4 && l > 0.75) return 'Cream';
  if (h >= 30 && h <= 50 && s < 0.4 && l > 0.6 && l <= 0.75) return 'Beige';
  if (h >= 0 && h < 10) return l < 0.4 ? 'Dark Red' : 'Red';
  if (h >= 10 && h < 20) return 'Red-Orange';
  if (h >= 20 && h < 30) return 'Orange';
  if (h >= 30 && h < 40) return 'Orange-Yellow';
  if (h >= 40 && h < 65) return 'Yellow';
  if (h >= 65 && h < 85) return 'Yellow-Green';
  if (h >= 85 && h < 140) return 'Green';
  if (h >= 140 && h < 170) return 'Dark Green';
  if (h >= 170 && h < 200) return 'Teal';
  if (h >= 200 && h < 220) return 'Blue';
  if (h >= 220 && h < 240) return 'Light Blue';
  if (h >= 240 && h < 260) return 'Navy Blue';
  if (h >= 260 && h < 275) return 'Indigo';
  if (h >= 275 && h < 290) return 'Purple';
  if (h >= 290 && h < 305) return 'Magenta';
  if (h >= 305 && h < 320) return 'Hot Pink';
  if (h >= 320 && h < 330) return 'Pink';
  if (h >= 330 && h <= 360) return l < 0.4 ? 'Dark Red' : 'Red';

  return 'Unknown';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF9E5',
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22668D',
    textAlign: 'center',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    borderRadius: 12,
    marginBottom: 16,
  },
  section: {
    marginTop: 20,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  toggleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22668D',
    marginBottom: 8,
  },
  toggleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  colorBlock: {
    width: Dimensions.get('window').width / 3 - 20,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    elevation: 2,
  },
  colorBlockBig: {
    height: 250,
    width: '100%',
    borderRadius: 14,
  },
  colorLabel: {
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  colorCode: {
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
});
