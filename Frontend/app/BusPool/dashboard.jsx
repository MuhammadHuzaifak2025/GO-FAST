import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, Text, TouchableOpacity, StyleSheet, View, Image, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { setAuthHeaders } from '../../utils/expo-store';
import { useGlobalContext } from '../../context/GlobalProvider';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.8;

const ProfileCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const [card_details, setCardDetails] = useState({});
  const { user } = useGlobalContext();
  const fetchcarddetails = async () => {
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration/card`, {
        withCredentials: true,
      });
      setCardDetails(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error(error.response);
    }
  };
  const flipCard = () => {
    const toValue = isFlipped ? 0 : 180;

    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const profileData = {
    userPic: 'https://via.placeholder.com/150',
    name: user?.username,
    phone: user?.phone,
    userId: user?.user_id,
    email: user?.email,
    validity: '',
  };
  useFocusEffect(
    useCallback(() => {
      fetchcarddetails();

    }, [])
  );
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={flipCard}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Flip transportation card"
      >
        <View style={styles.cardWrapper}>
          <Animated.View style={[
            styles.cardContainer,
            { transform: [{ perspective: 1000 }] }
          ]}>
            <Animated.View style={[
              styles.card,
              { opacity: frontOpacity, transform: [{ rotateY: frontInterpolate }] }
            ]}>
              <LinearGradient
                colors={card_details?.single_ride === true
                  ? ['#1b5e20', '#2e7d32', '#388e3c']
                  : ['#0d47a1', '#1565c0', '#1976d2']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <View style={styles.cardContent}>
                  <View >
                    <View style={styles.header}>
                      <Text style={[styles.headerText, { textDecorationLine: 'underline' }]}>{card_details?.organization_name} Transport </Text>

                      <MaterialCommunityIcons name="bus" size={24} color="#fff" />
                    </View>
                    <Text style={styles.SubHeader}>Student: {user?.username} </Text>
                  </View>
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="seat-passenger" size={20} color="#fff" />
                      <Text style={styles.detailText}>Bus Id: {card_details?.bus_id}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      {/* <Text style={styles.headerText}>Transportation Card</Text> */}
                      <MaterialCommunityIcons name="identifier" size={20} color="#fff" />
                      <Text style={styles.detailText}>Bus Number:{card_details?.bus_number}</Text>
                    </View>
                    {card_details?.single_ride ? <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="calendar" size={20} color="#fff" />
                      <Text style={styles.detailText}>Created: {formatDate(new Date(card_details?.ride_date))}</Text>
                    </View> :
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={20} color="#fff" />
                        <Text style={styles.detailText}>Validated for : {card_details?.type_semester + ' ' + card_details.year}</Text>
                      </View>}
                  </View>
                  <Text style={styles.slideText}>Slide to see QR code</Text>
                </View>
              </LinearGradient>
            </Animated.View>
            <Animated.View style={[
              styles.card,
              styles.cardBack,
              { opacity: backOpacity, transform: [{ rotateY: backInterpolate }] }
            ]}>
              <View style={styles.backContent}>
                <MaterialCommunityIcons name="qrcode" size={200} color="#3949ab" />
                <Text style={styles.backText}>Scan for more details</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </SafeAreaView >
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    alignItems: 'center',
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  SubHeader: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  slideText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backContent: {
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3949ab',
    marginTop: 10,
  },
});

export default ProfileCard;

