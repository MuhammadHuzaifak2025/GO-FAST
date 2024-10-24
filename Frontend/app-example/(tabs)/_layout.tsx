import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/Frontend/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-bold text-red-500">Hello Huzaifa</Text>
    </View>
  );
}
