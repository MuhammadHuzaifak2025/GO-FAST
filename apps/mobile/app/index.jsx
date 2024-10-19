import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Button, Image, ScrollView } from 'react-native';
import { Link, Redirect,router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import { ToastProvider } from 'react-native-toast-notifications'

import { useGlobalContext } from '../context/GlobalProvider';
import {icons} from '../constants';

export default function App() {

  const {isLoading, isAuthenticated} = useGlobalContext();

  if(!isLoading && isAuthenticated){
    return <Redirect href="/find-ride" />
  }
  return (
    
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={ { flexGrow:1 } }>

          <View style={styles.container}>
            
            <View style={styles.inlineContainer}>
              <Image source={icons.logo} style={styles.logo} />
              <Text style={styles.textMain}>GoFast</Text>
            </View>

            <Text style={styles.textQ}>Your Ride, Your Choice</Text>
            <CustomButton 
              textContent={'Log In'} 
              handlePress = {() => router.push('/sign-in')}
              containerStyles={{margin: 10,minWidth: '90%'}}/>

            <Link href="/sign-up" 
                  style={{fontFamily: 'Poppins-Regular',fontSize: 16,textAlign: 'center', color: 'blue'}}>
                Sign Up 
            </Link>

          </View>
        </ScrollView>

        <StatusBar backgroundColor='#FFF' style='dark'/>
      </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
  inlineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "#EC5F5F",
      padding: 1,
      marginBottom: 60,
    },
  logo: {
      resizeMode: 'contain',
      height: 50,
      marginRight: 15,
      backgroundColor: "#FFF"
    },
  textMain: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color:'#FFF',
    borderRadius: 12,
    paddingRight: 15
  },
  textQ: {
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
    textAlign: 'center',
  },
})
