import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const PrimaryInput = ({ style, value, onChangeText, placeholder }) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={[styles.input, style]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
        />
    </View>
);

const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: 65,
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderColor: '#C0C0C0',
        borderRadius: 25,
        borderWidth: 1,
        width: '100%',
        height: 65,
        paddingLeft: 10,
        paddingRight: 10,
        margin: 5,
    },
});

export default PrimaryInput;