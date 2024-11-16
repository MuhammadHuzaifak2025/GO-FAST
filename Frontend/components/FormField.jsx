import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native'
import React, {useState} from 'react'
import { icons } from '../constants'

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, secureTextEntry,...props} ) => {

  const [showPassword, setShowPassword] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[otherStyles,{}]}>

      <Text style={styles.text}>{title}</Text>

      <View style={[styles.cont1, , {borderColor: isFocused ? 'red' : 'tomato'}]}>
        <TextInput       
          style={styles.inputS}
          value={value}
          keyboardType={props.keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#FFCCCB"
          onChangeText={handleChangeText}
          secureTextEntry={showPassword}
          onFocus={()=>setIsFocused(true)}
          onBlur={()=>setIsFocused(false)}
          scrollEnabled={false}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image source={showPassword ? icons.eye : icons.eyeHide}
                     style={styles.img}/>
          </TouchableOpacity>)}
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  cont1: {
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    focus: 'border-color: black',
    backgroundColor: '#eeeeee',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  inputS: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    width: '100%',
    paddingLeft: 5
  },
  img: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'tomato',
    marginRight: 10
  }
});

export default FormField