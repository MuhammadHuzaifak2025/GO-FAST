import { TouchableOpacity, Text, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "../constants/Colors";

const CustomButton = ({
    textContent,
    handlePress,
    containerStyles,
    textStyles,
    isLoading,
}) => {
    return (
        <TouchableOpacity
            style={[styles.btt, containerStyles, isLoading && { opacity: 0.5 }]}
            activeOpacity={0.7}
            onPress={handlePress}
            disabled={isLoading}
        >
            <Text style={[styles.text, textStyles]}>{textContent}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btt: {
        backgroundColor: Colors.light.primary,
        minWidth: "100%",
        minHeight: 50,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        borderRadius: 16,
    },
    text: {
        color: "#FFF",
        fontSize: 16,
        fontFamily: "Poppins-Regular",
    },
});

export default CustomButton;
