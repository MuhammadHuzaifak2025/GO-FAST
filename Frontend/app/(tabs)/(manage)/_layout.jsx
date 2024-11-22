import { Slot, Stack, SplashScreen } from 'expo-router'

const RidesLayout = () => {

  return (
    <>
        <Stack>
            <Stack.Screen name="publish-ride" options={{ headerShown: false }} />  
            <Stack.Screen name="manage-ride" options={{ headerShown: false }} />
            {/* <Stack.Screen name="(Transport_Manager)" options={{ headerShown: false }} />   */}
        </Stack>
    </>
  )
}

export default RidesLayout;
