// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   Button,
//   Alert,
// } from 'react-native';
// import { launchImageLibrary } from 'react-native-image-picker';
// import ImageLabeling, { Label } from '@react-native-ml-kit/image-labeling';

// interface ImageDetails {
//   path: string;
//   fileName: string;
// }

// const ChooseImageButton = ({ onChoose }: { onChoose: (img: ImageDetails) => void }) => {
//   const handlePress = async () => {
//     const result = await launchImageLibrary({ mediaType: 'photo' });

//     const asset = result.assets?.[0];
//     if (asset?.uri && asset?.fileName) {
//       const image: ImageDetails = {
//         path: asset.uri,
//         fileName: asset.fileName,
//       };
//       onChoose(image);
//     } else {
//       Alert.alert('เลือกภาพไม่สำเร็จ');
//     }
//   };

//   return <Button title="เลือกรูปภาพ" onPress={handlePress} />;
// };

// const PreviewImage = ({ source }: { source: string }) => (
//   <Image
//     source={{ uri: source }}
//     style={{ width: '100%', height: 300, marginVertical: 16, borderRadius: 8 }}
//     resizeMode="contain"
//   />
// );

// const LabelTile = ({ children }: { children: React.ReactNode }) => (
//   <View style={styles.labelTile}>
//     <Text style={styles.labelText}>{children}</Text>
//   </View>
// );

// const ImageLabelingScreen = () => {
//   const [image, setImage] = useState<ImageDetails | null>(null);
//   const [labels, setLabels] = useState<Label[]>([]);

//   const handleChoose = async (currentImage: ImageDetails) => {
//     setImage(currentImage);

//     try {
//       const result = await ImageLabeling.label(currentImage.path);
//       setLabels(result);
//     } catch (error) {
//       console.warn('Image labeling error:', error);
//       Alert.alert('Error', 'ไม่สามารถตรวจจับฉลากได้');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ChooseImageButton onChoose={handleChoose} />
//       {image && <PreviewImage source={image.path} />}

//       {labels.length > 0 && (
//         <>
//           <Text style={styles.heading}>Labels</Text>
//           <FlatList
//             data={labels}
//             style={styles.list}
//             keyExtractor={(label) => label.text}
//             renderItem={({ item }) => (
//               <LabelTile>
//                 {item.text} - {(100 * item.confidence).toFixed(2)}%
//               </LabelTile>
//             )}
//           />
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     paddingTop: 40,
//     backgroundColor: '#fff',
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     marginTop: 20,
//   },
//   list: {
//     width: '100%',
//   },
//   labelTile: {
//     backgroundColor: '#f0f0f0',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   labelText: {
//     fontSize: 16,
//   },
// });

// export default ImageLabelingScreen;
