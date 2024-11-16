import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity,ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
// import { StyleSheet, Text, View, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
const DashboardScreen = () => {
  const actions = [
    { id: '1', name: 'Create Bus', icon: 'bus', onPress: () => console.log('Create Bus') },
    { id: '2', name: 'Verify Student', icon: 'check-circle', onPress: () => router.replace('/verify-student') },
    { id: '3', name: 'Manage Routes', icon: 'map-marked-alt', onPress: () => console.log('Manage Routes') },
    { id: '4', name: 'Reports', icon: 'file-alt', onPress: () => console.log('Reports') },
  ];

  const renderActionItem = ({ item }) => (
    <TouchableOpacity style={styles.actionCard} onPress={item.onPress} activeOpacity={0.7}>
      <FontAwesome5 name={item.icon} size={30} color="#003161" />
      <Text style={styles.actionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=1000&h=300' }}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.overlay} />
        <Text style={styles.headerText}>Transport Manager</Text>
        <Text style={styles.subHeaderText}>Dashboard</Text>
      </ImageBackground>
      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        renderItem={renderActionItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerImage: {
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subHeaderText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  listContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginVertical: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
});