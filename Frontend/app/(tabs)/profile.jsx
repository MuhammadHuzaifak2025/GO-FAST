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

const Profile = () => {


  const { user, setUser, isAuthenticated, setIsAuthenticated } = useGlobalContext();
  const toast = useToast();

  const [form, setForm] = useState({
    username: user ? user.username : '',
    password: ''
  });

  const [isLogOut, setIsLogOut] = useState(false)

  const handleLogOut = async () => {

    setIsLogOut(false)

    try {

      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/logout`,{}, { withCredentials: true });

      if (response.status === 200) {

        setUser(null);
        setIsAuthenticated(false);

        toast.show("Successfully Logged Out", {
          type: "success",
          duration: 6000,
          offset: 30,
          animationType: "slide-in",
        });

        await saveTokensFromCookies(response);
        // router.dismissAll();
        router.replace('/');
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

    setIsLogOut(false)

  }

  return (
    <SafeAreaView style={{justifyContent: 'center', alignItems: 'center', height: '100%'}}>
      <CustomButton
        textContent="Sign Out"
        handlePress={handleLogOut}
        containerStyles={{ justifyContent: 'center', marginTop: 7, aligjItems: 'center' }}
        isLoading={isLogOut} />
    </SafeAreaView>
  )
}

export default Profile