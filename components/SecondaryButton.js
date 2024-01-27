import React from 'react';
import PrimaryButton from './PrimaryButton';
import { Text, StyleSheet, Pressable } from 'react-native';

const SecondaryButton = ({ onPress, title, style, textStyle, disabled }) => (
    <PrimaryButton 
        onPress={onPress} 
        disabled={disabled} 
        style={[styles.button, style]}
        title={title}
        textStyle={[styles.text, textStyle]}
    />
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#5A1F85',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 65,
        width: '100%',
        margin: 5,
    },
    text: {
        color: '#5A1F85', // Default text color
        fontSize: 19,
    },
});

export default SecondaryButton;