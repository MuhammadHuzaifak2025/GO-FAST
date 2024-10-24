import { View, Text } from 'react-native';
import React, {useRef, useState} from 'react';
import OTPTextInput from 'react-native-otp-textinput';
import { StyleSheet } from 'react-native';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';

const VerifyEmail = () => {
    
    const otpInput = useRef(null)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = () => {
        setIsSubmitting(false);

        let verification = '';
        verification = otpInput.current.state.otpText.join('');

        
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