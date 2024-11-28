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
// import { useDispatch } from "react-redux";
// import { setOrigin, setDestination } from "../store/actions"; // Update this path as per your file structure

const SignUp = () => {

  const { isLoading, user, setUser } = useGlobalContext();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',

  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [confirm, setConfirm] = useState('');



  const submit = async () => {

    setIsSubmitting(true)

    try {
      if (!form.username || !form.email || !form.password || !form.address || !form.phone) {
        toast.show('Please fill all fields', {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
        return;
      }
      if (form.password !== confirm) {
        toast.show('Passwords do not match', {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
        return;
      }

      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`, form, { withCredentials: true });

      if (response.status === 201) {

        toast.show("Successfully created account, please enter OTP sent to your email address", {
          type: "success",
          duration: 8000,
          offset: 30,
          animationType: "slide-in",
        });

        setUser(response.data.data);
        router.push('/verify-email');
      }
      else {
        throw new Error(response);
      }
    } catch (error) {

      toast.show(error.response.data.message, {
        type: "danger",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      });

    } finally {

      setIsSubmitting(false);
    }

  }
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(''); // State to store session token

  // Function to generate session token (you can also generate it on your backend if needed)
  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2); // Example session token generator (replace with a more secure one if needed)
  };
  useEffect(() => {
    if (!sessionToken) {
      setSessionToken(generateSessionToken()); // Generate session token if not already set
    }
  }, [sessionToken]);
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (form.address.length < 3) {
        setSuggestions([]);  // Clear suggestions if address is too short
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${form.address}&access_token=${process.env.EXPO_PUBLIC_MAPBOXTOKEN}&session_token=${sessionToken}&country=PK`
        );
        if (response.data && response.data.suggestions) {
          setSuggestions(response.data.suggestions || []);
        }
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Delay the API call to reduce the number of requests made while typing
    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimeout);  // Clean up timeout if address changes
  }, [form.address]);
  const handleSelectAddress = (address) => {
    setForm({ ...form, address });
    setSuggestions([]); // Clear suggestions once an address is selected
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
            keyboardType="phone-pad"
            handleChangeText={(e) => setForm({ ...form, address: e })}
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20 }}
          />
          {loading && <Text>Loading...</Text>}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectAddress(suggestion.full_address || suggestion.place_formatted)}
                >
                  <Text style={styles.suggestionText}>
                    {suggestion.full_address || suggestion.place_formatted}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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