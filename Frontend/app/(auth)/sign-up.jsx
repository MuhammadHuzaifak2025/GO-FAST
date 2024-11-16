import { View, Text, StyleSheet, ScrollView, Alert, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import axios from 'axios'
import React, {useState} from 'react';
import { useToast } from "react-native-toast-notifications";

import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { useGlobalContext } from '../../context/GlobalProvider';

const SignUp = () => {

  const {isLoading, user, setUser} = useGlobalContext();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const submit = async () => {

    setIsSubmitting(true)
    
    try{
          if(!form.username || !form.email || !form.password || !form.address || !form.phone){
            toast.show('Please fill all fields', {
              type: "danger",
              duration: 4000,
              offset: 30,
              animationType: "slide-in",
            });
            return;
          }
            const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`, form, {withCredentials: true} );
            
            if(response.status === 201){
              
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
        } catch (error){

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

  return (
    <SafeAreaView style={{flex:1,height:'100%'}}>
      <ScrollView>

        <View style={styles.container}>

          <Text style={styles.textM}>Sign Up</Text>

          <FormField
            title="Username"
            placeholder="Enter your username"
            value={form.username}
            handleChangeText = {(e) => setForm({...form, username: e})}
            secureTextEntry={false}
            otherStyles={{marginBottom: 20, marginTop: 10}}
            isCapital={false}
          />

          <FormField
            title="Email"
            placeholder="Enter your email"
            value={form.email}
            handleChangeText = {(e) => setForm({...form, email: e})}
            keyboardType="email-address"
            secureTextEntry={false}
            otherStyles={{marginBottom: 20}}
            isCapital={false}
          />
          <FormField
            title="Phone Number"
            placeholder="Enter your phone number"
            value={form.phone}
            keyboardType="phone-pad"
            handleChangeText = {(e) => setForm({...form, phone: e})}
            secureTextEntry={false}
            otherStyles={{marginBottom: 20}}
          />
          <FormField
            title="Address"
            placeholder="Enter your Address"
            value={form.address}
            handleChangeText = {(e) => setForm({...form, address: e})}
            secureTextEntry={false}
            otherStyles={{marginBottom: 20}}
          />

          <FormField
            title="Password"
            placeholder="Enter your password"
            keyboardType="password"
            value={form.password}
            handleChangeText = {(e) => setForm({...form, password: e})}
            secureTextEntry={true}
            otherStyles={{marginBottom: 20}}
            isCapital={false}
          />

          <CustomButton
            textContent= "Sign Up"
            handlePress= {submit}
            containerStyles={{marginTop: 7}}
            isLoading={isSubmitting}/>

          <View style={styles.forgot}>
            <Text style={{fontFamily: 'Poppins-Regular', fontSize: 16,color: 'grey'}}>
              Have an account?
            </Text>

            <Link href="./sign-in"
                  style={{fontFamily: 'Poppins-SemiBold',color: 'red', fontSize: 16}}>
                Sign In
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

export default SignUp