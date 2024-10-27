import { View, Text } from 'react-native';
import React, {useRef, useState} from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useToast } from "react-native-toast-notifications";
import { link, router } from 'expo-router';

import { useGlobalContext } from '../../context/GlobalProvider';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';

const VerifyEmail = () => {

    const toast = useToast();
    const otpInput = useRef(null)

    const {user} = useGlobalContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({password: ''});  

    const handleResetPass = async () => {
        setIsSubmitting(true);

        try{
          let verification = '';
          verification = otpInput.current.state.otpText.join('');
          
          const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/resetpassword`, {email : user.email, key : verification, password : form.password}, {withCredentials: true});

          if(resp.status === 200){
            toast.show("Successfully Changed Password, Please Login", {
                type: "success",
                duration: 6000,
                offset: 30,
                animationType: "slide-in",
              });
            
            router.replace('/sign-in');
          }
          else{
            throw new Error(resp);
          }
        }
        catch (error){
          console.log(error);
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

        <FormField
          title="New Password"
          placeholder="Enter your new password"
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
          secureTextEntry={true}
          otherStyles={{ marginBottom: 20 }}
        />

        <CustomButton
          textContent= "Submit"
          handlePress= {handleResetPass}
          containerStyles={{marginTop: 7}}
          isLoading={isSubmitting}
        />
    
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