import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Animated, ScrollView, ActivityIndicator  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome , Ionicons, MaterialIcons } from '@expo/vector-icons';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlashList } from "@shopify/flash-list";
import { Picker } from '@react-native-picker/picker';
import { setAuthHeaders } from '../../utils/expo-store';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';  
import { useToast } from 'react-native-toast-notifications';

const RideItem = ({ from, to, time, username, seats }) => (
  <TouchableOpacity
    activeOpacity={0.8}>

    <LinearGradient
      colors={['black', '#ff6347']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.rideItem}
      >
      <View style={styles.rideHeader}>
        <FontAwesome name="car" size={24} color="#fff" />
        <Text style={styles.usernameText}>{username}</Text>
      </View>
      <Text style={styles.rideText}>From: {from}</Text>
      <Text style={styles.rideText}>To: {to}</Text>
      <Text style={styles.rideTime}>{time}</Text>
      
      <View style={styles.seatsContainer}>
        <Text style={styles.seatText}>Seats Available: </Text>
        {Array.from({ length: seats }).map((_, index) => (
          <MaterialIcons key={index} name="event-seat" size={20} color="#fff" style={styles.seatIcon} />
        ))}
      </View>
    </LinearGradient>

  </TouchableOpacity>
);

const FindRide = () => {

  const [filteredRides, setFilteredRides] = useState([]);
  const [preference, setPreference] = useState({ seats: '', dateTime: '', pickup: '', dropoff: '' });
  const [showFilter, setShowFilter] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDate, setIsDate] = useState(false);  

  const [rides, setRides] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [listEnd, setListEnd] = useState(false);
  const [pageLimit, setPageLimit] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const toast = useToast(); 

  const fetchRides = async () => {

    if(pageCount === 1)
      setIsLoading(true);
    else
      setMoreLoading(true);

    try {
      
      await setAuthHeaders(axios);
      
      // console.log(pageCount,"fetch");
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/rides/${pageCount}/5`);
      
      if (response.status === 200) {
        console.log("page ",pageCount,response.data);
        setPageLimit(response.data.message.totalPages);

        if(pageCount === 1){  
          setRides(response.data.message.rides);
          setFilteredRides(response.data.message.rides);
        }
        else{

          const newRides = response.data.message.rides || []; // Fallback to empty array
          setRides((prevRides) => [...prevRides, ...newRides]);
          setFilteredRides((prevFilteredRides) => [...prevFilteredRides, ...newRides]);
        }

      }
      else {
        throw new Error(response);
      }
    } catch (error) {

        console.log(error.response);

        toast.show('Error fetching rides, please try again later', {
          type: "danger",
          duration: 4000,
          offset: 30,
        animationType: "slide-in",
      });

    }
    finally{
      if(pageCount === 1)
        setIsLoading(false);
      else
        setMoreLoading(false);
    }

  };

  // Function to animate dropdown
  const toggleFilter = () => {
    if (showFilter) {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setShowFilter(!showFilter);
  };

  const animatedHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjusted to fit date picker
  });

  // Function to filter rides based on preferences
  const filterRides = () => {
    const filtered = rides.filter(ride => {
      
      const rideSeats = ride.seat_available;
      const requestedSeats = parseInt(preference.seats, 10);

      return (
        (!requestedSeats || rideSeats >= requestedSeats ) &&
        (!preference.dateTime || ride.start_time === preference.dateTime) && 
        (!preference.pickup || ride.routes[0].route_name === preference.pickup) && 
        (!preference.dropoff || ride.routes[1].route_name === preference.dropoff)
      );
    });
    
    setFilteredRides(filtered);
  };

  const openDateTimePicker = () => {
    setIsDate(true);
    setShowDatePicker(true);
  };

  const onDateChange = (e, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (isDate) {

        setPreference({ ...preference, dateTime: selectedDate });
        setIsDate(false);
        setShowDatePicker(true); // Open time picker next
      } else {

        const newDateTime = new Date(preference.dateTime);
        newDateTime.setHours(selectedDate.getHours());
        newDateTime.setMinutes(selectedDate.getMinutes());
        setPreference({ ...preference, dateTime: newDateTime.toLocaleString() });
      }
    }
  };

  const fetchMoreRides = () => {
    console.log(listEnd,moreLoading,isLoading);

    if(!listEnd && !moreLoading && !isLoading){
      // console.log('more',pageCount);
      setPageCount((p) => p+1);
    }
  };

  // useFocusEffect()
  useEffect(() => {
    
    if(preference.seats || preference.dateTime || preference.pickup || preference.dropoff)
      filterRides();
    
  }, [preference]);

  useEffect(() => {
    // console.log('use',pageCount, pageLimit);
    
    if(pageCount <= pageLimit){
      fetchRides();
    }
    // else{
    //   setListEnd(true);
    // }

    // return () => {
    //   setListEnd(false);

    // };
    
  }, [pageCount]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Rides</Text>
        <TouchableOpacity onPress={toggleFilter} style={styles.filterIcon}>
          <FontAwesome name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Animated Filter Form */}
      <Animated.View style={[styles.filterContainer, { height: animatedHeight, overflow: 'hidden' }]}>
        <ScrollView>

          <View style={styles.picker}>
            <Picker
                selectedValue={preference.seats}
                onValueChange={(e) => setPreference({ ...preference, seats: e })}
                mode="dropdown"
                >
                <Picker.Item label="Select Seats" value= "0" />
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
                <Picker.Item label="5" value="5" /> 
                <Picker.Item label="6" value="6" /> 
            </Picker>
          </View>


          <TouchableOpacity onPress={openDateTimePicker} style={styles.dateTimeField}>
          <Ionicons name = "calendar" size={24} color="black" />
            <Text style={styles.dateTimeText}>
              {preference.dateTime ? preference.dateTime.toLocaleString() : 'Select Date and Time'}
            </Text>
            <TouchableOpacity onPress={() => setPreference({...preference, dateTime : ''})} style={styles.cross}>
              <Ionicons name = "close" size={24} color="black" />
            </TouchableOpacity>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={preference.dateTime || new Date()}
              mode={isDate ? 'date' : 'time'}
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
              maximumDate={new Date().setMonth(new Date().getMonth() + 1)}
            />
          )}

          <FormField
            placeholder="Preferred Pickup Location"
            value={preference.pickup}
            handleChangeText={(e) => setPreference({ ...preference, pickup: e })}
            otherStyles={{marginVertical: 10}}
          />
          <FormField
            placeholder="Preferred Dropoff Location"
            value={preference.dropoff}
            handleChangeText={(e) => setPreference({ ...preference, dropoff: e })}
            otherStyles={{marginBottom: 10}}
          />
          {/* <CustomButton
            textContent="Filter Rides"
            handlePress={filterRides}

          /> */}

        </ScrollView>
      </Animated.View>

      {isLoading ? ( <View style={styles.loadingContainer}>

        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color="#ff6347" />  
        </View>
        ) : (
      <FlashList
        estimatedItemSize={192}
        data={filteredRides}
        keyExtractor={(item) => item.ride_id}
        renderItem={({ item }) => { 

          // if (!item || !item.routes) 
          //   return null;
          return (
            <RideItem 
            from={item.routes[0]?.route_name || 'Unknown'}
            to={item.routes[1]?.route_name || 'Unknown'}
            time={item.start_time || 'Unknown time'}
            // username={item.username || 'Anonymous'}
            seats={item.seat_available || 0}/>
          ) 
        }}
        onEndReached={ fetchMoreRides }    
        onEndReachedThreshold={0.1}
        ListEmptyComponent={() => (
                                    <Text style={styles.subheading}>No rides available, Please try again later</Text>                                   
                                  )}                
        ListFooterComponent={()=> ( <View>
          
          {moreLoading && <ActivityIndicator size="large" color="#ff6347" />}
        </View>
          )}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setListEnd(false);
          setPageCount(1);
          setPreference({ seats: '', dateTime: '', pickup: '', dropoff: '' });
          setRefreshing(false);
        }}
      />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6347', // Changed title color to tomato
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  filterIcon: {
    padding: 10,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 0,
    borderColor: '#ff6347', // Tomato border for the filter container
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f9f9f9', // Light background for the filter section
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideItem: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#ff6347', // Tomato background for ride items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  usernameText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  rideText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  rideTime: {
    fontSize: 14,
    color: '#f8f8f8',
    marginTop: 10,
    fontStyle: 'italic',
  },
  dateTimeField: {
    padding: 10,
    borderColor: '#ff6347', // Tomato border for date/time field
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center', // Center items vertically
    height: 50,
    backgroundColor: '#fff', // White background for date/time field
  },
  dateTimeText: {
    fontSize: 16,
    color: 'black',
    flex: 1, // Allow text to take available space
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  seatIcon: {
    marginRight: 4,
  },
  cross: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  picker: {
    backgroundColor: '#ffffff', // Picker background is white
    color: '#333', // Darker text for better readability
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 0,
    height: 50, // Increased height for better touch target
    borderWidth: 1,
    borderColor: '#ff6347', // Border color set to tomato
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seatText: {
    color: '#fff',
    fontSize: 14,
  },
  subheading : {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Tomato color for the subheading
    marginTop: 20,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  publishButton: {
    backgroundColor: '#ff6347', // Button background set to tomato
    paddingVertical: 15,
    borderRadius: 10,
    // marginTop: 20,
    elevation: 3, // Adding elevation for shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '50%',
    alignSelf: 'center',
  },
  publishButtonText: {
    color: '#ffffff', // Button text color set to white
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FindRide;
