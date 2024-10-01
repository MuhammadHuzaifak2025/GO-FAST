import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Button, Image } from 'react-native';
import { Link } from 'expo-router';

import {icons} from '../constants';

export default function App() {

  return (
    <View style={styles.container}>
      {/* <Text>GoFast</Text> */}
      {/* <Text>GoFast</Text> */}
      <View style={styles.inlineContainer}>
        <Image source={icons.logo} style={styles.logo} />
        <Text style={styles.textMain}>GoFast</Text>
      </View>
      <StatusBar style="auto" />
      <Link href="/profile" style={styles.texts}>Log In</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      display: 'flex',
      flex: 1,
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
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
  }
})
