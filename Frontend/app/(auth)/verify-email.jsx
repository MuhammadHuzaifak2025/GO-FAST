import { View, Text } from 'react-native';
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

const VerifyEmail = () => {

    const toast = useToast();

    const {user} = useGlobalContext();
    const otpInput = useRef(null)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async () => {
        setIsSubmitting(true);

        try{
          console.log(user.email);
          let verification = '';
          verification = otpInput.current.state.otpText.join('');
          
          const resp = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/verifyuser`, {email : user.email, key : verification}, {withCredentials: true});
          
          if(resp.status === 200){
            toast.show("Successfully Verified account, Please Login", {
                type: "success",
                duration: 4000,
                offset: 30,
                animationType: "slide-in",
              });
            
            router.replace('/sign-in');
          }
        }
        catch (error){

          otpInput.current.clear();
          
          toast.show(error.response.data.message, {
            type: "danger",
            duration: 4000,
            offset: 30,
            animationType: "slide-in",
          });

        }



        setIsSubmitting(false);
    }

    return (
    <SafeAreaView style={styles.container}>

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
});

export default VerifyEmail;