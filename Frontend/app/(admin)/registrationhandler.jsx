import React, { useState, useEffect, useCallback } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { setAuthHeaders } from "../../utils/expo-store";

const RegistrationHandler = () => {
    const [currentSemester, setCurrentSemester] = useState("Fall 2024");
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState("");

    useEffect(() => {
        setLoading(true); // Show loader
        // Simulating fetching data
        setTimeout(() => {

            setLoading(false); // Hide loader
        }, 1000);
    }, []);

    const fetchStudents = async () => {
        try {
            // Set authorization headers
            await setAuthHeaders(axios);

            // Fetch students
            const resp = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration/student`, { withCredentials: true });

            if (resp.status === 200) {

                setStudents(resp.data.data);
            } else {
                // throw new Error(resp);
            }
        } catch (error) {
            console.log(error.response);
        }
    }

    const toast = useToast();

    useFocusEffect(
        useCallback(() => {

            const fetchRegistrationStatus = async () => {
                try {
                    // Set authorization headers
                    setLoading(true); // Show loader
                    await setAuthHeaders(axios);

                    // Fetch registration status
                    const resp = await axios.get(
                        `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration`,
                        { withCredentials: true }
                    );

                    console.log("Hello", resp);

                    if (resp.status === 200) {
                        setIsRegistrationOpen(true);
                        const formattedDate = new Intl.DateTimeFormat('en-US').format(new Date(resp.data.data.due_date));
                        setSemester(resp.data.data.type_semester + " " + resp.data.data.year);
                        setDueDate(formattedDate);
                    } else {
                        setIsRegistrationOpen(true);
                        console.log(resp);
                    }
                } catch (error) {
                    console.log("Muhammad", error.response)
                    setIsRegistrationOpen(false);
                }
                finally {
                    setLoading(false);
                }
            };

            fetchRegistrationStatus();
            fetchStudents();
        }, []) // Dependencies array
    );
    const handlesubmitregistration = async () => {
        try {
            await setAuthHeaders(axios)
            const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration`, { "start_date": startDate, 'due_date': dueDate }, { withCredentials: true });
            if (resp.status === 201) {
                toast.show("Registration Opened", { type: "success", duration: 6000, offset: 30 });
                setIsRegistrationOpen(true);
            } else {
                throw new Error(resp);
            }
        } catch (error) {
            console.log(error.response);
        }
    }

    const handleExtendDueDate = (studentId) => {
        Alert.alert("Extend Due Date", `Due date extended for student ID: ${studentId}`);
        setModalVisible(false);
    };

    const handleVerifyPayment = (studentId) => {
        setLoading(true);
        const verifyPayment = async () => {
            try {
                await setAuthHeaders(axios);
                const resp = await axios.post(
                    `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration/payment`,
                    { "semester_passenger_id": studentId },
                    { withCredentials: true }
                );

                if (resp.status === 200) {
                    toast.show("Payment Verified", { type: "success", duration: 6000, offset: 30 });
                } else {
                    throw new Error(resp);
                }
            } catch (error) {
                console.log("Hello")
                console.log(error.response);
            };
        }
        verifyPayment();
        fetchStudents();
        setLoading(false);

    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.header}> Ride Registration</Text>
            {!isRegistrationOpen && (
                <View style={styles.registrationForm}>
                    <Text style={styles.formTitle}>Open Registration</Text>

                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity
                        style={styles.datePicker}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {startDate ? startDate.toLocaleDateString() : "Select Start Date"}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Due Date</Text>
                    <TouchableOpacity
                        style={styles.datePicker}
                        onPress={() => setShowDueDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {dueDate ? dueDate.toLocaleDateString() : "Select Due Date"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handlesubmitregistration}
                    >
                        <Text style={styles.submitButtonText} >Open Registration</Text>
                    </TouchableOpacity>

                    {/* Date Pickers */}
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={startDate || new Date()}
                            minimumDate={new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (selectedDate) setStartDate(selectedDate);
                            }}
                        />
                    )}
                    {showDueDatePicker && (
                        <DateTimePicker
                            value={dueDate || new Date()}
                            minimumDate={startDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDueDatePicker(false);
                                if (selectedDate) setDueDate(selectedDate);
                            }}
                        />
                    )}
                </View>
            )}

            {isRegistrationOpen && (
                <>
                    <View className="flex" style={styles.flex}>
                        <View style={styles.semesterBox}>
                            <Text style={styles.semesterText}>Semester: {currentSemester}</Text>
                        </View>
                        {dueDate && <View style={styles.DueDateBox} className="flex">
                            <Text style={styles.semesterText}>Due Date {dueDate}</Text>
                        </View>}
                    </View>
                    <View style={styles.card}>

                        <Text style={styles.cardTitle}>Registered Students</Text>

                        <FlatList
                            data={students}
                            keyExtractor={(item) => item.semester_passenger_id}
                            renderItem={({ item }) => (
                                <View style={styles.studentCard}>
                                    <Text style={styles.studentName}>{item.passenger_id}</Text>
                                    <Text style={styles.paymentStatus}>Payment: {item.is_paid ? 'Paid' : "Unpaid"}</Text>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleVerifyPayment(item.semester_passenger_id)}
                                            disabled={item.is_paid === true}
                                        >
                                            {!item.is_paid && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </>
            )}

            {/* Modal for Extending Due Dates */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Extend Due Date</Text>
                        <TextInput
                            placeholder="Enter new due date"
                            style={styles.input}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => handleExtendDueDate(selectedStudent.id)}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RegistrationHandler;

const styles = StyleSheet.create({
    flex: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "justify-between",
        alignItems: "center",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    semesterBox: {
        backgroundColor: "#4CAF50",
        padding: 8,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    DueDateBox: {
        backgroundColor: "#FF0000",
        padding: 8,
        marginLeft: 5,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    semesterText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    }, dueDateContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    extendButton: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
    },
    extendButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
    },
    openButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },
    openButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        marginVertical: 20,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    studentCard: {
        backgroundColor: "#f0f0f0",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    studentName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    paymentStatus: {
        fontSize: 14,
        color: "#777",
    },
    actions: {
        flexDirection: "row",
    },
    actionButton: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        width: "100%",
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 10,
        flex: 1,
        alignItems: "center",
        marginRight: 5,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "#FF9800",
        padding: 10,
        borderRadius: 10,
        flex: 1,
        alignItems: "center",
        marginLeft: 5,
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    registrationForm: {
        backgroundColor: "#f9f9f9",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        margin: 10,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#333",
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#555",
        marginBottom: 5,
    },
    datePicker: {
        backgroundColor: "#fff",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 14,
        color: "#666",
    },
    submitButton: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
