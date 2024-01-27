import React from 'react';
import { StyleSheet, View } from 'react-native';

const MarginWrapper = (props) => (
    <View style={[styles.wrapperStyle, props.style]}>
        {props.children}
    </View>
);

const styles = StyleSheet.create({
    wrapperStyle: {
        flex: 1,
        width: '100%', // Ensure it takes full width
        height: '100%', // Ensure it takes full height
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
    },
});

export default MarginWrapper;