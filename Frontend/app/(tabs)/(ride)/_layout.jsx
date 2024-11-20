import { Slot, Stack, SplashScreen } from 'expo-router'

const RidesLayout = () => {

  return (
    <>
        <Stack>
            <Stack.Screen name="find-ride" options={{ headerShown: false }} />  
            <Stack.Screen name="ride-details" options={{ headerShown: false }} />
            {/* <Stack.Screen name="(Transport_Manager)" options={{ headerShown: false }} />   */}
        </Stack>
    </>
  )
}

export default RidesLayout;
