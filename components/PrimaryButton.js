import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Pressable } from 'react-native';

const PrimaryButton = ({ onPress, title, style, textStyle, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, style]}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5A1F85',
        border: '1px solid #5A1F85',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 65,
        width: '100%',
        margin: 5,
    },
    text: {
        color: '#ffffff', // Default text color
        fontSize: 19,
    },
});

export default PrimaryButton;