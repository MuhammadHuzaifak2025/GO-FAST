import { View, Text, Image } from 'react-native';
import { Tabs, Redirect } from 'expo-router';

import { icons } from '../../constants';

const TabIcon = ({icon,color,name,focused}) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 5,
    }}>
      <Image
        source={icon}
        resizeMode = "contain"
        tintColor = {color}
        style={{
          width: 25,
          height: 25,
        }}
      />
      <Text style={[{
                    color: color},
                    {fontFamily: focused ? 'Poppins-SemiBold' : 'Poppins-Regular'},
                    {fontSize: 10}]}>
                  {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#EC5F5F',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: {
            borderTopColor: 'transparent',
            borderTopWidth: 1,
            height: 60,
            padding: 5,
          }
        }}
      >
        <Tabs.Screen
          name="your-rides"
          options={{
            title: 'Your Rides',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.rides}
                color={color}
                name="Your Rides"
                focused={focused}/>
            )
          }}/>
        <Tabs.Screen
          name="find-ride"
          options={{
            title: 'Search',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.search}
                color={color}
                name="Search"
                focused={focused}/>
            )
          }}/>
        <Tabs.Screen
          name="publish-ride"
          options={{
            title: 'Publish',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.add}
                color={color}
                name="Publish"
                focused={focused}/>
            )
          }}/>
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.chat}
                color={color}
                name="Inbox"
                focused={focused}/>
            )
          }}/>
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}/>
            )
          }}/>
      </Tabs>
    </>
  )
}

export default TabsLayout