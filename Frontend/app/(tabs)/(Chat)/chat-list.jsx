import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router';

const ChatList = () => {

    const chatId = 1;

    useEffect(() => {
        router.push({pathname: 'inbox', params: { chatId }});
    }, []);
    // router.push({pathname: 'inbox', params: { chatId }});

    return (
        <View>
        <Text>ChatList</Text>
        </View>
    )
}

export default ChatList