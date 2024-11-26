import React, { useState, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CryptoJS from "crypto-js";

const { width } = Dimensions.get('window');

const ENCRYPTION_KEY = "12345678901234567890123456789012"; // 32 characters
const IV = "1234567890123456"; // 16 characters

export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [studentId, setStudentId] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [sound, setSound] = useState();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  if (!permission) {
    return <View />;
  }

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/verified.mp3'));
    setSound(sound);
    await sound.playAsync();
  }
  async function playSound_invalid() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/invalid.mp3'));
    setSound(sound);
    await sound.playAsync();
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function handleVerifyStudent() {
    if (studentId.trim()) {
      alert(`Verifying student with ID: ${studentId}`);
    } else {
      alert('Please enter a valid Student ID.');
    }
  }

  function decrypt(cipherText) {
    const decrypted = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
      iv: CryptoJS.enc.Utf8.parse(IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  const validateQR = (qrData) => {
    try {
      const decryptedData = decrypt(qrData);
      const { passenger_id, ride_date, timestamp } = JSON.parse(decryptedData);

      // Validate date (ensure ride date or timestamp is valid)
      const now = new Date();
      const rideDate = new Date(ride_date);
      if (rideDate < now) {
        throw new Error("QR code is expired");
      }
      // Optionally, fetch from the database to verify passenger_id or ride_date
      return { valid: true, passenger_id, ride_date };
    } catch (error) {
      // console.error("QR validation error:", error);
      return { valid: false, error: error.message };
    }
  };
  const fetchResult = (result) => {
    if (validateQR(result.data).valid) {
      playSound();
      // Add a delay before proceeding
      setTimeout(() => {
        // setIsCameraActive(false);
      }, 10000); // Delay of 1000ms (1 second)
    } else {
      playSound_invalid();
      // Add a delay before proceeding
      setTimeout(() => {
        // alert("Invalid QR code");
        // setIsCameraActive(false);
      }, 10000); // Delay of 1000ms (1 second)
    }
  };

  const scanLineAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <LinearGradient
      colors={['#ffff', '#ffff', '#ffff']}
      style={styles.container}
    >
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing} onBarcodeScanned={fetchResult}>
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineAnimation }]
                }
              ]}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => setIsCameraActive(false)}
          >
            <Text style={styles.buttonText}>Stop Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
          placeholderTextColor="#a0a0a0"
          value={studentId}
          onChangeText={setStudentId}
        />
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyStudent}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  cameraContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#ffffff',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  startContainer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stopButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scanLine: {
    height: 2,
    width: '100%',
    // backgroundColor: '#00ff00',
  },
});

