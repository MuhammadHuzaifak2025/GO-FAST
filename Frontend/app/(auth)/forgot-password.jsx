import React, { useState } from 'react';

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import axios from 'axios'
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, Redirect, router } from 'expo-router';
import { useToast } from "react-native-toast-notifications";

import { useGlobalContext } from '../../context/GlobalProvider';
import { saveTokensFromCookies, setAuthHeaders } from '../../utils/expo-store';

const ForgotPassword = () => {

  const { user, setUser } = useGlobalContext();
  const toast = useToast();

  const [form, setForm] = useState({
    email: user ? user.email : '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {

    setIsSubmitting(false)

    try {

      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/forgetpassword`, { email: form.email }, { withCredentials: true });

      if (response.status === 200) {

        setUser({ email: form.email });

        toast.show("Password reset OTP sent to your email", {
          type: "success",
          duration: 6000,
          offset: 30,
          animationType: "slide-in",
        });

        router.replace('/reset-password');
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
      console.log(error.response.data.message);
    }

    setIsSubmitting(false)

  }

  return (
    <SafeAreaView style={{ flex: 1, height: '100%' }}>

      <View style={styles.container}>


        <Text style={styles.textM}>Enter Registered Email</Text>

        <FormField
          title=""
          placeholder="Enter your email"
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          keyboardType="email-address"
          secureTextEntry={false}
          otherStyles={{ marginTop: 0 }}
          isCapital={false} 
        />

        <CustomButton
          textContent="Reset Password"
          handlePress={submit}
          containerStyles={{ marginVertical: 40 }}
          isLoading={isSubmitting} />

      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    minHeight: vh(100),
    width: '100vw',
    padding: 15,
    margin: 6,
  },
  textM: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 5,
  },
  forgot: {
    // alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    flexDirection: 'row',
    gap: 2,
  }
});

export default ForgotPassword