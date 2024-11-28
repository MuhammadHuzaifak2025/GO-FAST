import { Slot, Stack, SplashScreen } from 'expo-router'

const ChatLayout = () => {

  return (
    <>
        <Stack>
            <Stack.Screen name="chat-list" options={{ headerShown: false }} />  
            <Stack.Screen name="inbox" options={{ headerShown: false }} />
            {/* <Stack.Screen name="(Transport_Manager)" options={{ headerShown: false }} />   */}
        </Stack>
    </>
  )
}

export default ChatLayout;
