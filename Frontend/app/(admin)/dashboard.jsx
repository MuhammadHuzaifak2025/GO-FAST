import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { useFocusEffect } from "@react-navigation/native";
import { PieChart,BarChart } from "react-native-chart-kit";
import { Colors } from "../../constants/Colors";
// import { process } from "../../constants";
const DashboardScreen = () => {

  const { width: screenWidth } = useWindowDimensions();

  const [pieData, setPieData] = useState({
    semester_passengers: 0,
    single_ride_passengers: 0,
  });

  const [barData, setBarData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [loadingBar, setLoadingBar] = useState(true);
  const [errorBar, setErrorBar] = useState(null);

  const fetchPieData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/stats/bus_ratio`);
      if (response.status === 200) {
        setPieData(response.data.data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      // console.error('Error fetching pie data:', error);
      setError('Failed to load data. Please try again.');

    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBarData = useCallback(async () => {
    setLoadingBar(true);
    setErrorBar(null);
    
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/stats/seat_left`);
      // console.log(response);
      if (response.status === 200) {
        setBarData(response.data.data.bus);
        // console.log(barData);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      setErrorBar('Failed to load data. Please try again.');
      // console.error('Error fetching pie data:', error);
    } finally {
      setLoadingBar(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPieData();
      fetchBarData();
    }, [])
  );

  const chartData = [
    {
      name: "Semester\nPassengers",
      population: pieData.semester_passengers || 0,
      color: Colors.light.primary,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Single Ride\nPassengers",
      population: pieData.single_ride_passengers || 0,
      color: "#e74c3c",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  let barChartLabels = barData.map((item) => item.bus_id); // Extract bus names as labels
  let barChartData = barData.map((item) => item.seats); // Extract seats as values

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=1000&h=300' }}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.overlay} />
          <Text style={styles.headerText}>Transport Manager</Text>
          <Text style={styles.subHeaderText}>Statistics</Text>
        </ImageBackground>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Bus Passenger Ratio</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#3498db" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.chartWrapper}>
              <PieChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[60, 0]}
                absolute
                hasLegend={false}
                // animate={true} // Enable animation
                // animationDuration={2500}
              />
              <View style={styles.legendContainer}>
                {chartData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.name}: {item.population}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Available Bus Seats</Text>
          {loadingBar ? (
            <ActivityIndicator size="large" color="#3498db" />
          ) : errorBar ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : ( <>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: barChartLabels,
                  datasets: [
                    {
                      data: barChartData,
                    },
                  ],
                }}
                width={screenWidth - 40} // Adjust for padding
                height={250}
                yAxisLabel=""
                yAxisSuffix=" seats"
                chartConfig={{
                  backgroundColor: "#e26a00",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0, // No decimals in seat numbers
                  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Bar color
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  marginRight: 20,
                  // paddingRight: 10
                }}
                fromZero={true} // Ensure the graph starts at 0
                // animate={true} // Enable animation
                // animationDuration={1500} // Duration in milliseconds
                />
              {/* <View style={[styles.legendColor, { backgroundColor: item.color }]} /> */}
            </ScrollView>
            <Text style={styles.legendText}>Bus Number</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={()=> {fetchBarData(); fetchPieData();}}>
          <FontAwesome5 name="sync" size={16} color="#ffffff" />
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollContent: {
    flexGrow: 1,
  },
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
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#7F7F7F',
  },
});

export default DashboardScreen;

