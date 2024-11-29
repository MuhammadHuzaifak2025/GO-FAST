import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { FlashList } from '@shopify/flash-list';
import { setAuthHeaders } from '../../../utils/expo-store';
import { useToast } from 'react-native-toast-notifications';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';


const ChatList = () => {
    
    const toast = useToast();

    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRequests = async () => {

        try {
            setIsLoading(true);

            setAuthHeaders();
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/requests/chat`);
            console.log(response.data);

            if(response.status === 200){

                setChat((response.data.data.Driver).concat(response.data.data.Passenger));
                console.log(chat);
                setIsLoading(false);
            }
            else{
                throw new Error(response);
            }

        } catch (error) {

            if(error.response.data.message === 'No ride request found'){

            }
            else{
                console.log(error.response);

                toast.show(error.response.data.message, {
                    type: "danger",
                    duration: 4000,
                    offset: 30,
                    animationType: "slide-in",
                  });
            }
            setIsLoading(false);
        }
        
    }



    useFocusEffect(
        React.useCallback(() => {

            fetchRequests();
            

        }, [])
      );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Inbox</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6347" />
                <Text style={styles.loadingText}>Loading chats...</Text>
                </View>
            ) : (
                <FlashList
                estimatedItemSize={100}
                data={chat}
                keyExtractor={(item) => item.request_id}
                renderItem={({ item }) => (
                    <View style={styles.rideItemContainer}>
                        <TouchableOpacity
                            style={styles.rideItem}
                            onPress={() => router.push({pathname: 'inbox', params: item })}>
                            <Text style={styles.rideTime}>{item.username}</Text>
                        </TouchableOpacity>
                    </View>
                    
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.subheading}>No chats available.</Text>                                   
                )}                
                removeClippedSubviews={false}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      // backgroundColor: '#fff',
      // borderBottomWidth: 1,
      // borderBottomColor: '#e0e0e0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    filterIcon: {
      padding: 10,
    },
    sameLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
    },
    filterContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderWidth: 0,
      borderColor: '#ff6347', // Tomato border for the filter container
      borderRadius: 12,
      padding: 15,
      backgroundColor: '#f9f9f9', // Light background for the filter section
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    rideItemContainer: {
      flex: 1,
      marginVertical: 10,
      alignSelf: 'center',
    },
    rideItem: {
      padding: 20,
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    rideHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    usernameText: {
      marginLeft: 10,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    rideText: {
      fontSize: 16,
      color: '#fff',
      marginTop: 5,
    },
    rideTime: {
      fontSize: 14,
      color: '#ff6347',
      // marginTop: 10,
      fontWeight: 'bold',
    },
    dateTimeField: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderColor: '#e0e0e0',
      borderWidth: 
  1,
      borderRadius: 8,
      marginVertical: 10,
      backgroundColor: '#fff',
    },
    dateTimeText: {
      fontSize: 16,
      color: '#333',
      flex: 1,
      marginLeft: 10,
    },
    seatsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // marginTop: 10,
    },
    seatIcon: {
      // marginRight: 4,
    },
    cross: {
      padding: 5,
    },
    picker: {
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      marginVertical: 10,
      backgroundColor: '#fff',
    },
    seatText: {
      color: '#fff',
      fontSize: 14,
      // marginRight: 5,
    },
    subheading: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#333',
    },
    moreLoading: {
      marginVertical: 20,
    },
    formField: {
      marginVertical: 10,
    },
  });

export default ChatList;