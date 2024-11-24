import { View, Text, Modal, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useToast } from "react-native-toast-notifications";
import { router } from 'expo-router';

import { useGlobalContext } from '../../context/GlobalProvider';
import CustomButton from '../../components/CustomButton';
import AnimatedSpinner from '../../components/loader/AnimatedSpinner';

const VerifyEmail = () => {
  const toast = useToast();
  const otpInput = useRef(null);

  const { user } = useGlobalContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [spinnerState, setSpinnerState] = useState();
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const submit = async () => {
    setIsSubmitting(true);
    setModalVisible(true);
    setSpinnerState('spinning');

    try {
      let verification = otpInput.current.state.otpText.join('');
      if (verification.length !== 6) {
        toast.show('Please enter valid OTP', {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
        setIsSubmitting(false);
        setModalVisible(false);
        return;
      }

      const resp = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/verifyuser`, { email: user.email, key: verification }, { withCredentials: true });

      if (resp.status === 200) {
        setSpinnerState('success');
        toast.show("Successfully Verified account, Please Login", {
          type: "success",
          duration: 6000,
          offset: 30,
          animationType: "slide-in",
        });

        setTimeout(() => {
          setModalVisible(false);
          setSpinnerState('');
          router.replace('/sign-in');
        }, 1000);

      } else {
        throw new Error(resp);
      }
    } catch (error) {
      otpInput.current.clear();
      setSpinnerState('failure');

      toast.show(error.response?.data?.message || 'An error occurred', {
        type: "danger",
        duration: 6000,
        offset: 30,
        animationType: "slide-in",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setModalVisible(false);
      }, 1000);
    }
  };

  const resendOTP = async () => {
    setCanResend(false);
    setTimer(60);

    try {
      const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/resend-otp`, { 'username': user.username }, { withCredentials: true });

      if (resp.status === 200) {

        toast.show("OTP resent to your email", {
          type: "success",
          duration: 6000,
          offset: 30,
          animationType: "slide-in",
        });
      } else {

        throw new Error(resp);
      }
    } catch (error) {

      console.log(error.response);

      toast.show(error.response?.data?.message || 'Failed to resend OTP', {
        type: "danger",
        duration: 6000,
        offset: 30,
        animationType: "slide-in",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>

        {/* Modal for Animated Spinner */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <AnimatedSpinner
              size={100}
              strokeWidth={6}
              spinnerColor="#3498db"
              successColor="#2ecc71"
              failureColor="#e74c3c"
              state={spinnerState}
            />
          </View>
        </Modal>

        <Text style={styles.title}>Verify Your Email</Text>

        <OTPTextInput
          ref={otpInput}
          inputCount={6}
          containerStyle={styles.otpContainer}
          textInputStyle={styles.otpInput}
        />

        <CustomButton
          textContent="Submit"
          handlePress={submit}
          containerStyles={{ marginTop: 20 }}
          isLoading={isSubmitting}
        />

        <TouchableOpacity
          onPress={canResend ? resendOTP : null}
          disabled={!canResend}
        >
          <Text style={[styles.resendText, !canResend && styles.disabledText]}>
            {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  otpContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    flex: 1,
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#03DAC6',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  resendText: {
    color: 'blue',
    marginTop: 15,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  disabledText: {
    color: 'gray',
  },
});

export default VerifyEmail;