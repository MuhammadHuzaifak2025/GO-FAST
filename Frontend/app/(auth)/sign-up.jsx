import { View, Text, StyleSheet, ScrollView, Alert, ToastAndroid, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import axios from 'axios'
import React, { useState, useEffect } from 'react';
import { useToast } from "react-native-toast-notifications";
import MapboxPlacesAutocomplete from "react-native-mapbox-places-autocomplete";
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { useGlobalContext } from '../../context/GlobalProvider';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
// import { useDispatch } from "react-redux";
// import { setOrigin, setDestination } from "../store/actions"; // Update this path as per your file structure

const SignUp = () => {

  const { isLoading, user, setUser } = useGlobalContext();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null); // To store error messages
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(''); // Session token for API
  const [confirm, setConfirm] = useState('');
  const toast = useToast();
  const router = useRouter();

  // Generate session token
  const generateSessionToken = () => Math.random().toString(36).substring(2);

  // Get current location
  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords); // Set only the coordinates
    }

    getCurrentLocation();
  }, []);

  // Set session token
  useEffect(() => {
    if (!sessionToken) {
      setSessionToken(generateSessionToken());
    }
  }, [sessionToken]);

  // Fetch suggestions based on address input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (form.address.length < 3) {
        setSuggestions([]); // Clear suggestions if address is too short
        return;
      }

      if (!location) {
        // console.error('Location not available for proximity');
        setLocation({ latitude: 24.8607, longitude: 67.0011 }); // Default to Karachi coordinates
        return;
      }

      setLoading(true);
      try {
        const TEMPsessionToken = uuidv4();
        const { longitude, latitude } = location;
        console.log(encodeURIComponent(form.address));
        const response = await axios.get(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(form.address)}&access_token=${process.env.EXPO_PUBLIC_MAPBOXTOKEN}&session_token=${TEMPsessionToken}&language=en&country=PK&limit=10&types=country%2Cstreet%2Cpoi&poi_category=&proximity=${longitude}%2C${latitude}`
        );

        if (response.data && response.data.suggestions && response.data.suggestions.length > 0) {
          console.log(response.data.suggestions[0]?.name);
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 500); // Debounce API requests

    return () => clearTimeout(debounceTimeout); // Cleanup timeout
  }, [form.address]);

  // Handle address selection
  const handleSelectAddress = (address) => {
    setForm({ ...form, address });
    setSuggestions([]); // Clear suggestions
  };

  // Submit form
  const submit = async () => {
    setIsSubmitting(true);

    try {
      if (!form.username || !form.email || !form.password || !form.address || !form.phone) {
        toast.show('Please fill all fields', {
          type: 'danger',
          duration: 4000,
          offset: 30,
          animationType: 'slide-in',
        });
        return;
      }

      if (form.password !== confirm) {
        toast.show('Passwords do not match', {
          type: 'danger',
          duration: 4000,
          offset: 30,
          animationType: 'slide-in',
        });
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`,
        form,
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.show(
          'Successfully created account, please enter OTP sent to your email address',
          {
            type: 'success',
            duration: 8000,
            offset: 30,
            animationType: 'slide-in',
          }
        );

        setUser(response.data.data);
        router.push('/verify-email');
      } else {
        throw new Error(response);
      }
    } catch (error) {
      toast.show(error.response?.data?.message || 'Error creating account', {
        type: 'danger',
        duration: 4000,
        offset: 30,
        animationType: 'slide-in',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, height: '100%' }}>
      <ScrollView>

        <View style={styles.container}>

          <Text style={styles.textM}>Sign Up</Text>

          <FormField
            title="Username"
            placeholder="Enter your username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20, marginTop: 10 }}
            isCapital={false}
          />

          <FormField
            title="Email"
            placeholder="Enter your email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            keyboardType="email-address"
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20 }}
            isCapital={false}
          />
          <FormField
            title="Phone Number"
            placeholder="Enter your phone number"
            value={form.phone}
            keyboardType="phone-pad"
            handleChangeText={(e) => setForm({ ...form, phone: e })}
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20 }}
          />
          <FormField
            title="Address"
            placeholder="Enter your Address"
            value={form.address}
            keyboardType="text"
            handleChangeText={(e) => setForm({ ...form, address: e })}
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20 }}
          />
          {loading && <Text>Loading...</Text>}
          {Array.isArray(suggestions) && suggestions.length > 0 && (
            <ScrollView style={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectAddress(suggestion.full_address || suggestion.place_formatted || suggestion.name)}
                >
                  <Text style={styles.suggestionText}>
                    {suggestion.name || suggestion.place_formatted || suggestion.full_address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <FormField
            title="Password"
            placeholder="Enter your password"
            keyboardType="password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            secureTextEntry={true}
            otherStyles={{ marginBottom: 20 }}
            isCapital={false}
          />
          <FormField
            title="Confirm Password"
            placeholder="Re-Enter your password"
            keyboardType="password"
            value={confirm}
            handleChangeText={(e) => setConfirm(e)}
            secureTextEntry={true}
            otherStyles={{ marginBottom: 20 }}
            isCapital={false}
          />

          <CustomButton
            textContent="Sign Up"
            handlePress={submit}
            containerStyles={{ marginTop: 7 }}
            isLoading={isSubmitting} />

          <View style={styles.forgot}>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, color: 'grey' }}>
              Have an account?
            </Text>

            <Link href="./sign-in"
              style={{ fontFamily: 'Poppins-SemiBold', color: 'red', fontSize: 16 }}>
              Sign In
            </Link>

          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  suggestionsList: {
    // position: 'absolute',    // Makes the suggestion list float under the input field
    // top: 60,                 // Adjust according to the input field height
    // left: 0,
    // right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    maxHeight: 200,          // Limit height for scrollable list
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,            // Shadow for Android
    zIndex: 999,
    flex: 1,
    flexDirection: 'column'            // Ensure it stays on top
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  cont1: {
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    focus: 'border-color: black',
    backgroundColor: '#FFF',
    borderColor: 'tomato',
  },
  inputS: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    width: '100%',
    paddingLeft: 5
  },
  img: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'tomato',
    marginRight: 10
  }
  ,
  container: {
    justifyContent: 'center',
    minHeight: vh(88),
    width: '100vw',
    padding: 15,
    margin: 6,
  },
  textM: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
  },
  forgot: {
    // alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    flexDirection: 'row',
    gap: 2,
  }
});

export default SignUp