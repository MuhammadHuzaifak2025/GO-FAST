import React, {useState} from 'react';

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import axios from 'axios'
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';

const SignIn = () => {

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {

    setIsSubmitting(false)
    
    try{

          const response = await axios.post((`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/login`), form, {withCredentials: true});
          console.log(response.data);

    } catch (error){
      console.log(error);
    }

    setIsSubmitting(false)

  }

  return (
    <SafeAreaView style={{flex:1,height:'100%'}}>
      <ScrollView>

        <View style={styles.container}>

          <Text style={styles.textM}>Your email and password</Text>

          <FormField
            title="Email"
            placeholder="Enter your email"
            value={form.email}
            handleChangeText = {(e) => setForm({...form, email: e})}
            keyboardType="email-address"
            secureTextEntry={false}
            otherStyles={{marginBottom: 20}}
          />

          <FormField
            title="Password"
            placeholder="Enter your password"
            value={form.password}
            handleChangeText = {(e) => setForm({...form, password: e})}
            secureTextEntry={true}
            otherStyles={{marginBottom: 20}}
          />

          <CustomButton
            textContent= "Sign In"
            handlePress= {submit}
            containerStyles={{marginTop: 7}}
            isLoading={isSubmitting}/>

          <View style={styles.forgot}>
            <Text style={{fontFamily: 'Poppins-Regular', fontSize: 16,color: 'grey'}}>Don't have an account?</Text>
            <Link href="./sign-up"
                  style={{fontFamily: 'Poppins-SemiBold', color: 'red', fontSize: 16}}>
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

export default SignIn