import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [studentId, setStudentId] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false); // State to control camera visibility
  const [sound, setSound] = useState();
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }
  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/store-scanner-beep-90395.mp3')
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function handleVerifyStudent() {
    // Placeholder function for verifying the student
    if (studentId.trim()) {
      alert(`Verifying student with ID: ${studentId}`);
    } else {
      alert('Please enter a valid Student ID.');
    }
  }
  const fetchResult = (result) => {
    playSound();

    setIsCameraActive(false);
  }
  return (
    <View style={styles.container}>
      {isCameraActive && (
        <View style={styles.startContainer}>
          <CameraView style={styles.camera} facing={facing} onBarcodeScanned={fetchResult}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
          <Button
            title="Stop QR"
            onPress={() => setIsCameraActive(false)}
            color="#d9534f"
            style={styles.stopButton}
          />
        </View>
      )}
      {!isCameraActive && (
        <View style={styles.startContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setIsCameraActive(true)}
          >
            <Text style={styles.startButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.message}>Or enter Student ID manually</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Student ID"
          value={studentId}
          onChangeText={setStudentId}
        />
        <TouchableOpacity style={styles.scanButton} onPress={handleVerifyStudent}>
          <Text style={styles.scanButtonText}>Scan QR / Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraContainer: {
    height: 300, // Limit the camera height
    alignSelf: 'center',
    width: '90%',
    borderRadius: 8,
    overflow: 'hidden',
    // marginVertical: 16,
    borderColor: '#007bff',
    borderWidth: 2,
    marginBottom: 500,
  },
  camera: {
    height: 300,
    width: 300,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  scanButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stopButton: {
    paddingTop: 16,
    marginTop: 16,
  },
});
