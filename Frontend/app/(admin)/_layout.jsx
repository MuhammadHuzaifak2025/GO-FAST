import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';


// Reusable TabIcon component
const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={styles.tabIconContainer}>
      <LinearGradient
        colors={focused ? ['#FF6B6B', '#FF8E8E'] : ['#F0F0F0', '#F0F0F0']}
        style={styles.iconBackground}
      >
        <FontAwesome5 name={icon} size={20} color={focused ? '#FFF' : '#CDCDE0'} />
      </LinearGradient>
      <Text style={[
        styles.tabLabel,
        { color: color, fontFamily: focused ? 'Poppins-SemiBold' : 'Poppins-Regular' }
      ]}>
        {name}
      </Text>
    </View>
  );
};

const AdminLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#EC5F5F',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: styles.tabBar,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="tachometer-alt"
                color={color}
                name="Dashboard"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create-bus"
          options={{
            title: 'Create Bus',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="bus"
                color={color}
                name="Create Bus"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="verify-student"
          options={{
            title: 'Verify Student',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="camera"
                color={color}
                name="Verify Student"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="routes"
          options={{
            title: 'routes',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="search-location"
                color={color}
                name="Bus Routes"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-profile"
          options={{
            title: 'profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="user"
                color={color}
                name="profile"
                focused={focused}
              />
            ),
          }}
        />

      </Tabs>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    borderTopColor: 'transparent',
    paddingHorizontal: 5,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 5,
    flexDirection: 'column',
    width: 70,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
  },
});

export default AdminLayout;