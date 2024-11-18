import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Dimensions } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import FormField from '../../components/FormField';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useToast } from "react-native-toast-notifications";
import { setAuthHeaders } from '../../utils/expo-store';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlashList } from '@shopify/flash-list';

const RideItem = ({ from, to, time, price, seats, car, id, refreshRides }) => {

  const toast = useToast();

  const handleDelete = async () => {
    Alert.alert(
      "Delete Ride",
      "Are you sure you want to delete this ride?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {

              await setAuthHeaders(axios); // Set authorization headers
              const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/${id}`);

              if (response.status === 200) {
                toast.show('Ride deleted successfully', {
                  type: "success",
                  duration: 4000,
                  offset: 30,
                  animationType: "slide-in",
                });

                if (refreshRides) refreshRides(); // Refresh the rides list if a refresh function is provided
              } else {
                throw new Error(response);
              }
            } catch (error) {
              console.error(error);
              toast.show('Failed to delete ride. Please try again.', {
                type: "danger",
                duration: 4000,
                offset: 30,
                animationType: "slide-in",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['black', '#ff6347']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.rideItem}
    >
      {/* Delete Icon */}
      <TouchableOpacity style={styles.deleteIcon} onPress={handleDelete}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.rideHeader}>
        <FontAwesome name="car" size={24} color="#fff" />
        <Text style={styles.usernameText}>Ride#{id}</Text>
      </View>
      <Text style={styles.rideText}>Starting Location: {from}</Text>
      <Text style={styles.rideText}>Destination: {to}</Text>
      <Text style={styles.rideTime}>Start Date/Time: {time}</Text>
      <Text style={styles.rideText}>Vehicle: {car.color} {car.make} {car.model}</Text>
      <Text style={styles.rideText}>Fare: {price} </Text>
      <View style={styles.seatsContainer}>
        <Text style={styles.seatText}>Seats Available: </Text>
        {Array.from({ length: seats }).map((_, index) => (
          <MaterialIcons
            key={index}
            name="event-seat"
            size={20}
            color="#fff"
            style={styles.seatIcon}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const PublishRide = () => {

  const { height } = Dimensions.get('window');

  const [form, setForm] = useState({
    startingPoint: '', destination: '',
    availableSeats: '', selectedCar: '',
    dateTime: '', price: ''
  });

  const [carOptions, setCarOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxSeats, setMaxSeats] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDate, setIsDate] = useState(false);
  const [isDropdownOpenList, setIsDropdownOpenList] = useState(false);
  const [isDropdownOpenForm, setIsDropdownOpenForm] = useState(true);
  const [dropdownHeightList] = useState(new Animated.Value(0));
  const [dropdownHeightForm] = useState(new Animated.Value(height));
  const [rides, setRides] = useState([]);
  const [loadingF, setLoadingF] = useState(false);
  const toast = useToast();

  useFocusEffect(
    React.useCallback(() => {

      const fetchCarData = async () => {

        try {
          await setAuthHeaders(axios);

          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/vehicles`);
          if (response.status === 200) {

            setCarOptions(response.data.data[1]);
            setLoading(false);
          }
          else {
            throw new Error(response);
          }
        } catch (error) {

          console.log(error);

          toast.show('Error fetching car data, please try again later', {
            type: "danger",
            duration: 4000,
            offset: 30,
            animationType: "slide-in",
          });

          setLoading(false);
        }
      };

      fetchCarData();

      return () => {
        // setLoading(true);
      };
    }, [])
  );

  useEffect(() => {
    if (form.selectedCar) {

      const selected = carOptions.find((car) => car.vehicle_id === form.selectedCar);
      setMaxSeats(selected ? selected.seats : 0);
      setForm({ ...form, availableSeats: '' });
    }
  }, [form.selectedCar]);

  useEffect(() => {

    fetchRides();

  }, []);

  const fetchRides = async () => {

    setLoadingF(true);
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/user`);
      // console.log("Hekki", response)
      if (response.status === 200) {
        console.log("Hekki",response.data.message.rides[0].routes[0].route_name);
        console.log("Hekki",response.data.message.rides[0].routes[1].route_name);
        setRides(response.data.message.rides);
        setLoadingF(false);
      }
      // else {
      //   throw new Error(response);
      // }
    } catch (error) {
      console.log(error);
      toast.show('Error fetching your rides, please try again later', {
        type: "danger",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      });
      setLoadingF(false);
    }
  };

  const handlePublish = async () => {
    if (!form.startingPoint || !form.destination || !form.selectedCar || !form.availableSeats || !form.dateTime || !form.price) {
      toast.show('Please fill all required fields', {
        type: "danger",
        duration: 3000,
      });
      return;
    }
    try {

      await setAuthHeaders(axios);

      const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride`, {
        'vehicle_id': form.selectedCar,
        'route': [{ 'route_name': form.startingPoint, 'longitude': 0, 'latitude': 0 },
        { 'route_name': form.destination, 'longitude': 0, 'latitude': 0 }],
        'seats': form.availableSeats,
        'start_time': form.dateTime,
        'price': form.price,
        'departure_date': form.dateTime
      });

      if (resp.status === 201) {
        toast.show('Ride published successfully', {
          type: "success",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });

        setForm({ startingPoint: { route_name: '' }, destination: { route_name: '' }, availableSeats: '', selectedCar: '', dateTime: '', price: '' });
        fetchRides();
      }
      else {

        throw new Error(resp);
      }

    } catch (error) {

      toast.show('Error publishing ride, please try again later', {
        type: "danger",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    );
  }

  const openDateTimePicker = () => {
    setIsDate(true);
    setShowDatePicker(true);
  };

  const onDateChange = (e, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (isDate) {
        setForm({ ...form, dateTime: selectedDate });
        setIsDate(false);
        setShowDatePicker(true); // Open time picker next
      } else {
        const newDateTime = new Date(form.dateTime);
        newDateTime.setHours(selectedDate.getHours());
        newDateTime.setMinutes(selectedDate.getMinutes());
        setForm({ ...form, dateTime: newDateTime.toLocaleString() });
      }
    }
  };

  const toggleDropdown = (check) => {

    if (check === 'form') {

      const toValue = isDropdownOpenForm ? 0 : height; // Adjust this value based on your needs
      Animated.timing(dropdownHeightForm, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (isDropdownOpenList) {
        toggleDropdown('list');
      }

      setIsDropdownOpenForm(!isDropdownOpenForm);

    }
    else {
      const toValue = isDropdownOpenList ? 0 : 500; // Adjust this value based on your needs

      Animated.timing(dropdownHeightList, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (isDropdownOpenForm) {
        toggleDropdown('form');
      }

      setIsDropdownOpenList(!isDropdownOpenList);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity style={styles.toggleButton} onPress={() => toggleDropdown('form')}>
        <Text style={styles.title}>Publish Ride</Text>
        <Ionicons name={isDropdownOpenForm ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
      </TouchableOpacity>

      <Animated.View style={{ height: dropdownHeightForm, overflow: 'hidden' }}>

        {/* <Text style={styles.title}>Publish a Ride</Text> */}

        <FormField
          placeholder="Starting Point"
          value={form.startingPoint.route_name}
          handleChangeText={(e) => setForm({ ...form, startingPoint: e })}
          otherStyles={{ marginVertical: 5 }}
        />

        <FormField
          placeholder="Destination"
          value={form.destination.route_name}
          handleChangeText={(e) => setForm({ ...form, destination: e })}
          otherStyles={{ marginVertical: 5 }}
        />
        <FormField
          placeholder="Price per seat"
          value={form.price}
          keyboardType="numeric"
          handleChangeText={(e) => setForm({ ...form, price: e })}
          otherStyles={{ marginVertical: 5 }}
        />

        <TouchableOpacity onPress={openDateTimePicker} style={styles.dateTimeField}>
          <Ionicons name="calendar" size={24} color="black" />
          <Text style={styles.dateTimeText}>
            {form.dateTime ? form.dateTime.toLocaleString() : 'Select Date and Time'}
          </Text>
          <TouchableOpacity onPress={() => setForm({ ...form, dateTime: '' })} style={styles.cross}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </TouchableOpacity>

        {showDatePicker && (

          <DateTimePicker
            value={new Date()}
            mode={isDate ? 'date' : 'time'}
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
            maximumDate={new Date().setMonth(new Date().getMonth() + 1)}
          />
        )}

        <Picker
          selectedValue={form.selectedCar}
          onValueChange={(itemValue) => setForm({ ...form, selectedCar: itemValue })}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item label="Select your car" value="" />
          {carOptions.map((car) => (
            <Picker.Item key={car.vehicle_id} label={`${car.color} ${car.make} ${car.model}`} value={car.vehicle_id} />
          ))}

        </Picker>

        <Picker
          selectedValue={form.availableSeats}
          onValueChange={(e) => setForm({ ...form, availableSeats: e })}
          style={styles.picker}
          mode="dropdown"
          enabled={!!form.selectedCar}
        >
          <Picker.Item label="Select available seats" value="" />
          {Array.from({ length: maxSeats }, (_, index) => index + 1).map((seat) => (
            <Picker.Item key={seat} label={`${seat}`} value={seat} />
          ))}
        </Picker>


        <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
          <Text style={styles.publishButtonText}>Publish Ride</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.toggleButton} onPress={() => toggleDropdown('list')}>
        <Text style={styles.title}>Manage Rides</Text>
        <Ionicons name={isDropdownOpenList ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
      </TouchableOpacity>

      <Animated.View style={{ height: dropdownHeightList, overflow: 'hidden', flex: 1 }}>
        {loadingF ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <FlashList
            estimatedItemSize={191}
            data={rides}
            keyExtractor={(item) => item.ride_id}
            renderItem={({ item }) => (
              <RideItem
                id={item.ride_id}
                from={item.routes[1].route_name}
                to={item.routes[1].route_name}
                rides
                time={item.start_time}
                price={item.fare}
                seats={item.seat_available}
                car={item.vehicle}
                refreshRides={fetchRides}
              />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff', // Changed background to white
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6347', // Changed title color to tomato
    textAlign: 'center',
    marginVertical: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: '#ffffff', // Input background is white
    borderRadius: 10,
    color: '#333', // Darker text for better readability
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ff6347', // Border color set to tomato
    elevation: 2, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    backgroundColor: '#ffffff', // Picker background is white
    color: '#333', // Darker text for better readability
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    height: 50, // Increased height for better touch target
    borderWidth: 1,
    borderColor: '#ff6347', // Border color set to tomato
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  publishButton: {
    backgroundColor: '#ff6347', // Button background set to tomato
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3, // Adding elevation for shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  publishButtonText: {
    color: '#ffffff', // Button text color set to white
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Loading container background is white
  },
  loadingText: {
    color: '#ff6347', // Loading text color set to tomato
    marginTop: 10,
    fontSize: 16,
  },
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: '#ff6347', // Tomato border
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#fff', // White background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateTimeText: {
    fontSize: 16,
    color: 'black',
    flex: 1, // Allow text to take available space
    marginLeft: 10,
  },

  cross: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    padding: 15,
    borderRadius: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    marginVertical: 0,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  rideItem: {
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  usernameText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  rideText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  rideTime: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  seatText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  seatIcon: {
    marginHorizontal: 2,
  },
  // dropdownContent: {
  //   marginTop: 10,
  //   padding: 10,
  //   backgroundColor: '#fff',
  //   borderRadius: 10,
  //   elevation: 3,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  // },
});


export default PublishRide;
