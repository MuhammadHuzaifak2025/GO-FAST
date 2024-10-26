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

  const { user, setUser, isAuthenticated, setIsAuthenticated } = useGlobalContext();
  const toast = useToast();

  const [form, setForm] = useState({
    username: user ? user.username : '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false)

  const CheckAuth = async () => {
    try {
      await setAuthHeaders(axios)
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`);
      console.log(response);
      if (response.status === 200) {
        router.replace('/find-ride');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const submit = async () => {

    setIsSubmitting(false)

    try {

      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/login`, form, { withCredentials: true });

      if (response.status === 200) {

        setUser(response.data.data);
        setIsAuthenticated(true);

        toast.show("Successfully Logged In", {
          type: "success",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });

        await saveTokensFromCookies(response);
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
      <ScrollView>

        <View style={styles.container}>

          <Text style={styles.textM}>Your email and password</Text>

          <FormField
            title="Email/Username"
            placeholder="Enter your email/username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            keyboardType="email-address"
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20 }}
          />

          <FormField
            title="Password"
            placeholder="Enter your password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            secureTextEntry={true}
            otherStyles={{ marginBottom: 20 }}
          />

          <Link href="./forgot-password"
                style={{fontFamily: 'Poppins-Regular',fontSize: 14, color: 'red', textAlign: 'center'}}
                >Forgotten password?</Link>

          <CustomButton
            textContent="Sign In"
            handlePress={submit}
            containerStyles={{ marginTop: 7 }}
            isLoading={isSubmitting} />
          <CustomButton
            textContent="check auth"
            handlePress={CheckAuth}
            containerStyles={{ marginTop: 7 }}
            isLoading={isSubmitting} />

          <View style={styles.forgot}>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, color: 'grey' }}>Don't have an account?</Text>
            <Link href="./sign-up"
              style={{ fontFamily: 'Poppins-SemiBold', color: 'red', fontSize: 16 }}>
              Sign Up
            </Link>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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

export default ForgotPassword