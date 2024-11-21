import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, View, Image, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.8;

const ProfileCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

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
    name: 'John Doe',
    phone: '+1 123 456 7890',
    userId: 'USER12345',
    email: 'john.doe@example.com',
    validity: 'Valid until: 31 Dec 2024',
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={flipCard}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Flip profile card"
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
                colors={['#1a237e', '#283593', '#3949ab']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <View style={styles.profileContainer}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: profileData.userPic }} style={styles.userPic} />
                  </View>
                  <View style={styles.dataContainer}>
                    <Text style={styles.name}>{profileData.name}</Text>
                    <View style={styles.detailsWrapper}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="phone" style={styles.icon} />
                        <Text style={styles.detailText}>{profileData.phone}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="email" style={styles.icon} />
                        <Text style={styles.detailText}>{profileData.email}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="account" style={styles.icon} />
                        <Text style={styles.detailText}>{profileData.userId}</Text>
                      </View>
                    </View>
                    <View style={styles.validityContainer}>
                      <MaterialCommunityIcons name="calendar-check" style={styles.validityIcon} />
                      <Text style={styles.validity}>{profileData.validity}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
            <Animated.View style={[
              styles.card,
              styles.cardBack,
              { opacity: backOpacity, transform: [{ rotateY: backInterpolate }] }
            ]}>
              {/* <LinearGradient
                colors={['#e8eaf6', '#c5cae9', '#9fa8da']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              > */}
              <View style={styles.backContent}>
                <MaterialCommunityIcons name="qrcode" size={200} color="#3949ab" />
                <Text style={styles.backText}>Scan for more details</Text>
              </View>
              {/* </LinearGradient> */}
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginTop: 70,
    alignItems: 'center',
    // backgroundColor: '#f5f5f5',
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    // shadowColor: '#000',
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
    // padding: 20,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  imageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userPic: {
    width: CARD_HEIGHT * 0.5,
    height: CARD_HEIGHT * 0.5,
    borderRadius: CARD_HEIGHT * 0.25,
    borderWidth: 3,
    borderColor: '#fff',
  },
  dataContainer: {
    flex: 1,
    // marginLeft: 20,
  },
  name: {

    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginLeft: 10,
  },
  detailItem: {
    
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    paddingHorizontal: 5,
    fontSize: 14,
    color: '#fff',
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  validity: {
    fontSize: 16,
    color: '#fff',
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
  icon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  validityIcon: {
    fontSize: 14,
    color: '#fff',
    marginRight: 5,
  },
});

export default ProfileCard;

