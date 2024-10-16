import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import axios from 'axios'
import React, {useState} from 'react';

import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';

const SignUp = () => {

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    setIsSubmitting(false)
    
    try{

          const reponse = await axios.post('http://localhost:5000/gofast/api/user', form, {withCredentials: true,headers: {
            "Content-Type": "application/json",
},} );
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

          <Text style={styles.textM}>Sign Up</Text>

          <FormField
            title="Username"
            placeholder="Enter your username"
            value={form.username}
            handleChangeText = {(e) => setForm({...form, username: e})}
            secureTextEntry={false}
            otherStyles={{marginBottom: 20, marginTop: 10}}
          />

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
            title="Phone Number"
            placeholder="Enter your phone number"
            value={form.phone}
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
            value={form.password}
            handleChangeText = {(e) => setForm({...form, password: e})}
            secureTextEntry={true}
            otherStyles={{marginBottom: 20}}
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