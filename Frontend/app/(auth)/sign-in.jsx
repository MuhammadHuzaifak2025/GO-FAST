import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vw, vh } from 'react-native-expo-viewport-units';
import axios from 'axios';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { useToast } from "react-native-toast-notifications";
import { useGlobalContext } from '../../context/GlobalProvider';
import { saveTokensFromCookies } from '../../utils/expo-store';
import AnimatedSpinner from '../../components/loader/AnimatedSpinner';

const SignIn = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [spinnerState, setSpinnerState] = useState();
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useGlobalContext();
  const toast = useToast();

  const [form, setForm] = useState({
    username: user ? user.username : '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {

    setModalVisible(true);  // Show modal with spinner
    setSpinnerState('spinning');
    setIsSubmitting(true);

    try {
      if (!form.username || !form.password) {
        toast.show('Please fill all fields', {
          type: "danger",
          duration: 5000,
          offset: 30,
          animationType: "slide-in",
        });
        setModalVisible(false);
        setSpinnerState('');
        return;
      }

      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/login`, { username: form.username, password: form.password }, { withCredentials: true });

      if (response.status === 200) {

        setSpinnerState('success');
        setUser(response.data.data);

        setIsAuthenticated(true);

        toast.show("Successfully Logged In", {
          type: "success",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });

        await saveTokensFromCookies(response);

        router.dismissAll();
        if (response.data.data.admin === true) {
          // router.replace('/admin');
          // console.log("Hello")
          router.push('/dashboard');
        }
        else
          router.replace('/find-ride');
      }
      else if(response.status === 201){

        setSpinnerState('success');
        setUser(response.data.data);

        toast.show("Please verify your account", {
          type: "warning",
          duration: 5000,
          offset: 30,
          animationType: "slide-in",
        });

       
        router.replace('/verify-email');
      } 
      else {
        throw new Error(response);
      }
    } catch (error) {

      setSpinnerState('failure');
      // console.log(error.response.data);

      toast.show(error.response.data.message, {
        type: "danger",
        duration: 6000,
        offset: 30,
        animationType: "slide-in",
      });

    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setModalVisible(false);
        setSpinnerState('');
      }, 1000);  // Hide modal after animation
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, height: '100%' }}>
      <ScrollView>
        <View style={styles.container}>
          {/* Modal for Animated Spinner */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <AnimatedSpinner
                size={100}
                strokeWidth={6}
                spinnerColor="#3498db"
                successColor="#2ecc71"
                failureColor="red"
                state={spinnerState}
              />
            </View>
          </Modal>

          <Text style={styles.textM}>Your email and password</Text>

          <FormField
            title="Email/Username"
            placeholder="Enter your email/username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            keyboardType="email-address"
            secureTextEntry={false}
            otherStyles={{ marginBottom: 20 }}
            isCapital={false}
          />

          <FormField
            title="Password"
            placeholder="Enter your password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            secureTextEntry={true}
            otherStyles={{ marginBottom: 20 }}
            isCapital={false}
          />

          <Link href="./forgot-password"
            style={{ fontFamily: 'Poppins-Regular', fontSize: 14, color: 'red', textAlign: 'center' }}
          >Forgotten password?</Link>

          <CustomButton
            textContent="Sign In"
            handlePress={submit}
            containerStyles={{ marginTop: 7 }}
            isLoading={isSubmitting}
          />

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
  );
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
    justifyContent: 'center',
    paddingTop: 15,
    flexDirection: 'row',
    gap: 2,
  },
  modalContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default SignIn;
