// import React, { useState } from 'react';
// import { View, Button, Image, StyleSheet } from 'react-native';
// import ImagePicker from 'react-native-image-crop-picker';

// const App = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [width, setWidth] = useState(350);
//   const [height, setHeight] = useState(500);

// //   const handleImagePicker = () => {
// //     ImagePicker.openPicker({
// //       width,
// //       height,
// //       cropping: true,
// //     })
// //       .then((image) => {
// //         setSelectedImage(image.path);
// //         setHeight(height);
// //         setWidth(width);
// //         console.log(image);
// //       })
// //       .catch((error) => {
// //         console.log(error);
// //       });
// //   };

// //   const handleCameraPicker = () => {
// //     ImagePicker.openCamera({
// //       width,
// //       height,
// //       cropping: true,
// //     })
// //       .then((image) => {
// //         setSelectedImage(image.path);
// //         setHeight(height);
// //         setWidth(width);
// //       })
// //       .catch((error) => {
// //         console.log(error);
// //       });
// //   };

// //   const handleCropImage = () => {
// //     if (selectedImage) {
// //       ImagePicker.openCropper({
// //         path: selectedImage,
// //         width,
// //         height,
// //         cropping: true,
// //         cropperCircleOverlay: false, // Set to true if you want a circular crop
// //         freeStyleCropEnabled: true,
// //       })
// //         .then((image) => {
// //           setSelectedImage(image.path);
// //           setHeight(250);
// //           setWidth(170);
// //           console.log(image);
// //         })
// //         .catch((error) => {
// //           console.log(error);
// //         });
// //     }
// //   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems:'center' }}>
//         {selectedImage && (<Image source={{ uri: selectedImage }} style={{width: width, height: height, marginVertical: 20}} />
//       )}
//       <View style={{ marginTop: 20 }}>
//       <Button title="Choose from Gallery" onPress={handleImagePicker} />
//       </View>
//       <View style={{ marginTop: 20 }}>
//       <Button title="Take a Photo" onPress={handleCameraPicker} />
//       </View>
//       <View style={{ marginTop: 20,marginBottom: 50 }}>    
//       {selectedImage && <Button title="Crop Image" onPress={handleCropImage} />}
//       </View>
//     </View>
//   );
// };


// export default App;