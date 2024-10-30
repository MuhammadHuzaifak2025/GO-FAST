import { View, Text, Modal } from 'react-native';
import React, {useRef, useState} from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { StyleSheet } from 'react-native';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useToast } from "react-native-toast-notifications";
import { link, router } from 'expo-router';

import { useGlobalContext } from '../../context/GlobalProvider';
import CustomButton from '../../components/CustomButton';
import AnimatedSpinner from '../../components/loader/AnimatedSpinner';

const VerifyEmail = () => {

    const toast = useToast();
    const otpInput = useRef(null)

    const {user} = useGlobalContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [spinnerState, setSpinnerState] = useState();

    const submit = async () => {

        setIsSubmitting(true);
        setModalVisible(true);
        setSpinnerState('spinning');
        
        try{
          let verification = '';
          verification = otpInput.current.state.otpText.join('');
          
          if(verification.length !== 6){

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

          const resp = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/verifyuser`, {email : user.email, key : verification}, {withCredentials: true});

          if(resp.status === 200){

            setSpinnerState('success');

            toast.show("Successfully Verified account, Please Login", {
                type: "success",
                duration: 6000,
                offset: 30,
                animationType: "slide-in",
              });

              setTimeout(() => {setModalVisible(false);
                                setSpinnerState('');
                                router.replace('/sign-in');
              }, 1000);
            
          }
          else {
            throw new Error(resp);
          }
        } catch (error){
          
          otpInput.current.clear();
          setSpinnerState('failure');
          
          toast.show(error.response.data.message, {
            type: "danger",
            duration: 6000,
            offset: 30,
            animationType: "slide-in",
          });

        }
        finally {

          setIsSubmitting(false);
          setTimeout(() => {setModalVisible(false);
          }, 1000);
        }

    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>

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
          ref= {otpInput}
          inputCount={6}
          containerStyle={styles.otpContainer}
          textInputStyle={styles.otpInput}
          />


          <CustomButton
              textContent= "Submit"
              handlePress= {submit}
              containerStyles={{marginTop: 7}}
              isLoading={isSubmitting}/>
    
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: '100%'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  otpContainer: {
    width: '100vw',
    justifyContent: 'space-between',
  },
  otpInput: {
    width: 40,
    height: 45,
    borderWidth: 1,
    borderColor: '#03DAC6',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
  },
  modalContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: '100%',  
    width: '100%',
  },
});

export default VerifyEmail;